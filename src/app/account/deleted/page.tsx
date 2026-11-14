import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Account deleted",
  robots: { index: false, follow: false },
};

export default function AccountDeletedPage() {
  return (
    <main id="main-content" className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">
      <div className="rounded-2xl border border-line bg-surface p-8">
        <CheckCircle2 size={28} className="text-success" />
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Your account has been deleted</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          Your login, profile, saved items and sessions are gone, and you are signed out on every
          device. Shared contact details were removed from your enquiries. Reviews and enquiry records
          are kept without your name pending the retention decision, and backups may retain copies for
          a limited period.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          You can register again with the same email if you change your mind; the new account will not
          be linked to the old one.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-full bg-brand-solid px-5 text-sm font-semibold text-white"
          >
            Back to DriverCompass
          </Link>
          <Link
            href="/privacy"
            className="inline-flex min-h-11 items-center rounded-full border border-line-strong px-5 text-sm font-medium"
          >
            Privacy notice
          </Link>
        </div>
      </div>
    </main>
  );
}
