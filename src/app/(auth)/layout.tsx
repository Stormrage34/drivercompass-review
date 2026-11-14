import Link from "next/link";
import { ArrowLeft, BadgeCheck, Lock, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[0.9fr_1.1fr]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-ink focus:shadow-lg"
      >
        Skip to content
      </a>
      <aside className="hero-fade grid-texture relative hidden flex-col justify-between p-10 text-white lg:flex">
        <Logo inverted />
        <div className="max-w-sm">
          <p className="text-[0.7rem] uppercase tracking-[0.16em] text-white/50">Driver-first transport network</p>
          <p className="mt-3 text-3xl font-semibold leading-tight tracking-tight">
            The job search should protect the driver, not the advertiser.
          </p>
          <ul className="mt-8 space-y-4 text-sm text-white/70">
            <li className="flex gap-3">
              <BadgeCheck size={17} className="mt-0.5 shrink-0 text-accent" />
              Verified company identity, separately from vacancy confirmation.
            </li>
            <li className="flex gap-3">
              <ShieldCheck size={17} className="mt-0.5 shrink-0 text-accent" />
              Structured conditions: pay build-up, rotation, home time, accommodation.
            </li>
            <li className="flex gap-3">
              <Lock size={17} className="mt-0.5 shrink-0 text-accent" />
              Private by default. Employers never browse drivers.
            </li>
          </ul>
        </div>
        <p className="text-xs text-white/40">
          Pilot build · demo company data clearly labelled
        </p>
      </aside>

      <main id="main-content" className="flex flex-col px-4 py-6 sm:px-8">
        <div className="flex items-center justify-between">
          <div className="lg:hidden">
            <Logo />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink">
              <ArrowLeft size={13} /> Back to site
            </Link>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </main>
    </div>
  );
}
