import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { companies } from "@/db/schema";
import {
  extractForm,
  httpGet,
  httpPostForm,
  startTestServer,
  stopTestServer,
} from "../helpers/http-server";
import { ensureTestDatabase, truncateAll } from "../helpers/test-db";

const ROLES = [
  "direct_employer",
  "recruitment_agency",
  "temporary_staffing",
  "subcontractor",
  "intermediary",
] as const;

describe("all five employer role registrations", () => {
  beforeAll(async () => {
    await ensureTestDatabase();
    await truncateAll();
    await startTestServer();
  });

  afterAll(async () => {
    await stopTestServer();
    await truncateAll();
  });

  it("stores each declared role exactly as selected", async () => {
    for (const [index, role] of ROLES.entries()) {
      const page = await httpGet("/register?role=employer");
      const form = extractForm(page.body, "companyRegistrationNumber");
      form.set("displayName", `Role ${role}`);
      form.set("email", `role-${index}@test.local`);
      form.set("password", "AuditPass!2026");
      form.set("confirmPassword", "AuditPass!2026");
      form.set("companyLegalName", `Role ${role} Transport B.V.`);
      form.set("companyCountry", "nl");
      form.set("companyRegistrationNumber", `role-${index}-nl`);
      form.set("companyType", role);
      form.set("companyWebsite", "");
      form.set("acceptTerms", "on");
      const response = await httpPostForm("/register?role=employer", form);
      expect([200, 303, 307]).toContain(response.status);
    }

    for (const [index, role] of ROLES.entries()) {
      const [company] = await db
        .select({
          companyType: companies.companyType,
          country: companies.country,
          registrationNumber: companies.registrationNumber,
        })
        .from(companies)
        .where(eq(companies.registrationNumber, `ROLE-${index}-NL`));
      expect(company).toEqual({
        companyType: role,
        country: "NL",
        registrationNumber: `ROLE-${index}-NL`,
      });
    }
  });
});
