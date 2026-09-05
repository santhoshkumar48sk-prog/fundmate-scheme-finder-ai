import { describe, expect, test } from "bun:test";
import { inr, inrCompact, months, pct, years } from "./format";

describe("inr — Indian digit grouping", () => {
  test("formats small, mid and large amounts with lakh/crore grouping", () => {
    expect(inr(0)).toBe("₹0");
    expect(inr(500)).toBe("₹500");
    expect(inr(12345)).toBe("₹12,345");
    expect(inr(250000)).toBe("₹2,50,000");
    expect(inr(25000000)).toBe("₹2,50,00,000");
  });

  test("rounds fractional rupees and keeps the sign", () => {
    expect(inr(1234.6)).toBe("₹1,235");
    expect(inr(-2500)).toBe("-₹2,500");
  });
});

describe("inrCompact — compact amounts", () => {
  test("uses k / L / Cr suffixes", () => {
    expect(inrCompact(500)).toBe("₹500");
    expect(inrCompact(50000)).toBe("₹50k");
    expect(inrCompact(250000)).toBe("₹2.5L");
    expect(inrCompact(2500000)).toBe("₹25L");
    expect(inrCompact(25000000)).toBe("₹2.5Cr");
  });
});

describe("durations and percentages", () => {
  test("singular and plural forms", () => {
    expect(years(1)).toBe("1 year");
    expect(years(5)).toBe("5 years");
    expect(months(1)).toBe("1 month");
    expect(months(6)).toBe("6 months");
  });

  test("pct rounds to integer", () => {
    expect(pct(75.4)).toBe("75%");
    expect(pct(66.7)).toBe("67%");
  });
});