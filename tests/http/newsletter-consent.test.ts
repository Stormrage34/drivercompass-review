import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { newsletterSubscriptions, users } from "@/db/schema";
import { createSessionCookie } from "../helpers/fixtures";
import {
  extractForm,
  httpGet,
  httpPostForm,
  startTestServer,
  stopTestServer,
  type CookieJar,
} from "../helpers/http-server";
import { ensureTestDatabase, truncateAll } from "../helpers/test-db";

function registerForm(email: string): FormData {
  const form = new FormData();
  form.set("displayName", "Newsletter Driver");
  form.set("email", email);
  form.set("password", "Newsletter!2026");
  form.set("confirmPassword", "Newsletter!2026");
  form.set("country", "BG");
  form.set("acceptTerms", "on");
  return form;
}

describe("newsletter consent", () => {
  beforeAll(async () => {
    await ensureTestDatabase();
    await truncateAll();
    await startTestServer();
  });

  afterAll(async () => {
    await stopTestServer();
    await truncateAll();
  });

  it("stores consent only when the optional box is ticked", async () => {
    const optedIn = registerForm("newsletter-in@test.local");
    optedIn.set("newsletterOptIn", "on");
    const page = await httpGet("/register?role=driver");
    const actionFields = extractForm(page.body, "email");
    for (const [key, value] of optedIn.entries()) actionFields.set(key, value);
    await httpPostForm("/register?role=driver", actionFields);

    const [subscriber] = await db
      .select()
      .from(users)
      .where(eq(users.email, "newsletter-in@test.local"));
    const [subscription] = await db
      .select()
      .from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.userId, subscriber.id));
    expect(subscription.status).toBe("subscribed");
    expect(subscription.consentSource).toBe("registration:driver");
    expect(subscription.consentedAt).toBeInstanceOf(Date);

    const noConsent = registerForm("newsletter-out@test.local");
    const page2 = await httpGet("/register?role=driver");
    const fields2 = extractForm(page2.body, "email");
    for (const [key, value] of noConsent.entries()) fields2.set(key, value);
    await httpPostForm("/register?role=driver", fields2);

    const [nonSubscriber] = await db
      .select()
      .from(users)
      .where(eq(users.email, "newsletter-out@test.local"));
    const rows = await db
      .select()
      .from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.userId, nonSubscriber.id));
    expect(rows).toHaveLength(0);
  });

  it("lets the account holder unsubscribe from settings", async () => {
    const [subscriber] = await db
      .select()
      .from(users)
      .where(eq(users.email, "newsletter-in@test.local"));
    const cookie = await createSessionCookie(subscriber.id);
    const jar: CookieJar = new Map([["df_session", cookie.split("=")[1]]]);

    const settings = await httpGet("/dashboard/settings", jar);
    const form = extractForm(settings.body, "newsletterOptIn");
    form.delete("newsletterOptIn");
    const response = await httpPostForm("/dashboard/settings", form, jar);
    expect([200, 303, 307]).toContain(response.status);
    expect(response.body).toContain("unsubscribed from pilot updates");

    const [subscription] = await db
      .select()
      .from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.userId, subscriber.id));
    expect(subscription.status).toBe("unsubscribed");
    expect(subscription.unsubscribedAt).toBeInstanceOf(Date);
  });
});
