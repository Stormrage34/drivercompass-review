"use client";

import { useActionState } from "react";
import { CheckCircle2, KeyRound, Trash2 } from "lucide-react";
import {
  changePasswordAction,
  requestAccountDeletionAction,
  updateNewsletterPreferenceAction,
  type ActionState,
} from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Checkbox, FieldError, Input, Label } from "@/components/ui/field";
import { NEWSLETTER_CONSENT_TEXT } from "@/lib/constants";

export function PasswordForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(changePasswordAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="currentPassword" required>Current password</Label>
        <Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="newPassword" required hint="min. 10 characters">New password</Label>
          <Input id="newPassword" name="newPassword" type="password" autoComplete="new-password" minLength={10} required />
        </div>
        <div>
          <Label htmlFor="confirmPassword" required>Confirm new password</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required />
        </div>
      </div>
      <FieldError>{state?.error}</FieldError>
      {state?.success ? (
        <p className="flex items-center gap-2 text-sm text-success">
          <CheckCircle2 size={14} /> {state.success}
        </p>
      ) : null}
      <Button type="submit" variant="secondary" disabled={pending}>
        <KeyRound size={15} /> {pending ? "Updating…" : "Change password"}
      </Button>
    </form>
  );
}

export function NewsletterForm({ subscribed }: { subscribed: boolean }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateNewsletterPreferenceAction,
    null,
  );

  return (
    <form action={formAction} className="space-y-3">
      <Checkbox
        name="newsletterOptIn"
        defaultChecked={subscribed}
        label={NEWSLETTER_CONSENT_TEXT}
      />
      <FieldError>{state?.error}</FieldError>
      {state?.success ? (
        <p className="flex items-start gap-2 rounded-xl bg-success-soft p-3 text-sm text-success">
          <CheckCircle2 size={15} className="mt-0.5 shrink-0" /> {state.success}
        </p>
      ) : null}
      <Button type="submit" variant="secondary" size="sm" disabled={pending}>
        {pending ? "Saving…" : "Save newsletter preference"}
      </Button>
    </form>
  );
}

export function DeleteAccountForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    requestAccountDeletionAction,
    null,
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="intent" value="request-account-deletion" />
      <div className="rounded-xl border border-danger/20 bg-danger-soft p-4 text-xs leading-relaxed text-ink-soft">
        <p className="font-semibold text-danger">Deletion is confirmed by email.</p>
        <p className="mt-1">
          Nothing is removed when you press the button. We email a single-use link to the registered
          address; opening it shows what will happen, and you confirm there. Deletion then removes your
          login, profile, saved items and sessions, and clears shared contact details from your enquiries.
          Reviews and enquiry records are kept in anonymised form pending the retention decision, and
          backups may retain copies for a limited period.
        </p>
      </div>
      <FieldError>{state?.error}</FieldError>
      {state?.success ? (
        <p className="flex items-start gap-2 rounded-xl bg-success-soft p-3 text-sm text-success">
          <CheckCircle2 size={15} className="mt-0.5 shrink-0" /> {state.success}
        </p>
      ) : null}
      <Button type="submit" variant="danger" disabled={pending}>
        <Trash2 size={15} /> {pending ? "Requesting…" : "Email me a deletion link"}
      </Button>
    </form>
  );
}
