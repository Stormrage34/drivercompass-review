import Link from "next/link";
import { ArrowLeft, ShieldOff } from "lucide-react";
import { PageHeader } from "@/components/dashboard-shell";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { requireDriverPage } from "@/lib/guards";
import { REVIEWS_CLOSED_MESSAGE, REVIEWS_CLOSED_TITLE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function NewReviewPage() {
  await requireDriverPage();

  return (
    <div>
      <Link
        href="/dashboard/reviews"
        className="mb-3 inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink"
      >
        <ArrowLeft size={13} /> Back to my reviews
      </Link>
      <PageHeader title={REVIEWS_CLOSED_TITLE} description="Reviews are planned, not open." />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldOff size={16} className="text-muted" /> Submission closed
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-3 text-sm leading-relaxed text-ink-soft">
          <p>{REVIEWS_CLOSED_MESSAGE}</p>
          <p className="text-xs text-muted">
            When reviews open, submissions will require a verified account, a stated employment period and
            moderation before anything is published.
          </p>
          <Link
            href="/jobs"
            className="inline-block text-sm font-medium text-brand underline-offset-4 hover:underline"
          >
            Browse vacancies →
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}
