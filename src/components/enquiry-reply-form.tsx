"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { replyToEnquiryAction, type EmployerActionState } from "@/app/employer/actions";
import { Button } from "@/components/ui/button";
import { FieldError, Label, Textarea } from "@/components/ui/field";

export function EnquiryReplyForm({ enquiryId }: { enquiryId: string }) {
  const [state, formAction, pending] = useActionState<EmployerActionState, FormData>(
    replyToEnquiryAction,
    null,
  );
  const router = useRouter();

  useEffect(() => {
    if (state?.success) router.refresh();
  }, [state?.success, router]);

  return (
    <form action={formAction} className="mt-3 rounded-xl border border-line p-4">
      <input type="hidden" name="enquiryId" value={enquiryId} />
      <Label htmlFor={`reply-${enquiryId}`} required>
        Reply to this driver
      </Label>
      <Textarea
        id={`reply-${enquiryId}`}
        name="reply"
        rows={3}
        maxLength={2000}
        required
        placeholder="Answer the question, confirm the next step and keep personal contact details out of the message unless the driver shared them."
      />
      <p className="mt-1 text-xs text-muted">
        Your reply is visible only to this driver and your company. Driver contact details are shown only
        if the driver chose to share them.
      </p>
      <FieldError>{state?.error}</FieldError>
      {state?.success ? (
        <p className="mt-2 rounded-lg bg-success-soft px-3 py-2 text-xs text-success">{state.success}</p>
      ) : null}
      <Button type="submit" size="sm" className="mt-3" disabled={pending}>
        <Send size={14} /> {pending ? "Sending…" : "Send reply"}
      </Button>
    </form>
  );
}
