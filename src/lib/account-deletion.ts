import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  auditLogs,
  companies,
  driverProfiles,
  enquiries,
  newsletterSubscriptions,
  savedCompanies,
  savedVacancies,
  sessions,
  userTokens,
  users,
} from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { hashToken } from "@/lib/token-hash";

export type AccountDeletionResult =
  | { status: "deleted"; userId: string }
  | { status: "invalid" }
  | { status: "employer_with_company" };

/**
 * Consume an account-deletion token and anonymise the account in one
 * transaction.
 *
 * The user row is retained with a non-identifying address so reviews, enquiries
 * and audit history keep a stable reference. Reviews and enquiry bodies are
 * retained pending the counsel decision on review retention (SEC-04); shared
 * contact details are removed. Sessions and profile data are deleted.
 */
export async function finalizeAccountDeletion(token: string): Promise<AccountDeletionResult> {
  if (!token || token.length < 20 || token.length > 200) return { status: "invalid" };

  return db.transaction(async (tx) => {
    const [row] = await tx
      .update(userTokens)
      .set({ consumedAt: new Date() })
      .where(
        and(
          eq(userTokens.tokenHash, hashToken(token)),
          eq(userTokens.purpose, "account_deletion"),
          isNull(userTokens.consumedAt),
          gt(userTokens.expiresAt, new Date()),
        ),
      )
      .returning({ userId: userTokens.userId });

    if (!row) return { status: "invalid" };

    const [user] = await tx
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(eq(users.id, row.userId))
      .limit(1);
    if (!user) return { status: "invalid" };

    if (user.role === "employer") {
      const [company] = await tx
        .select({ id: companies.id })
        .from(companies)
        .where(eq(companies.ownerUserId, user.id))
        .limit(1);
      if (company) return { status: "employer_with_company" };
    }

    const replacementHash = await hashPassword(crypto.randomUUID());

    await tx.delete(driverProfiles).where(eq(driverProfiles.userId, user.id));
    await tx.delete(savedVacancies).where(eq(savedVacancies.userId, user.id));
    await tx.delete(savedCompanies).where(eq(savedCompanies.userId, user.id));
    await tx.delete(newsletterSubscriptions).where(eq(newsletterSubscriptions.userId, user.id));
    await tx
      .update(enquiries)
      .set({ sharedEmail: null, sharedPhone: null, updatedAt: new Date() })
      .where(eq(enquiries.driverUserId, user.id));
    await tx.delete(sessions).where(eq(sessions.userId, user.id));
    await tx.delete(userTokens).where(eq(userTokens.userId, user.id));

    await tx
      .update(users)
      .set({
        email: `deleted+${user.id}@invalid.local`,
        displayName: "Deleted driver",
        passwordHash: replacementHash,
        isActive: false,
        emailVerifiedAt: null,
        suspendedReason: "Account deleted by owner",
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    await tx.insert(auditLogs).values({
      actorUserId: user.id,
      action: "account.deleted",
      entityType: "user",
      entityId: user.id,
      metadata: { anonymized: true, reviewsRetained: true, enquiriesRetained: true },
    });

    return { status: "deleted", userId: user.id };
  });
}
