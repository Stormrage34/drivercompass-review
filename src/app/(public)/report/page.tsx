import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Flag, ShieldOff } from "lucide-react";
import { REPORTS_CLOSED_MESSAGE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Reporting unavailable",
  description: "Content reporting is not open in the DriverCompass pre-launch build.",
};

const BACK_LINKS: Record<string, string> = {
  vacancy: "/jobs",
  company: "/companies",
  review: "/companies",
  message: "/dashboard",
};

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const back = (type && BACK_LINKS[type]) || "/";

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <Link href={back} className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink">
        <ArrowLeft size={13} /> Back
      </Link>

      <div className="mt-4 rounded-2xl border border-line bg-surface p-6 sm:p-8">
        <p className="inline-flex items-center gap-2 rounded-full bg-paper px-3 py-1 text-xs font-medium text-muted">
          <Flag size={12} /> Content report
        </p>
        <h1 className="mt-4 flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <ShieldOff size={20} className="text-muted" /> Reporting is not open
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">{REPORTS_CLOSED_MESSAGE}</p>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          No report form is shown, no reporter name or email is requested, and the moderation queue is
          closed to new public submissions in this build.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/jobs"
            className="inline-flex min-h-11 items-center rounded-full bg-brand-solid px-5 text-sm font-semibold text-white"
          >
            Browse vacancies
          </Link>
          <Link
            href="/privacy"
            className="inline-flex min-h-11 items-center rounded-full border border-line-strong px-5 text-sm font-medium"
          >
            Privacy notice
          </Link>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-muted">
        No email address is offered because no monitored reporting route exists.
      </p>
    </div>
  );
}
