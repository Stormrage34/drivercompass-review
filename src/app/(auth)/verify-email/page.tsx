import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ResendVerificationForm, VerifyEmailForm } from "@/components/auth/email-verification-forms";
import { getCurrentUser } from "@/lib/auth";
import { HOME_BY_ROLE, safeNextPath } from "@/lib/guards";

export const metadata: Metadata = { title: "Confirm your email" };
export const dynamic = "force-dynamic";
export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; sent?: string; required?: string; next?: string }>;
}) {
  const { token, sent, required, next: rawNext } = await searchParams;
  const user = await getCurrentUser();
  const next = safeNextPath(rawNext);
  if (user?.emailVerifiedAt) {
    redirect(next ?? (user.role === "driver" ? "/jobs" : HOME_BY_ROLE[user.role]));
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Confirm your email</h1>
      <p className="mt-2 text-sm text-muted">
        A confirmed email protects your account and unlocks enquiries. Employers also need it to publish vacancies.
      </p>

      {required ? (
        <p className="mt-4 rounded-xl border border-warning/20 bg-warning-soft p-4 text-sm text-ink-soft">
          This area needs a confirmed email. Ask the operator to complete the controlled verification
          procedure, or use the link sent to your registered address.
        </p>
      ) : null}

      <div className="mt-6 space-y-6">
        {token ? (
          <VerifyEmailForm token={token} next={next ?? undefined} />
        ) : (
          <>
            <p className="rounded-xl border border-line bg-paper p-4 text-sm text-ink-soft">
              {sent
                ? "If your account is unverified, check the inbox for the address you registered with. If no message arrives, request a new link. Email delivery may not be enabled during pre-launch, so a link cannot always be sent."
                : "Enter the email address you registered with and we will send a new confirmation link."}
            </p>
            <ResendVerificationForm defaultEmail={user?.email ?? ""} />
          </>
        )}
      </div>

      <p className="mt-8 text-center text-sm text-muted">
        Already confirmed?{" "}
        <Link href="/login" className="font-medium text-brand underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
