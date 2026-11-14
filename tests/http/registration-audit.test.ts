import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { companies, users } from "@/db/schema";
import {
  extractForm,
  httpGet,
  httpPostForm,
  startTestServer,
  stopTestServer,
} from "../helpers/http-server";
import { ensureTestDatabase, truncateAll } from "../helpers/test-db";

async function registerEmployer(email: string, registrationNumber: string) {
  const page = await httpGet("/register?role=employer");
  const form = extractForm(page.body, "companyRegistrationNumber");
  form.set("displayName", "Audit Employer");
  form.set("email", email);
  form.set("password", "AuditPass!2026");
  form.set("confirmPassword", "AuditPass!2026");
  form.set("companyLegalName", "Audit Transport B.V.");
  form.set("companyCountry", "NL");
  form.set("companyRegistrationNumber", registrationNumber);
  form.set("companyType", "direct_employer");
  form.set("companyWebsite", "https://audit.example");
  form.set("acceptTerms", "on");
  return httpPostForm("/register?role=employer", form);
}

describe("registration audit", () => {
  beforeAll(async () => {
    await ensureTestDatabase();
    await truncateAll();
    await startTestServer();
  });

  afterAll(async () => {
    await stopTestServer();
    await truncateAll();
  });

  it("does not let two accounts claim the same registration number", async () => {
    const first = await registerEmployer("audit-one@test.local", "NL-AUDIT-0001");
    expect([200, 303, 307]).toContain(first.status);
    const second = await registerEmployer("audit-two@test.local", " nl-audit-0001 ");
    expect([200, 303, 307]).toContain(second.status);

    const rows = await db
      .select({ id: companies.id, owner: companies.ownerUserId })
      .from(companies)
      .where(eq(companies.registrationNumber, "NL-AUDIT-0001"));
    expect(rows).toHaveLength(1);
    const secondAccount = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, "audit-two@test.local"));
    expect(secondAccount).toHaveLength(0);
  });
});
