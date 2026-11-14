import { describe, expect, it } from "vitest";
import {
  companyProfileSchema,
  registerDriverSchema,
  registerEmployerSchema,
  reviewSchema,
  vacancySchema,
} from "@/lib/validation";

const vacancy = {
  title: "International C+E driver",
  city: "Rotterdam",
  country: "NL",
  contractingEntity: "Audit Transport B.V.",
  transportCategory: "reefer",
  licenceRequirements: "CE",
  experienceRequirements: "",
  contractType: "permanent",
  grossPayMin: 3000,
  grossPayMax: 3500,
  currency: "EUR",
  payPeriod: "month",
  payStructure: "Gross monthly",
  allowances: "",
  workingPattern: "4 weeks on",
  rotation: "4/1",
  homeTime: "One week",
  loadingUnloading: "none",
  accommodation: "provided_free",
  accommodationDetails: "",
  weeklyRest: "Hotel",
  vehicleType: "Tractor unit",
  equipment: "",
  operatingCountries: "NL, DE",
  languagesRequired: "English",
  trainingProvided: "",
  benefits: "",
  applicationMethod: "platform_message",
  applicationUrl: "",
  applicationEmail: "",
  contactName: "",
} as const;

const review = {
  companyId: "8c293863-9f86-4e36-8ad2-aa23987aad2f",
  jobTitle: "Driver",
  employmentStart: "2024-01",
  employmentEnd: "2024-06",
  overallRating: 4,
  title: "A fair review",
  body: "This is a sufficiently long review body describing the employment experience in detail.",
  eligibilityAttested: "on",
  publicationConsent: "on",
} as const;

describe("validation audit", () => {
  it("rejects an inverted pay range", () => {
    const result = vacancySchema.safeParse({ ...vacancy, grossPayMin: 4000, grossPayMax: 3000 });
    expect(result.success).toBe(false);
  });

  it("rejects an external application without a URL and a non-http URL", () => {
    expect(
      vacancySchema.safeParse({ ...vacancy, applicationMethod: "external_link", applicationUrl: "" })
        .success,
    ).toBe(false);
    expect(
      vacancySchema.safeParse({
        ...vacancy,
        applicationMethod: "external_link",
        applicationUrl: "javascript:alert(1)",
      }).success,
    ).toBe(false);
    expect(
      vacancySchema.safeParse({
        ...vacancy,
        applicationMethod: "external_link",
        applicationUrl: "https://apply.example/jobs/1",
      }).success,
    ).toBe(true);
  });

  it("requires and validates an application email when that method is selected", () => {
    expect(
      vacancySchema.safeParse({ ...vacancy, applicationMethod: "email", applicationEmail: "" }).success,
    ).toBe(false);
    expect(
      vacancySchema.safeParse({
        ...vacancy,
        applicationMethod: "email",
        applicationEmail: "not-an-email",
      }).success,
    ).toBe(false);
    expect(
      vacancySchema.safeParse({
        ...vacancy,
        applicationMethod: "email",
        applicationEmail: "jobs@example.test",
      }).success,
    ).toBe(true);
  });

  it("rejects an inverted or future review period", () => {
    expect(
      reviewSchema.safeParse({ ...review, employmentStart: "2024-06", employmentEnd: "2024-01" })
        .success,
    ).toBe(false);
    expect(
      reviewSchema.safeParse({ ...review, employmentStart: "2099-01", employmentEnd: "" }).success,
    ).toBe(false);
    expect(reviewSchema.safeParse(review).success).toBe(true);
  });

  it("rejects a non-http company website", () => {
    const base = {
      legalName: "Audit Transport B.V.",
      tradingName: "",
      country: "NL",
      registrationNumber: "NL-AUDIT-2",
      registeredAddress: "Havenweg 1",
      website: "javascript:alert(1)",
      businessEmail: "hr@example.test",
      phone: "",
      contactPerson: "",
      sectors: "",
      fleetSize: "",
      operatesOwnFleet: false,
      recruitsDirectly: true,
      companyType: "direct_employer",
      contractingEntity: "Audit Transport B.V.",
      description: "",
    };
    expect(companyProfileSchema.safeParse(base).success).toBe(false);
    expect(companyProfileSchema.safeParse({ ...base, website: "https://example.test" }).success).toBe(true);
  });

  it("normalises country and registration number at registration", () => {
    const result = registerEmployerSchema.safeParse({
      displayName: "Audit Employer",
      email: "Audit@Example.Test",
      password: "AuditPass!2026",
      confirmPassword: "AuditPass!2026",
      companyLegalName: "Audit Transport B.V.",
      companyCountry: "nl",
      companyRegistrationNumber: " nl-audit-0001 ",
      companyType: "temporary_staffing",
      companyWebsite: "https://audit.example",
      acceptTerms: "on",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyCountry).toBe("NL");
      expect(result.data.companyRegistrationNumber).toBe("NL-AUDIT-0001");
      expect(result.data.email).toBe("audit@example.test");
    }
  });

  it("rejects a malformed country code and normalises a valid one", () => {
    const base = {
      displayName: "Audit Driver",
      email: "audit-driver@example.test",
      password: "AuditPass!2026",
      confirmPassword: "AuditPass!2026",
      country: "ZZ",
      acceptTerms: "on",
    };
    expect(registerDriverSchema.safeParse(base).success).toBe(false);
    const valid = registerDriverSchema.safeParse({ ...base, country: "bg" });
    expect(valid.success).toBe(true);
    if (valid.success) expect(valid.data.country).toBe("BG");
    expect(vacancySchema.safeParse({ ...vacancy, country: "ZZ" }).success).toBe(false);
  });

  it("rejects unknown company roles", () => {
    const result = registerEmployerSchema.safeParse({
      displayName: "Audit Employer",
      email: "audit@example.test",
      password: "AuditPass!2026",
      confirmPassword: "AuditPass!2026",
      companyLegalName: "Audit Transport B.V.",
      companyCountry: "NL",
      companyRegistrationNumber: "NL-AUDIT-3",
      companyType: "not_a_role",
      companyWebsite: "",
      acceptTerms: "on",
    });
    expect(result.success).toBe(false);
  });
});
