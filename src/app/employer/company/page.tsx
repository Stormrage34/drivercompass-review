import { PageHeader } from "@/components/dashboard-shell";
import { CompanyForm } from "@/components/company-form";
import { NewsletterForm } from "@/components/account-forms";
import { requireEmployerPage } from "@/lib/guards";
import { getCompanyForUser } from "@/lib/queries";
import { VerificationBadge } from "@/components/verification-badge";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { newsletterSubscriptions } from "@/db/schema";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function EmployerCompanyPage() {
  const user = await requireEmployerPage();
  const company = await getCompanyForUser(user.id);
  if (!company) return null;
  const [newsletter] = await db
    .select({ status: newsletterSubscriptions.status })
    .from(newsletterSubscriptions)
    .where(eq(newsletterSubscriptions.userId, user.id))
    .limit(1);

  return (
    <div>
      <PageHeader
        title="Company profile"
        description="What drivers see about your company. Identity fields are checked; operational details are employer-declared."
        action={
          <Link href={`/companies/${company.slug}`} className="text-sm font-medium text-brand underline-offset-4 hover:underline">
            View public profile →
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface px-5 py-3 text-xs text-muted">
        <span>Public URL</span>
        <code className="rounded bg-paper px-2 py-1 text-ink">/companies/{company.slug}</code>
        <span className="ml-auto flex items-center gap-2">
          Status <VerificationBadge status={company.verificationStatus} companyType={company.companyType} verificationVersion={company.verificationVersion} />
        </span>
      </div>

      <CompanyForm company={company} />

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Pilot updates</CardTitle>
        </CardHeader>
        <CardBody>
          <NewsletterForm subscribed={newsletter?.status === "subscribed"} />
        </CardBody>
      </Card>
    </div>
  );
}
