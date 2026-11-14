import Link from "next/link";
import { Download, KeyRound, Mail, ShieldCheck, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard-shell";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonStyles } from "@/components/ui/button";
import { DeleteAccountForm, NewsletterForm, PasswordForm } from "@/components/account-forms";
import { requireDriverPage } from "@/lib/guards";
import { db } from "@/lib/db";
import { newsletterSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireDriverPage();
  const [newsletter] = await db
    .select({ status: newsletterSubscriptions.status })
    .from(newsletterSubscriptions)
    .where(eq(newsletterSubscriptions.userId, user.id))
    .limit(1);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Privacy & account"
        description="Control your data, your visibility and your account. No dark patterns, no retention traps."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldCheck size={16} className="text-brand" /> Your data rights</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-paper p-4">
            <div>
              <p className="text-sm font-medium">Export my data</p>
              <p className="text-xs text-muted">A machine-readable copy of your account, profile, enquiries and reviews.</p>
            </div>
            <a href="/api/me/export" className={buttonStyles("secondary", "sm")} download>
              <Download size={14} /> Download JSON
            </a>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-paper p-4">
            <div>
              <p className="text-sm font-medium">Privacy notice</p>
              <p className="text-xs text-muted">What we process, why, for how long and who receives it.</p>
            </div>
            <Link href="/privacy" className={buttonStyles("ghost", "sm")}>Read notice</Link>
          </div>
          <p className="text-xs leading-relaxed text-muted">
            No privacy contact route is open yet. It will be published before any pilot opens.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Mail size={16} className="text-brand" /> Pilot updates</CardTitle>
        </CardHeader>
        <CardBody>
          <NewsletterForm subscribed={newsletter?.status === "subscribed"} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><KeyRound size={16} className="text-brand" /> Password</CardTitle>
        </CardHeader>
        <CardBody>
          <PasswordForm />
        </CardBody>
      </Card>

      <Card className="border-danger/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-danger"><Trash2 size={16} /> Delete account</CardTitle>
        </CardHeader>
        <CardBody>
          <DeleteAccountForm />
        </CardBody>
      </Card>
    </div>
  );
}
