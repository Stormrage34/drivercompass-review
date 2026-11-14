import { describe, expect, it } from "vitest";
import { splitCsv } from "@/lib/parse";

describe("splitCsv", () => {
  it("trims items, drops blanks and preserves order", () => {
    expect(splitCsv(" English, Bulgarian ,, German ")).toEqual(["English", "Bulgarian", "German"]);
  });

  it("returns an empty array for empty and missing values", () => {
    expect(splitCsv("")).toEqual([]);
    expect(splitCsv("   ")).toEqual([]);
    expect(splitCsv(null)).toEqual([]);
    expect(splitCsv(undefined)).toEqual([]);
  });

  it("does not split a single value containing no comma", () => {
    expect(splitCsv("C+E")).toEqual(["C+E"]);
  });
});
