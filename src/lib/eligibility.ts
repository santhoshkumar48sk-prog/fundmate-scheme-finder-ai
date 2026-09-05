/**
 * YOJANAI — rule-based eligibility engine.
 * Pure, framework-free module shared between Convex queries and the frontend.
 * Every scheme ships a list of weighted rules; the engine checks a user
 * profile against each rule and produces a transparent match score.
 */

export type NeedCategory =
  | "agriculture"
  | "start_business"
  | "business_loan"
  | "higher_education"
  | "study_abroad"
  | "housing"
  | "womens_entrepreneurship"
  | "disability_support"
  | "skill_training"
  | "farming_equipment"
  | "financial_assistance"
  | "scholarship"
  | "family_benefits";

export const NEEDS: { key: NeedCategory; label: string; blurb: string }[] = [
  { key: "agriculture", label: "Agriculture", blurb: "Farming, land, inputs" },
  { key: "start_business", label: "Start a Business", blurb: "Setup, capital, ideas" },
  { key: "business_loan", label: "Business Loan", blurb: "Working capital, expansion" },
  { key: "higher_education", label: "Higher Education", blurb: "College, courses, fees" },
  { key: "study_abroad", label: "Study Abroad", blurb: "Overseas qualifications" },
  { key: "housing", label: "Housing", blurb: "Home, construction, rent" },
  { key: "womens_entrepreneurship", label: "Women Entrepreneurship", blurb: "Her business, her capital" },
  { key: "disability_support", label: "Disability Support", blurb: "Aids, employment, loans" },
  { key: "skill_training", label: "Skill Training", blurb: "Learn a trade, certify" },
  { key: "farming_equipment", label: "Farming Equipment", blurb: "Machinery, tools, irrigation" },
  { key: "financial_assistance", label: "Financial Assistance", blurb: "Grants, subsidies, aid" },
  { key: "scholarship", label: "Scholarship", blurb: "Fees, stipends, awards" },
  { key: "family_benefits", label: "Family Benefits", blurb: "Household entitlements" },
];

export type Category =
  | "SC"
  | "ST"
  | "OBC"
  | "EBC"
  | "DNT"
  | "General";

export type Gender = "male" | "female" | "other";

/** Profile collected by the Smart Profile quiz (v1: small business owners). */
export type Profile = {
  name?: string;
  age: number;
  gender: Gender;
  category: Category;
  hasDisability: boolean;
  state: string;
  district: string;
  annualFamilyIncome: number; // ₹ / year
  monthlyIncome: number; // ₹ / month
  existingLoan: boolean;
  assets: string;
  financialRequirement: number;
  qualification: string;
  firstGraduate: boolean;
  hasExistingBusiness: boolean;
  businessType: string;
  sector: string;
  projectCost: number;
  investmentRequired: number;
  businessExperience: number; // years
  isFarmer: boolean;
  ownsLand: boolean;
  interestedFarming: boolean;
  needCategory: NeedCategory;
  needDescription?: string;
  documents: string[]; // keys from DOC_LIBRARY
};

export type RuleField =
  | "age"
  | "gender"
  | "category"
  | "hasDisability"
  | "state"
  | "annualFamilyIncome"
  | "firstGraduate"
  | "isFarmer"
  | "ownsLand"
  | "interestedFarming"
  | "hasExistingBusiness"
  | "businessType"
  | "businessExperience"
  | "projectCost";

export type Rule = {
  field: RuleField;
  op: "gte" | "gt" | "lte" | "lt" | "eq" | "in" | "nin" | "truthy" | "falsy";
  value?: number | string | string[] | null;
  weight: number;
  /** Human-readable condition shown in the answer breakdown. */
  when: string;
  /** Legitimate action that could turn this rule green (optional). */
  fix?: string;
};

export type Awareness = "known" | "lesser" | "hidden";

export type Scheme = {
  id: string;
  name: string;
  department: string;
  level: "central" | "state";
  sector: string;
  tags: NeedCategory[];
  summary: string;
  benefit: string;
  loanWindow?: {
    min: number;
    max: number;
    rate: number; // % p.a.
    subsidy: number; // % (0 if none)
    tenureMax: number; // years
  };
  eligibilityText: string;
  documents: string[]; // keys from DOC_LIBRARY
  applicationRoute: string;
  officialSource: string;
  sourceUrl: string;
  helpdesk?: string;
  awareness: Awareness;
  verifiedDate: string;
  rules: Rule[];
};

export type RuleResult = { rule: Rule; pass: boolean };

export type DocStatus = {
  label: string;
  howToObtain: string;
};

/** Master list of documents the platform understands. */
export const DOC_LIBRARY: Record<string, DocStatus> = {
  aadhaar: {
    label: "Aadhaar Card",
    howToObtain: "Download e-Aadhaar on uidai.gov.in or visit the nearest Aadhaar enrolment centre.",
  },
  community_certificate: {
    label: "Community Certificate",
    howToObtain: "Apply through the Tamil Nadu e-Sevai portal (or your state's e-governance portal) — issued by the Revenue Department, free of cost.",
  },
  income_certificate: {
    label: "Income Certificate",
    howToObtain: "Apply online via your state's e-services portal (TN: e-Sevai) or at the local VAO / Taluk office. No fee for below-poverty-line families.",
  },
  bank_passbook: {
    label: "Bank Passbook / Statement",
    howToObtain: "Request a 6-month statement from your bank branch or print it from net banking.",
  },
  business_plan: {
    label: "Business Plan / Project Report",
    howToObtain: "Use the free project report templates on the PMEGP (kviconline) / MUDRA portals, or ask your nearest DIC (District Industries Centre).",
  },
  land_documents: {
    label: "Land Documents (Patta)",
    howToObtain: "Check your Patta / Chitta online via the state land records portal (TN: eservices.tn.gov.in – Patta).",
  },
  education_certificates: {
    label: "Educational Certificates",
    howToObtain: "Request duplicate certificates from your board/college; digital copies are available on DigiLocker.",
  },
  disability_certificate: {
    label: "Disability Certificate",
    howToObtain: "Issued by the District Medical Board through the District Disability Rehabilitation Centre — no private agency needed.",
  },
  caste_certificate: {
    label: "Caste Certificate (for central schemes)",
    howToObtain: "Central caste certificate issued via the state e-Sevai portal / Revenue Department.",
  },
  photo: {
    label: "Passport-size Photo",
    howToObtain: "Available at any photo studio; digital copies can be uploaded.",
  },
  udyam: {
    label: "Udyam (MSME) Registration",
    howToObtain: "Self-register free of charge at udyamregistration.gov.in.",
  },
  gst: {
    label: "GST Registration",
    howToObtain: "Register at gst.gov.in; optional for businesses below ₹40L turnover.",
  },
  seed_stage_pitch: {
    label: "Startup Idea / Pitch Deck",
    howToObtain: "No formal certificate needed — a one-page pitch summary is enough for incubation programmes.",
  },
};

export type SchemeMatch = {
  scheme: Scheme;
  score: number;
  rating: "excellent" | "strong" | "possible" | "low";
  passed: RuleResult[];
  failed: RuleResult[];
  potentialScore: number;
  suggestions: { text: string; gain: number }[];
};

export function ratingFor(score: number): SchemeMatch["rating"] {
  if (score >= 90) return "excellent";
  if (score >= 75) return "strong";
  if (score >= 55) return "possible";
  return "low";
}

function getField(profile: Profile, field: RuleField): number | boolean | string {
  switch (field) {
    case "age":
      return profile.age;
    case "gender":
      return profile.gender;
    case "category":
      return profile.category;
    case "hasDisability":
      return profile.hasDisability;
    case "state":
      return profile.state;
    case "annualFamilyIncome":
      return profile.annualFamilyIncome;
    case "firstGraduate":
      return profile.firstGraduate;
    case "isFarmer":
      return profile.isFarmer;
    case "ownsLand":
      return profile.ownsLand;
    case "interestedFarming":
      return profile.interestedFarming;
    case "hasExistingBusiness":
      return profile.hasExistingBusiness;
    case "businessType":
      return profile.businessType;
    case "businessExperience":
      return profile.businessExperience;
    case "projectCost":
      return profile.projectCost;
  }
}

function compare(actual: number | string | boolean, rule: Rule): boolean {
  const { op, value } = rule;
  switch (op) {
    case "truthy":
      return Boolean(actual);
    case "falsy":
      return !actual;
    case "gte":
      return typeof actual === "number" && typeof value === "number" && actual >= value;
    case "gt":
      return typeof actual === "number" && typeof value === "number" && actual > value;
    case "lte":
      return typeof actual === "number" && typeof value === "number" && actual <= value;
    case "lt":
      return typeof actual === "number" && typeof value === "number" && actual < value;
    case "eq":
      return actual === value;
    case "in":
      return Array.isArray(value) && typeof actual === "string" && value.includes(actual);
    case "nin":
      return Array.isArray(value) && typeof actual === "string" && !value.includes(actual);
    default:
      return false;
  }
}

/** Evaluate a single scheme against a profile. */
export function evaluateScheme(profile: Profile, scheme: Scheme): Omit<SchemeMatch, "scheme"> {
  const results: RuleResult[] = scheme.rules.map((rule) => ({
    rule,
    pass: compare(getField(profile, rule.field), rule),
  }));
  const passed = results.filter((r) => r.pass);
  const failed = results.filter((r) => !r.pass);
  const totalWeight = results.reduce((s, r) => s + r.rule.weight, 0) || 1;
  const passedWeight = passed.reduce((s, r) => s + r.rule.weight, 0);
  const score = Math.round((passedWeight / totalWeight) * 100);

  // Legitimate improvements only: failed rules that document/setup actions can fix.
  const fixableWeight = failed.reduce((s, f) => (f.rule.fix ? s + f.rule.weight : s), 0);
  const suggestions = failed
    .filter((f) => f.rule.fix)
    .map((f) => ({
      text: f.rule.fix as string,
      gain: Math.round((f.rule.weight / totalWeight) * 100),
    }))
    .sort((a, b) => b.gain - a.gain);

  return {
    score,
    rating: ratingFor(score),
    passed,
    failed,
    suggestions,
    potentialScore: Math.min(
      100,
      Math.round(((passedWeight + fixableWeight) / totalWeight) * 100),
    ),
  };
}

/** Document readiness for a list of schemes, given the user's documents. */
export function documentReadiness(
  schemes: Scheme[],
  owned: string[],
): { available: string[]; missing: string[]; pct: number; required: string[] } {
  const required = [...new Set(schemes.flatMap((s) => s.documents))];
  const available = required.filter((d) => owned.includes(d));
  const missing = required.filter((d) => !owned.includes(d));
  const pct = required.length === 0 ? 100 : Math.round((available.length / required.length) * 100);
  return { available, missing, pct, required };
}

/** Rank schemes for a profile. Returns scored matches sorted best-first. */
export function matchSchemes(profile: Profile, schemes: Scheme[]): SchemeMatch[] {
  const relevant = schemes.filter((s) => s.tags.includes(profile.needCategory));
  const pool = relevant.length > 0 ? relevant : schemes;
  return pool
    .map((scheme) => ({ scheme, ...evaluateScheme(profile, scheme) }))
    .sort((a, b) => b.score - a.score);
}