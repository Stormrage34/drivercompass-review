import { desc } from "drizzle-orm";
import { Mail, MailOpen } from "lucide-react";
import { PageHeader } from "@/components/dashboard-shell";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireAdminPage } from "@/lib/guards";
import { db } from "@/lib/db";
import { contactMessages } from "@/db/schema";
import { formatDate } from "@/lib/utils";
import { markContactMessageHandledAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  await requireAdminPage();
  const messages = await db
    .select()
    .from(contactMessages)
    .orderBy(desc(contactMessages.createdAt))
    .limit(200);

  return (
    <div>
      <PageHeader
        title="Contact messages"
        description="Messages submitted through the public contact form. These are private to moderators and are not part of any public profile."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Badge tone="info">{messages.length} total</Badge>
        <Badge tone={messages.some((m) => !m.handledAt) ? "warning" : "neutral"}>
          {messages.filter((m) => !m.handledAt).length} open
        </Badge>
      </div>

      {messages.length === 0 ? (
        <Card>
          <CardBody className="py-14 text-center">
            <Mail size={20} className="mx-auto text-muted" />
            <p className="mt-3 text-sm font-semibold">No contact messages</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
              Messages from the public contact form appear here.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => (
            <Card key={message.id}>
              <CardHeader className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>{message.subject}</CardTitle>
                  <p className="mt-1 text-xs text-muted">
                    {message.name} · {message.email} · {formatDate(message.createdAt)}
                  </p>
                </div>
                <Badge tone={message.handledAt ? "success" : "warning"}>
                  {message.handledAt ? "Handled" : "Open"}
                </Badge>
              </CardHeader>
              <CardBody>
                <p className="whitespace-pre-line rounded-xl bg-paper p-4 text-sm leading-relaxed text-ink-soft">
                  {message.message}
                </p>
                {!message.handledAt ? (
                  <form action={markContactMessageHandledAction} className="mt-3">
                    <input type="hidden" name="messageId" value={message.id} />
                    <Button type="submit" variant="secondary" size="sm">
                      <MailOpen size={14} /> Mark handled
                    </Button>
                  </form>
                ) : null}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
