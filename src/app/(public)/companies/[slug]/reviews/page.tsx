import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldOff } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { getCompanyBySlug } from "@/lib/queries";
import { REVIEWS_CLOSED_MESSAGE, REVIEWS_CLOSED_TITLE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);
  if (!company) return { title: "Company not found" };
  return { title: `Driver reviews — ${company.tradingName ?? company.legalName}` };
}

export default async function CompanyReviewsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);
  if (!company || company.verificationStatus === "suspended") notFound();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href={`/companies/${company.slug}`}
        className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink"
      >
        <ArrowLeft size={13} /> Back to {company.tradingName ?? company.legalName}
      </Link>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldOff size={16} className="text-muted" />
            {REVIEWS_CLOSED_TITLE}
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-3 text-sm leading-relaxed text-ink-soft">
          <p>{REVIEWS_CLOSED_MESSAGE}</p>
          <p className="text-xs text-muted">
            Until publication is approved, assess the employer on the structured conditions it declares and
            on the source label attached to each field.
          </p>
          <Link
            href={`/companies/${company.slug}`}
            className="inline-block text-sm font-medium text-brand underline-offset-4 hover:underline"
          >
            View the employer record →
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}
