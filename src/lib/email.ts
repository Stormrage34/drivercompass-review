import type { User } from "@/db/schema";

export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

export type EmailDeliveryResult =
  | { delivered: true; provider: string }
  | { delivered: false; provider: string; reason: "disabled" | "delivery_failed" };

export interface EmailProvider {
  name: string;
  send(message: EmailMessage): Promise<void>;
}

const testOutbox: EmailMessage[] = [];

/** Test-only outbox. Never called by application code or admin surfaces. */
export const testEmailProvider: EmailProvider = {
  name: "test",
  async send(message) {
    testOutbox.push(message);
  },
};

export function getTestEmailOutbox(): readonly EmailMessage[] {
  return testOutbox;
}

export function clearTestEmailOutbox(): void {
  testOutbox.length = 0;
}

const disabledEmailProvider: EmailProvider = {
  name: "disabled",
  async send() {
    throw new Error("EMAIL_DELIVERY_DISABLED");
  },
};

/**
 * Resend HTTP adapter. Credentials and the verified sender live in the
 * environment; without both the provider reports "disabled" rather than
 * silently accepting mail. No message content or token is logged here.
 */
const resendProvider: EmailProvider = {
  name: "resend",
  async send(message) {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    const from = process.env.EMAIL_FROM?.trim();
    if (!apiKey || !from) throw new Error("RESEND_NOT_CONFIGURED");

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          authorization: `Bearer ${apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [message.to],
          subject: message.subject,
          text: message.text,
          html: message.html,
        }),
        signal: AbortSignal.timeout(10_000),
      });
      if (response.ok) return;
      const retryable = response.status === 429 || response.status >= 500;
      if (!retryable || attempt === 1) {
        throw new Error(`RESEND_${response.status}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  },
};

/**
 * Provider selection is deliberately explicit. There is no production adapter
 * until a provider, DPA and processing location have been chosen.
 */
export function getEmailProvider(): EmailProvider {
  const configured = (process.env.EMAIL_PROVIDER ?? "").trim().toLowerCase();
  if (configured === "disabled") return disabledEmailProvider;
  if (configured === "resend") {
    if (!process.env.RESEND_API_KEY?.trim() || !process.env.EMAIL_FROM?.trim()) {
      return disabledEmailProvider;
    }
    return resendProvider;
  }
  if (configured === "test") {
    // The memory adapter is safe for tests and local harnesses only. Refuse it
    // in production unless the application explicitly points at a local base URL.
    if (process.env.NODE_ENV !== "production") return testEmailProvider;
    if (!process.env.APP_BASE_URL?.trim()) return disabledEmailProvider;
    return isLocalBaseUrl() ? testEmailProvider : disabledEmailProvider;
  }
  if (process.env.NODE_ENV === "test") return testEmailProvider;
  return disabledEmailProvider;
}

function isLocalBaseUrl(): boolean {
  try {
    const host = new URL(appBaseUrl()).hostname;
    return host === "localhost" || host === "127.0.0.1" || host === "::1";
  } catch {
    return false;
  }
}

export function appBaseUrl(): string {
  return (process.env.APP_BASE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function layout(title: string, paragraphs: string[], action: { label: string; url: string }): string {
  const body = paragraphs.map((p) => `<p style="margin:0 0 16px">${escapeHtml(p)}</p>`).join("");
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:24px;background:#f6f5f1;font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#0a1a2a">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e5e1;border-radius:12px;padding:28px">
      <p style="margin:0 0 24px;font-size:13px;letter-spacing:0.02em;color:#0a1a2a">
        <span style="display:inline-block;width:10px;height:10px;background:#e8a33d;border-radius:2px;margin-right:8px"></span>
        <strong>DriverCompass</strong>
      </p>
      <h1 style="margin:0 0 20px;font-size:22px;line-height:1.3">${escapeHtml(title)}</h1>
      ${body}
      <p style="margin:24px 0">
        <a href="${escapeHtml(action.url)}" style="display:inline-block;background:#0a1a2a;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:600">${escapeHtml(action.label)}</a>
      </p>
      <p style="margin:0;font-size:12px;color:#61707f">If the button does not work, copy this address into your browser:<br>${escapeHtml(action.url)}</p>
      <p style="margin:24px 0 0;padding-top:16px;border-top:1px solid #e2e5e1;font-size:12px;color:#61707f">
        DriverCompass — know the employer, choose your next move.
      </p>
    </div>
  </body>
</html>`;
}

export function verificationEmail(user: Pick<User, "email" | "displayName">, token: string): EmailMessage {
  const url = `${appBaseUrl()}/verify-email?token=${encodeURIComponent(token)}`;
  return {
    to: user.email,
    subject: "Confirm your email address",
    text: `Hello ${user.displayName},\n\nConfirm your email address to unlock enquiries and, for employers, vacancy publishing. This link expires in 24 hours.\n\n${url}\n\nIf you did not create this account, ignore this email.`,
    html: layout(
      "Confirm your email address",
      [
        `Hello ${user.displayName},`,
        "Confirm your email address to unlock enquiries and, for employers, vacancy publishing. This link expires in 24 hours.",
        "If you did not create this account, ignore this email.",
      ],
      { label: "Confirm email", url },
    ),
  };
}

export function accountDeletionEmail(user: Pick<User, "email" | "displayName">, token: string): EmailMessage {
  const url = `${appBaseUrl()}/account/delete/confirm?token=${encodeURIComponent(token)}`;
  return {
    to: user.email,
    subject: "Confirm account deletion",
    text: `Hello ${user.displayName},\n\nYou asked to delete your DriverCompass account. Nothing has been deleted yet. Open this link to review what will be removed, then confirm. The link expires in 1 hour and can be used once.\n\n${url}\n\nIf you did not request this, ignore this email; your account stays active.`,
    html: layout(
      "Confirm account deletion",
      [
        `Hello ${user.displayName},`,
        "You asked to delete your DriverCompass account. Nothing has been deleted yet.",
        "Open the link to review what will be removed, then confirm. It expires in 1 hour and can be used once.",
        "If you did not request this, ignore this email; your account stays active.",
      ],
      { label: "Review and confirm deletion", url },
    ),
  };
}

export function passwordResetEmail(user: Pick<User, "email" | "displayName">, token: string): EmailMessage {
  const url = `${appBaseUrl()}/reset-password?token=${encodeURIComponent(token)}`;
  return {
    to: user.email,
    subject: "Reset your password",
    text: `Hello ${user.displayName},\n\nUse this link to choose a new password. It expires in 1 hour and can be used once. Resetting your password signs out every active session.\n\n${url}\n\nIf you did not request this, ignore this email; your password stays unchanged.`,
    html: layout(
      "Reset your password",
      [
        `Hello ${user.displayName},`,
        "Use this link to choose a new password. It expires in 1 hour and can be used once. Resetting your password signs out every active session.",
        "If you did not request this, ignore this email; your password stays unchanged.",
      ],
      { label: "Choose a new password", url },
    ),
  };
}

/**
 * Generic reply alert. Deliberately carries no message contents and no contact
 * details; the driver reads the reply after signing in.
 */
export function enquiryReplyEmail(
  user: Pick<User, "email" | "displayName">,
  companyName: string,
): EmailMessage {
  const url = `${appBaseUrl()}/dashboard/applications`;
  return {
    to: user.email,
    subject: "An employer replied to your enquiry",
    text: `Hello ${user.displayName},\n\n${companyName} has replied to your enquiry on DriverCompass. Sign in to read the reply.\n\n${url}\n\nFor your privacy, this email does not include the message or any contact details.`,
    html: layout(
      "An employer replied to your enquiry",
      [
        `Hello ${user.displayName},`,
        `${companyName} has replied to your enquiry on DriverCompass. Sign in to read the reply.`,
        "For your privacy, this email does not include the message or any contact details.",
      ],
      { label: "Read the reply", url },
    ),
  };
}

/**
 * Generic vacancy reconfirmation reminder. The employer signs in to confirm;
 * no driver data or vacancy content is included.
 */
export function vacancyReconfirmationEmail(
  user: Pick<User, "email" | "displayName">,
  vacancyTitle: string,
): EmailMessage {
  const url = `${appBaseUrl()}/employer/vacancies`;
  return {
    to: user.email,
    subject: "Confirm your vacancy is still open",
    text: `Hello ${user.displayName},\n\nThe vacancy "${vacancyTitle}" is due for its 30-day reconfirmation. Sign in and confirm it is still open, or it will be marked stale and then expire.\n\n${url}`,
    html: layout(
      "Confirm your vacancy is still open",
      [
        `Hello ${user.displayName},`,
        `The vacancy "${vacancyTitle}" is due for its 30-day reconfirmation. Sign in and confirm it is still open, or it will be marked stale and then expire.`,
      ],
      { label: "Review vacancies", url },
    ),
  };
}

export async function sendAccountEmail(message: EmailMessage): Promise<EmailDeliveryResult> {
  const provider = getEmailProvider();
  if (provider.name === "disabled") {
    return { delivered: false, provider: provider.name, reason: "disabled" };
  }
  try {
    await provider.send(message);
    return { delivered: true, provider: provider.name };
  } catch {
    return { delivered: false, provider: provider.name, reason: "delivery_failed" };
  }
}
