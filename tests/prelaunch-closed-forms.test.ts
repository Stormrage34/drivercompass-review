import { describe, expect, it } from "vitest";
import { reportContentAction, submitReviewAction } from "@/app/dashboard/actions";
import { respondToReviewAction } from "@/app/employer/actions";
import { contactAction } from "@/app/(auth)/actions";
import { db } from "@/lib/db";
import { contentReports } from "@/db/schema";
import {
  CONTACT_CLOSED_MESSAGE,
  CONTACT_ENABLED,
  REPORTS_CLOSED_MESSAGE,
  REPORTS_ENABLED,
  REVIEWS_CLOSED_MESSAGE,
  REVIEWS_ENABLED,
} from "@/lib/constants";

/**
 * The pre-launch build must reject these at the server boundary, not merely hide
 * the forms. Calling the exported server actions directly is the bypass attempt.
 */
describe("closed pre-launch submissions", () => {
  it("rejects a review submission before authentication or database access", async () => {
    expect(REVIEWS_ENABLED).toBe(false);
    const result = await submitReviewAction(null, new FormData());
    expect(result).toEqual({ error: REVIEWS_CLOSED_MESSAGE });
  });

  it("rejects an employer review response through the same server guard", async () => {
    const result = await respondToReviewAction(null, new FormData());
    expect(result).toEqual({ error: REVIEWS_CLOSED_MESSAGE });
  });

  it("rejects a contact submission without storing personal data", async () => {
    expect(CONTACT_ENABLED).toBe(false);
    const form = new FormData();
    form.set("name", "Test Person");
    form.set("email", "test@example.com");
    form.set("subject", "Subject");
    form.set("message", "A message long enough to pass any client validation.");
    const result = await contactAction(null, form);
    expect(result).toEqual({ error: CONTACT_CLOSED_MESSAGE });
  });

  it("rejects a content report without creating a database record", async () => {
    expect(REPORTS_ENABLED).toBe(false);
    const before = await db.select({ id: contentReports.id }).from(contentReports);

    const form = new FormData();
    form.set("targetType", "company");
    form.set("targetId", "00000000-0000-4000-8000-000000000000");
    form.set("reason", "Misleading information");
    form.set("details", "Reporter email and free text must never be stored by this build.");
    const result = await reportContentAction(null, form);
    expect(result).toEqual({ error: REPORTS_CLOSED_MESSAGE });

    const after = await db.select({ id: contentReports.id }).from(contentReports);
    expect(after.length).toBe(before.length);
  });
});
