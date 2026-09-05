import { describe, expect, test } from "bun:test";
import { mockParseNeed, parseSummaryNote } from "./mock-ai";

describe("mockParseNeed", () => {
  test("extracts a business-loan need from English free text", () => {
    const r = mockParseNeed(
      "I need a business loan to buy machines for my tailoring shop",
    );
    expect(r.primary).toBe("business_loan");
    expect(r.secondary).toContain("start_business");
    expect(r.language).toBe("en");
    expect(r.confidence).toBeGreaterThan(0.5);
    expect(r.signals.length).toBeGreaterThan(0);
  });

  test("maps Tamil text to agriculture and tags the language", () => {
    const r = mockParseNeed("எனக்கு விவசாயம் செய்ய ஆர்வம் இருக்கு. ஆனால் நிலம் இல்லை.");
    expect(r.primary).toBe("agriculture");
    expect(r.language).toBe("ta");
  });

  test("mixed language still resolves the primary need", () => {
    const r = mockParseNeed("business loan வேண்டும்");
    expect(r.primary).toBe("business_loan");
    expect(r.language).toBe("ta");
    expect(r.secondary).toContain("start_business");
  });

  test("falls back to start_business with low confidence on unrelated text", () => {
    const r = mockParseNeed("hello world how are you");
    expect(r.primary).toBe("start_business");
    expect(r.confidence).toBe(0.3);
    expect(r.signals).toHaveLength(0);
  });

  test("deduplicates signals and caps the list", () => {
    const r = mockParseNeed("loan loan loan for my farm business");
    const unique = new Set(r.signals);
    expect(unique.size).toBe(r.signals.length);
    expect(r.signals.length).toBeLessThanOrEqual(6);
  });
});

describe("parseSummaryNote", () => {
  test("renders a readable English summary", () => {
    const parsed = mockParseNeed("I need a scholarship for college fees");
    const note = parseSummaryNote(parsed);
    expect(note).toContain("Scholarship");
    expect(note).toMatch(/\d+%/);
  });

  test("renders a Tamil summary for Tamil input", () => {
    const parsed = mockParseNeed("விவசாயம்");
    expect(parseSummaryNote(parsed)).toContain("AI தேடல்");
  });
});