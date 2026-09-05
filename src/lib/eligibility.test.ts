import { describe, expect, test } from "bun:test";
import {
  DOC_LIBRARY,
  NEEDS,
  documentReadiness,
  evaluateScheme,
  matchSchemes,
  ratingFor,
  type NeedCategory,
  type Profile,
  type Rule,
  type RuleField,
  type Scheme,
} from "./eligibility";
import { SCHEME_SEED } from "./scheme-data";

/* ------------------------------------------------------------------ */
/* Fixtures                                                            */
/* ------------------------------------------------------------------ */

const DEMO_SBO: Profile = {
  name: "Test Owner",
  age: 30,
  gender: "female",
  category: "SC",
  hasDisability: false,
  state: "Tamil Nadu",
  district: "Coimbatore",
  annualFamilyIncome: 250000,
  monthlyIncome: 20000,
  existingLoan: false,
  assets: "sewing machines",
  financialRequirement: 500000,
  qualification: "12th / HSC",
  firstGraduate: false,
  hasExistingBusiness: true,
  businessType: "retail",
  sector: "Retail & Trade",
  projectCost: 500000,
  investmentRequired: 200000,
  businessExperience: 2,
  isFarmer: false,
  ownsLand: false,
  interestedFarming: false,
  needCategory: "business_loan",
  documents: ["aadhaar", "bank_passbook"],
};

/** Synthetic scheme with predictable weights (total 100). */
const SYNTH: Scheme = {
  id: "synth",
  name: "Synthetic Scheme",
  department: "Test Dept",
  level: "central",
  sector: "Testing",
  tags: ["business_loan", "start_business"],
  summary: "For tests.",
  benefit: "Test benefit.",
  eligibilityText: "Any test profile.",
  documents: ["aadhaar", "income_certificate"],
  applicationRoute: "Test route.",
  officialSource: "Test Source",
  sourceUrl: "https://example.gov.in",
  awareness: "hidden",
  verifiedDate: "2026-08",
  rules: [
    { field: "age", op: "gte", value: 18, weight: 10, when: "18+" },
    {
      field: "annualFamilyIncome",
      op: "lte",
      value: 200000,
      weight: 20,
      when: "income <= 2L",
      fix: "Get an income certificate",
    },
    { field: "category", op: "in", value: ["SC", "ST"], weight: 30, when: "SC/ST" },
    { field: "hasDisability", op: "truthy", weight: 40, when: "has disability" },
  ],
};

function scheme(partial: Partial<Scheme>): Scheme {
  return { ...SYNTH, id: partial.id ?? SYNTH.id, ...partial };
}

/* ------------------------------------------------------------------ */
/* ratingFor thresholds                                                */
/* ------------------------------------------------------------------ */

describe("ratingFor", () => {
  test("maps scores to the documented bands", () => {
    expect(ratingFor(100)).toBe("excellent");
    expect(ratingFor(90)).toBe("excellent");
    expect(ratingFor(89)).toBe("strong");
    expect(ratingFor(75)).toBe("strong");
    expect(ratingFor(74)).toBe("possible");
    expect(ratingFor(55)).toBe("possible");
    expect(ratingFor(54)).toBe("low");
    expect(ratingFor(0)).toBe("low");
  });
});

/* ------------------------------------------------------------------ */
/* evaluateScheme scoring                                              */
/* ------------------------------------------------------------------ */

describe("evaluateScheme", () => {
  test("weights passed rules against total weight and yields potential score", () => {
    const r = evaluateScheme(DEMO_SBO, SYNTH);
    // Pass: age(10) + category(30) = 40 -> 40% (income and disability rules fail)
    expect(r.score).toBe(40);
    // The failing income rule is document-fixable (20) -> potential 60%
    expect(r.potentialScore).toBe(60);
    expect(r.rating).toBe("low");
    expect(r.passed).toHaveLength(2);
    expect(r.failed).toHaveLength(2);
  });

  test("surfaces only legitimate fix suggestions with correct gains", () => {
    const r = evaluateScheme(DEMO_SBO, SYNTH);
    expect(r.suggestions).toHaveLength(1);
    expect(r.suggestions[0]).toEqual({
      text: "Get an income certificate",
      gain: 20,
    });
  });

  test("perfect profile scores 100 / excellent", () => {
    const perfect: Profile = {
      ...DEMO_SBO,
      hasDisability: true,
      annualFamilyIncome: 200000,
    };
    const r = evaluateScheme(perfect, SYNTH);
    expect(r.score).toBe(100);
    expect(r.potentialScore).toBe(100);
    expect(r.rating).toBe("excellent");
    expect(r.suggestions).toHaveLength(0);
  });

  test("scheme with no rules scores 0 (weights fall back to 1)", () => {
    const empty = scheme({ id: "empty", rules: [] });
    const r = evaluateScheme(DEMO_SBO, empty);
    expect(r.score).toBe(0);
    expect(r.rating).toBe("low");
  });

  test("rounds partial scores to integers", () => {
    const third = scheme({
      id: "thirds",
      rules: [
        { field: "age", op: "gte", value: 18, weight: 33, when: "a" },
        { field: "age", op: "gte", value: 21, weight: 33, when: "b" },
        { field: "age", op: "gte", value: 60, weight: 33, when: "c" },
      ],
    });
    const r = evaluateScheme(DEMO_SBO, third);
    expect(r.score).toBe(67); // 66.67 rounded
  });

  test("handles truthy/falsy and nin operators", () => {
    const ops = scheme({
      id: "ops",
      rules: [
        { field: "ownsLand", op: "falsy", weight: 50, when: "landless" },
        { field: "businessType", op: "nin", value: ["startup"], weight: 50, when: "non-startup" },
      ],
    });
    expect(evaluateScheme(DEMO_SBO, ops).score).toBe(100);

    const startupProfile: Profile = { ...DEMO_SBO, businessType: "startup" };
    expect(evaluateScheme(startupProfile, ops).score).toBe(50);
  });
});

/* ------------------------------------------------------------------ */
/* matchSchemes ranking                                                */
/* ------------------------------------------------------------------ */

describe("matchSchemes", () => {
  const a = scheme({
    id: "a",
    tags: ["business_loan"],
    rules: [{ field: "hasExistingBusiness", op: "truthy", weight: 10, when: "existing" }],
  });
  const b = scheme({
    id: "b",
    tags: ["agriculture"],
    rules: [{ field: "hasExistingBusiness", op: "truthy", weight: 10, when: "existing" }],
  });
  const c = scheme({
    id: "c",
    tags: ["business_loan", "start_business"],
    rules: [{ field: "age", op: "gte", value: 99, weight: 10, when: "impossible" }],
  });

  test("keeps only schemes tagged for the user's need, best score first", () => {
    const ranked = matchSchemes(DEMO_SBO, [c, b, a]);
    expect(ranked.map((m) => m.scheme.id)).toEqual(["a", "c"]);
    expect(ranked[0].score).toBe(100);
    expect(ranked[1].score).toBe(0);
  });

  test("falls back to the full catalogue when no scheme matches the need", () => {
    const farmer: Profile = { ...DEMO_SBO, needCategory: "family_benefits" };
    const ranked = matchSchemes(farmer, [a, b, c]);
    expect(ranked).toHaveLength(3);
  });
});

/* ------------------------------------------------------------------ */
/* documentReadiness                                                   */
/* ------------------------------------------------------------------ */

describe("documentReadiness", () => {
  test("unions required docs and computes percentage", () => {
    const s1 = scheme({ id: "d1", documents: ["aadhaar", "income_certificate"] });
    const s2 = scheme({ id: "d2", documents: ["aadhaar", "business_plan"] });
    const r = documentReadiness([s1, s2], ["aadhaar", "income_certificate"]);
    expect(r.required).toEqual(["aadhaar", "income_certificate", "business_plan"]);
    expect(r.available).toEqual(["aadhaar", "income_certificate"]);
    expect(r.missing).toEqual(["business_plan"]);
    expect(r.pct).toBe(67);
  });

  test("no schemes means 100% ready", () => {
    const r = documentReadiness([], []);
    expect(r.required).toHaveLength(0);
    expect(r.pct).toBe(100);
  });
});

/* ------------------------------------------------------------------ */
/* Dataset integrity — the demo catalogue must stay coherent            */
/* ------------------------------------------------------------------ */

describe("SCHEME_SEED integrity", () => {
  const FIELDS: RuleField[] = [
    "age",
    "gender",
    "category",
    "hasDisability",
    "state",
    "annualFamilyIncome",
    "firstGraduate",
    "isFarmer",
    "ownsLand",
    "interestedFarming",
    "hasExistingBusiness",
    "businessType",
    "businessExperience",
    "projectCost",
  ];
  const OPS: Rule["op"][] = ["gte", "gt", "lte", "lt", "eq", "in", "nin", "truthy", "falsy"];
  const NEED_KEYS = NEEDS.map((n) => n.key);

  test("scheme ids and names are unique", () => {
    const ids = SCHEME_SEED.map((s) => s.id);
    const names = SCHEME_SEED.map((s) => s.name);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(names).size).toBe(names.length);
  });

  test("every rule references a known field/op and has positive weight", () => {
    for (const s of SCHEME_SEED) {
      expect(s.rules.length).toBeGreaterThan(0);
      for (const rule of s.rules) {
        expect(FIELDS).toContain(rule.field);
        expect(OPS).toContain(rule.op);
        expect(rule.weight).toBeGreaterThan(0);
        expect(rule.when.length).toBeGreaterThan(0);
        if (rule.op === "in" || rule.op === "nin") {
          expect(Array.isArray(rule.value)).toBe(true);
        }
      }
    }
  });

  test("every document key exists in the DOC_LIBRARY", () => {
    for (const s of SCHEME_SEED) {
      expect(s.documents.length).toBeGreaterThan(0);
      for (const d of s.documents) {
        expect(DOC_LIBRARY[d]).toBeDefined();
      }
    }
  });

  test("every tag is a valid need category", () => {
    for (const s of SCHEME_SEED) {
      for (const t of s.tags) {
        expect(NEED_KEYS).toContain(t as NeedCategory);
      }
    }
  });

  test("all 13 need categories are covered by at least one scheme", () => {
    const covered = new Set(SCHEME_SEED.flatMap((s) => s.tags));
    for (const key of NEED_KEYS) {
      expect(covered.has(key)).toBe(true);
    }
  });

  test("awareness levels and metadata are well-formed", () => {
    for (const s of SCHEME_SEED) {
      expect(["known", "lesser", "hidden"]).toContain(s.awareness);
      expect(s.sourceUrl.startsWith("https://")).toBe(true);
      expect(s.verifiedDate.length).toBeGreaterThan(0);
      if (s.loanWindow) {
        expect(s.loanWindow.min).toBeLessThanOrEqual(s.loanWindow.max);
        expect(s.loanWindow.rate).toBeGreaterThanOrEqual(0);
        expect(s.loanWindow.subsidy).toBeGreaterThanOrEqual(0);
        expect(s.loanWindow.tenureMax).toBeGreaterThan(0);
      }
    }
  });

  test("the hidden-scheme USP has data to show", () => {
    expect(SCHEME_SEED.filter((s) => s.awareness === "hidden").length).toBeGreaterThanOrEqual(5);
    expect(SCHEME_SEED.filter((s) => s.awareness === "lesser").length).toBeGreaterThanOrEqual(5);
  });

  test("engine evaluates every scheme without throwing for the demo SBO profile", () => {
    for (const s of SCHEME_SEED) {
      const r = evaluateScheme(DEMO_SBO, s);
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(100);
      expect(r.potentialScore).toBeGreaterThanOrEqual(r.score);
      expect(r.potentialScore).toBeLessThanOrEqual(100);
    }
  });

  test("a small business owner gets ranked matches for the business_loan need", () => {
    const ranked = matchSchemes(DEMO_SBO, SCHEME_SEED);
    expect(ranked.length).toBeGreaterThan(0);
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1].score).toBeGreaterThanOrEqual(ranked[i].score);
    }
    // The catalogue is designed so a realistic SBO profile matches at least one scheme strongly.
    expect(ranked[0].score).toBeGreaterThanOrEqual(55);
  });
});