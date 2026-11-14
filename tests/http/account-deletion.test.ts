import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomBytes } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { auditLogs, driverProfiles, driverReviews, enquiries, newsletterSubscriptions, sessions, userTokens, users } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { hashToken } from "@/lib/token-hash";
import { issueUserToken } from "@/lib/user-tokens";
import {
  createCompany,
  createSessionCookie,
  createUser,
  createVacancy,
} from "../helpers/fixtures";
import {
  extractForm,
  httpGet,
  httpPostForm,
  startTestServer,
  stopTestServer,
  type CookieJar,
} from "../helpers/http-server";
import { ensureTestDatabase, truncateAll } from "../helpers/test-db";

function jarFrom(cookie: string): CookieJar {
  return new Map([["df_session", cookie.split("=")[1]]]);
}

async function confirmForm(token: string): Promise<FormData> {
  const page = await httpGet(`/account/delete/confirm?token=${encodeURIComponent(token)}`);
  const form = extractForm(page.body, "token");
  form.set("token", token);
  return form;
}

describe("driver account deletion", () => {
  let cookie: CookieJar;
  let driverId: string;
  let reviewId: string;
  let deletionToken: string;
  const password = "DeletionTest!2026";

  beforeAll(async () => {
    await ensureTestDatabase();
    await truncateAll();
    await startTestServer();

    driverId = await createUser("driver", "deletion-driver@test.local", {
      passwordHash: await hashPassword(password),
      displayName: "Deletion Driver",
    });
    await db.insert(driverProfiles).values({ userId: driverId, firstName: "Deletion" });
    const employerId = await createUser("employer", "deletion-employer@test.local");
    const company = await createCompany({
      ownerUserId: employerId,
      slug: "deletion-company",
      legalName: "Deletion Company B.V.",
    });
    const vacancy = await createVacancy({
      companyId: company.id,
      createdByUserId: employerId,
      slug: "deletion-test-vacancy",
      status: "published_unverified",
    });
    await db.insert(enquiries).values({
      vacancyId: vacancy.id,
      companyId: company.id,
      driverUserId: driverId,
      message: "Enquiry with shared contact.",
      sharedEmail: "deletion-driver@test.local",
      sharedPhone: "+311****6789",
    });
    const [review] = await db
      .insert(driverReviews)
      .values({
        companyId: company.id,
        driverUserId: driverId,
        employmentStart: "2024-01-01",
        employmentEnd: "2024-12-31",
        overallRating: 4,
        title: "Deletion review title",
        body: "A review that must survive account anonymization for moderation history.",
        status: "published",
        publishedAt: new Date(),
      })
      .returning({ id: driverReviews.id });
    reviewId = review.id;

    await db.insert(newsletterSubscriptions).values({
      userId: driverId,
      email: "deletion-driver@test.local",
      consentVersion: "test",
      consentSource: "test",
      consentedAt: new Date(),
    });

    cookie = jarFrom(await createSessionCookie(driverId));
  });

  afterAll(async () => {
    await stopTestServer();
    await truncateAll();
  });

  it("requests deletion by email without deleting anything", async () => {
    const page = await httpGet("/dashboard/settings", cookie);
    expect(page.status).toBe(200);
    const form = extractForm(page.body, "intent");
    const response = await httpPostForm("/dashboard/settings", form, cookie);
    expect([200, 303, 307]).toContain(response.status);
    expect(response.body).toContain("Check the inbox for this account");

    const [account] = await db.select().from(users).where(eq(users.id, driverId));
    expect(account.isActive).toBe(true);
    expect(account.email).toBe("deletion-driver@test.local");

    const tokens = await db
      .select()
      .from(userTokens)
      .where(and(eq(userTokens.userId, driverId), eq(userTokens.purpose, "account_deletion")));
    expect(tokens.length).toBeGreaterThan(0);
  });

  it("does not delete when the emailed link is only opened", async () => {
    const issued = await issueUserToken(driverId, "account_deletion");
    deletionToken = issued.token;

    const page = await httpGet(
      `/account/delete/confirm?token=${encodeURIComponent(deletionToken)}`,
    );
    expect(page.status).toBe(200);
    expect(page.body).toContain("What happens when you confirm");

    const [account] = await db.select().from(users).where(eq(users.id, driverId));
    expect(account.isActive).toBe(true);
    expect(account.email).toBe("deletion-driver@test.local");
  });

  it("rejects an invalid token without touching the account", async () => {
    const response = await httpPostForm("/account/delete/confirm", await confirmForm("x".repeat(40)));
    expect([200, 303, 307]).toContain(response.status);
    expect(response.location ?? "").toContain("error=invalid");

    const [account] = await db.select().from(users).where(eq(users.id, driverId));
    expect(account.isActive).toBe(true);
  });

  it("confirms deletion once, anonymises the account and keeps review history", async () => {
    const response = await httpPostForm("/account/delete/confirm", await confirmForm(deletionToken));
    expect([200, 303, 307]).toContain(response.status);
    expect(response.location ?? "").toMatch(/\/account\/deleted/);

    const done = await httpGet("/account/deleted");
    expect(done.status).toBe(200);
    expect(done.body).toContain("Your account has been deleted");

    const [account] = await db.select().from(users).where(eq(users.id, driverId));
    expect(account.email).toMatch(/^deleted\+.*@invalid\.local$/);
    expect(account.displayName).toBe("Deleted driver");
    expect(account.isActive).toBe(false);
    expect(account.emailVerifiedAt).toBeNull();

    const profiles = await db.select().from(driverProfiles).where(eq(driverProfiles.userId, driverId));
    expect(profiles).toHaveLength(0);

    const enquiryRows = await db.select().from(enquiries).where(eq(enquiries.driverUserId, driverId));
    expect(enquiryRows[0]?.sharedEmail).toBeNull();
    expect(enquiryRows[0]?.sharedPhone).toBeNull();

    const [review] = await db.select().from(driverReviews).where(eq(driverReviews.id, reviewId));
    expect(review).toBeTruthy();
    expect(review.driverUserId).toBe(driverId);

    const remainingSessions = await db.select().from(sessions).where(eq(sessions.userId, driverId));
    expect(remainingSessions).toHaveLength(0);

    const newsletter = await db
      .select()
      .from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.userId, driverId));
    expect(newsletter).toHaveLength(0);

    const [audit] = await db
      .select()
      .from(auditLogs)
      .where(and(eq(auditLogs.action, "account.deleted"), eq(auditLogs.entityId, driverId)));
    expect(audit).toBeTruthy();
    expect(audit.metadata).toMatchObject({ anonymized: true });

    const after = await httpGet("/dashboard/applications", cookie);
    expect([302, 303, 307]).toContain(after.status);
    expect(after.location).toMatch(/^\/login/);
  });

  it("refuses unauthenticated access to account settings", async () => {
    const page = await httpGet("/dashboard/settings");
    expect([302, 303, 307]).toContain(page.status);
    expect(page.location).toMatch(/^\/login/);
  });

  it("rate-limits repeated deletion requests per account", async () => {
    const rateDriver = await createUser("driver", "rate-limit-deletion@test.local");
    const rateCookie = jarFrom(await createSessionCookie(rateDriver));
    const page = await httpGet("/dashboard/settings", rateCookie);
    const form = extractForm(page.body, "intent");

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const response = await httpPostForm("/dashboard/settings", form, rateCookie);
      expect(response.body).toContain("Check the inbox for this account");
    }

    const blocked = await httpPostForm("/dashboard/settings", form, rateCookie);
    expect(blocked.body).toContain("Too many deletion requests");

    const [account] = await db.select().from(users).where(eq(users.id, rateDriver));
    expect(account.isActive).toBe(true);
  });

  it("does not echo the token in the confirmation response", async () => {
    const echoDriver = await createUser("driver", "echo-deletion@test.local");
    const issued = await issueUserToken(echoDriver, "account_deletion");
    const response = await httpPostForm("/account/delete/confirm", await confirmForm(issued.token));
    expect([200, 303, 307]).toContain(response.status);
    expect(response.body).not.toContain(issued.token);
  });

  it("rejects replay of the used token", async () => {
    const response = await httpPostForm("/account/delete/confirm", await confirmForm(deletionToken));
    expect([200, 303, 307]).toContain(response.status);
    expect(response.location ?? "").toContain("error=invalid");

    const [account] = await db.select().from(users).where(eq(users.id, driverId));
    expect(account.isActive).toBe(false);
  });

  it("rejects an expired token for another account", async () => {
    const otherId = await createUser("driver", "expired-deletion@test.local");
    const expired = `expired_${randomBytes(16).toString("hex")}`;
    await db.insert(userTokens).values({
      userId: otherId,
      purpose: "account_deletion",
      tokenHash: hashToken(expired),
      expiresAt: new Date(Date.now() - 60_000),
    });

    const response = await httpPostForm("/account/delete/confirm", await confirmForm(expired));
    expect([200, 303, 307]).toContain(response.status);
    expect(response.location ?? "").toContain("error=invalid");

    const [account] = await db.select().from(users).where(eq(users.id, otherId));
    expect(account.isActive).toBe(true);
  });
});
