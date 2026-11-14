import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, ShieldAlert } from "lucide-react";
import { confirmAccountDeletionAction } from "../actions";

export const metadata: Metadata = {
  title: "Confirm account deletion",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  invalid: "This deletion link is invalid, expired or has already been used. Request a new link from account settings.",
  company: "This employer account still owns a company profile. Transfer or close the company before deleting the account.",
};

export default async function ConfirmAccountDeletionPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;
  const errorMessage = error ? ERRORS[error] ?? ERRORS.invalid : null;
  const hasToken = typeof token === "string" && token.length >= 20 && token.length <= 200;

  return (
    <main id="main-content" className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
      <Link
        href="/dashboard/settings"
        className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink"
      >
        <ArrowLeft size={13} /> Back to account settings
      </Link>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Delete your account</h1>

      {errorMessage ? (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-danger/25 bg-danger-soft p-5 text-sm text-ink-soft">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-danger" />
          <p>{errorMessage}</p>
        </div>
      ) : null}

      {!hasToken ? (
        <div className="mt-6 rounded-2xl border border-line bg-surface p-6 text-sm leading-relaxed text-ink-soft">
          <p className="flex items-center gap-2 font-semibold text-ink">
            <ShieldAlert size={16} className="text-muted" /> No confirmation link
          </p>
          <p className="mt-2">
            Open the link from the email we sent. Opening a link never deletes anything by itself; you
            confirm on this page.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 rounded-2xl border border-line bg-surface p-6 text-sm leading-relaxed text-ink-soft">
            <p className="font-semibold text-ink">What happens when you confirm</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>Your login, profile, saved items and sessions are removed.</li>
              <li>Shared email and phone are cleared from your enquiries.</li>
              <li>Reviews and enquiry records are kept in anonymised form pending the retention decision.</li>
              <li>Backups may retain copies for a limited period.</li>
              <li>This action cannot be undone.</li>
            </ul>
          </div>

          <form action={confirmAccountDeletionAction} className="mt-6">
            <input type="hidden" name="token" value={token} />
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-danger px-6 text-sm font-semibold text-white hover:opacity-90"
            >
              Delete my account permanently
            </button>
          </form>
        </>
      )}
    </main>
  );
}
