import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { companies, contactMessages, contentReports, driverReviews, reviewResponses } from "@/db/schema";
import { createCompany, createSessionCookie, createUser } from "../helpers/fixtures";
import {
  extractForm,
  httpGet,
  httpPostForm,
  startTestServer,
  stopTestServer,
  type CookieJar,
} from "../helpers/http-server";
import { ensureTestDatabase, truncateAll } from "../helpers/test-db";

function jarFrom(cookie: string): CookieJar {
  return new Map([["df_session", cookie.split("=")[1]]]);
}

async function publishedReview(companyId: string, driverId: string, title: string, start = "2024-01-01") {
  const [review] = await db
    .insert(driverReviews)
    .values({
      companyId,
      driverUserId: driverId,
      employmentStart: start,
      employmentEnd: "2024-06-01",
      overallRating: 4,
      title,
      body: "A complete, moderated review body used to test the employer response boundary.",
      status: "published",
      eligibilityAttested: true,
      publishedAt: new Date(),
    })
    .returning({ id: driverReviews.id });
  return review.id;
}

describe("employer review response boundaries", () => {
  let employerCookie: CookieJar;
  let unverifiedCookie: CookieJar;
  let adminCookie: CookieJar;
  let companyId: string;
  let unverifiedCompanyId: string;
  let driverId: string;

  beforeAll(async () => {
    await ensureTestDatabase();
    await truncateAll();
    await startTestServer();

    const employerId = await createUser("employer", "audit-review-employer@test.local");
    const unverifiedId = await createUser("employer", "audit-review-unverified@test.local", {
      emailVerifiedAt: null,
    });
    driverId = await createUser("driver", "audit-review-driver@test.local");
    const adminId = await createUser("admin", "audit-review-admin@test.local");
    const company = await createCompany({
      ownerUserId: employerId,
      slug: "audit-review-company",
      legalName: "Audit Review Company B.V.",
    });
    const unverified = await createCompany({
      ownerUserId: unverifiedId,
      slug: "audit-review-unverified",
      legalName: "Audit Unverified Company B.V.",
    });
    companyId = company.id;
    unverifiedCompanyId = unverified.id;
    employerCookie = jarFrom(await createSessionCookie(employerId));
    unverifiedCookie = jarFrom(await createSessionCookie(unverifiedId));
    adminCookie = jarFrom(await createSessionCookie(adminId));
  });

  afterAll(async () => {
    await stopTestServer();
    await truncateAll();
  });

  it("closes review replies for a verified, active employer", async () => {
    const reviewId = await publishedReview(companyId, driverId, "Active response");
    const page = await httpGet("/employer/reviews", employerCookie);
    expect(page.status).toBe(200);
    expect(page.body).toContain("Driver reviews are not open yet");
    expect(page.body).not.toContain('name="reviewId"');
    const rows = await db
      .select()
      .from(reviewResponses)
      .where(eq(reviewResponses.reviewId, reviewId));
    expect(rows).toHaveLength(0);
  });

  it("keeps review replies closed while the company is suspended", async () => {
    const reviewId = await publishedReview(companyId, driverId, "Suspended response", "2023-01-01");
    await db
      .update(companies)
      .set({ suspendedAt: new Date(), suspensionReason: "Audit suspension" })
      .where(eq(companies.id, companyId));

    const page = await httpGet("/employer/reviews", employerCookie);
    expect(page.status).toBe(200);
    expect(page.body).toContain("Driver reviews are not open yet");
    expect(page.body).not.toContain('name="reviewId"');

    const rows = await db
      .select()
      .from(reviewResponses)
      .where(eq(reviewResponses.reviewId, reviewId));
    expect(rows).toHaveLength(0);
  });

  it("shows contact messages to an administrator and marks one handled", async () => {
    const [message] = await db
      .insert(contactMessages)
      .values({
        name: "Audit Contact",
        email: "audit-contact@test.local",
        subject: "Audit contact message",
        message: "A contact message that must be visible to an administrator.",
      })
      .returning({ id: contactMessages.id });

    const page = await httpGet("/admin/messages", adminCookie);
    expect(page.status).toBe(200);
    expect(page.body).toContain("Audit contact message");
    const form = extractForm(page.body, "messageId");
    form.set("messageId", message.id);
    const response = await httpPostForm("/admin/messages", form, adminCookie);
    expect([200, 303, 307]).toContain(response.status);
    const [stored] = await db
      .select({ handledAt: contactMessages.handledAt })
      .from(contactMessages)
      .where(eq(contactMessages.id, message.id));
    expect(stored.handledAt).toBeInstanceOf(Date);
  });

  it("keeps public reporting closed and stores no report", async () => {
    const fakeId = "00000000-0000-4000-8000-000000000000";
    const page = await httpGet(`/report?type=company&id=${fakeId}`);
    expect(page.status).toBe(200);
    expect(page.body).toContain("Reporting is not open");
    expect(page.body).not.toContain('name="details"');
    const rows = await db.select().from(contentReports);
    expect(rows).toHaveLength(0);
  });

  it("keeps review replies closed for an unverified employer", async () => {
    const reviewId = await publishedReview(unverifiedCompanyId, driverId, "Unverified response");
    const page = await httpGet("/employer/reviews", unverifiedCookie);
    expect(page.status).toBe(200);
    expect(page.body).toContain("Driver reviews are not open yet");
    expect(page.body).not.toContain('name="reviewId"');
    const rows = await db
      .select()
      .from(reviewResponses)
      .where(eq(reviewResponses.reviewId, reviewId));
    expect(rows).toHaveLength(0);
  });
});
