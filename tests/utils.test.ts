import { describe, expect, it } from "vitest";
import { formatPayRange } from "@/lib/utils";

describe("formatPayRange", () => {
  it("shows a range only when the maximum is above the minimum", () => {
    const range = formatPayRange(2800, 3200, "EUR", "per month");
    expect(range).toContain("2,800");
    expect(range).toContain("3,200");
    expect(range).toContain("–");
  });

  it("shows a single figure when minimum equals maximum", () => {
    const single = formatPayRange(3000, 3000, "EUR", "per month");
    expect(single).toContain("3,000");
    expect(single).not.toContain("–");
  });

  it("never renders a negative range from legacy data", () => {
    const legacy = formatPayRange(2800, 0, "EUR", "per month");
    expect(legacy).toContain("From");
    expect(legacy).toContain("2,800");
    expect(legacy).not.toContain("–");
    expect(legacy).not.toContain("€0");
  });

  it("handles missing figures", () => {
    expect(formatPayRange(null, null, "EUR", "per month")).toBe("Pay not disclosed");
  });
});
