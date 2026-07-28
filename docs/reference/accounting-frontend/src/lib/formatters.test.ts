import { describe, it, expect } from "vitest";
import { formatAmount } from "@/lib/formatters";

describe("formatAmount", () => {
  it("returns '-' for null", () => {
    expect(formatAmount(null)).toBe("-");
  });

  it("returns '-' for undefined", () => {
    expect(formatAmount(undefined)).toBe("-");
  });

  it("formats 0 as '0,00 kr'", () => {
    expect(formatAmount(0)).toBe("0,00 kr");
  });

  it("formats 1000 with non-breaking space as thousand separator", () => {
    // Swedish locale uses \u00a0 (non-breaking space) for thousands
    expect(formatAmount(1000)).toBe("1\u00a0000,00 kr");
  });

  it("formats negative amounts", () => {
    // Swedish locale uses Unicode minus U+2212 (−), not ASCII hyphen (-)
    expect(formatAmount(-500)).toBe("\u2212500,00 kr");
  });

  it("rounds to exactly 2 decimal places", () => {
    const result = formatAmount(1000.505);
    // Matches e.g. "1 000,50 kr" or "1 000,51 kr" — must have 2 decimal digits
    expect(result).toMatch(/,\d{2} kr$/);
  });

  it("treats SEK as default currency (appends kr)", () => {
    expect(formatAmount(1000, "SEK")).toBe("1\u00a0000,00 kr");
  });

  it("appends foreign currency code instead of kr", () => {
    expect(formatAmount(1000, "USD")).toBe("1\u00a0000,00 USD");
  });

  it("treats empty string currency as default (appends kr)", () => {
    // Empty string is falsy — same branch as no currency
    expect(formatAmount(1000, "")).toBe("1\u00a0000,00 kr");
  });
});
