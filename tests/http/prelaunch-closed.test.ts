import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createSessionCookie, createUser } from "../helpers/fixtures";
import { httpGet, startTestServer, stopTestServer, type CookieJar } from "../helpers/http-server";
import { ensureTestDatabase, truncateAll } from "../helpers/test-db";

describe("pre-launch closed surfaces", () => {
  let driverCookie: CookieJar;

  beforeAll(async () => {
    await ensureTestDatabase();
    await truncateAll();
    await startTestServer();
    const driverId = await createUser("driver", "closed-forms@test.local");
    const cookie = await createSessionCookie(driverId);
    driverCookie = new Map([["df_session", cookie.split("=")[1]]]);
  });

  afterAll(async () => {
    await stopTestServer();
  });

  it("renders the closed review state and no submission form", async () => {
    const page = await httpGet("/dashboard/reviews/new", driverCookie);
    expect(page.status).toBe(200);
    expect(page.body).toContain("Driver reviews are not open yet");
    expect(page.body).not.toContain('name="companyId"');
    expect(page.body).not.toContain("Submit for moderation");
  });

  it("renders the closed contact state and no message form", async () => {
    const page = await httpGet("/contact");
    expect(page.status).toBe(200);
    expect(page.body).toContain("No contact route is active");
    expect(page.body).not.toContain('name="message"');
  });

  it("renders the closed report state and no report form", async () => {
    const page = await httpGet("/report?type=company&id=00000000-0000-4000-8000-000000000000");
    expect(page.status).toBe(200);
    expect(page.body).toContain("Reporting is not open");
    expect(page.body).not.toContain('name="details"');
    expect(page.body).not.toContain("Submit report");
  });
});
