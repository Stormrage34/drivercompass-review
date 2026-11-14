import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DriverRegisterForm } from "@/components/auth/driver-register-form";
import { EmployerRegisterForm } from "@/components/auth/employer-register-form";
import { getCurrentUser } from "@/lib/auth";
import { HOME_BY_ROLE, safeNextPath } from "@/lib/guards";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Create an account" };
export const dynamic = "force-dynamic";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; next?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect(HOME_BY_ROLE[user.role]);

  const { role, next: rawNext } = await searchParams;
  const isEmployer = role === "employer";
  const next = safeNextPath(rawNext) ?? undefined;
  const withNext = (href: string) => (next ? `${href}&next=${encodeURIComponent(next)}` : href);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        {isEmployer ? "Register your transport company" : "Create your driver account"}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {isEmployer
          ? "Add your legal entity, publish structured vacancies and receive direct enquiries."
          : "Compare employer records, keep control of your profile and contact employers directly."}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-1 rounded-full border border-line bg-surface p-1 text-sm">
        <Link
          href={withNext("/register?role=driver")}
          className={cn(
            "rounded-full px-4 py-2 text-center font-medium transition",
            !isEmployer ? "bg-brand-solid text-white" : "text-ink-soft hover:bg-paper",
          )}
        >
          I am a driver
        </Link>
        <Link
          href={withNext("/register?role=employer")}
          className={cn(
            "rounded-full px-4 py-2 text-center font-medium transition",
            isEmployer ? "bg-brand-solid text-white" : "text-ink-soft hover:bg-paper",
          )}
        >
          I am an employer
        </Link>
      </div>

      <div className="mt-6">
        {isEmployer ? <EmployerRegisterForm next={next} /> : <DriverRegisterForm next={next} />}
      </div>
      {!isEmployer ? (
        <p className="mt-3 text-center text-xs text-muted">
          About 1 minute · No CV or documents required · Email verification needed to enquire
        </p>
      ) : null}

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
