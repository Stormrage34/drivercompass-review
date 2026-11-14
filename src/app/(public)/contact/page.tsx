import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert, ShieldOff } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description: "DriverCompass is in pre-launch. The contact form and monitored inbox are not open yet.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Contact</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
        DriverCompass is in pre-launch. The contact form and monitored inbox are not open yet, so this page
        does not collect messages or personal data.
      </p>

      <div className="mt-8 rounded-2xl border border-line bg-surface p-6">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <ShieldOff size={16} className="text-muted" /> No contact route is active
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          A monitored contact route will be published before any pilot opens. Until then, nothing sent from
          this page would reach a person, and no address is offered that does not exist.
        </p>
        <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <Link
            href="/how-verification-works"
            className="rounded-xl border border-line px-4 py-3 font-medium text-brand underline-offset-4 hover:underline"
          >
            How verification works →
          </Link>
          <Link
            href="/jobs"
            className="rounded-xl border border-line px-4 py-3 font-medium text-brand underline-offset-4 hover:underline"
          >
            Browse vacancies →
          </Link>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-danger/20 bg-danger-soft p-5 text-xs leading-relaxed text-ink-soft">
        <p className="flex items-center gap-2 text-sm font-semibold text-danger">
          <ShieldAlert size={14} /> Not for emergencies
        </p>
        <p className="mt-2">
          If you are in immediate danger, contact local emergency services. DriverCompass cannot provide
          roadside assistance or legal advice.
        </p>
      </div>
    </div>
  );
}
