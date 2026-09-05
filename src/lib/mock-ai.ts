/**
 * YOJANAI — mock AI requirement parser (v1).
 * Deterministic keyword/pattern engine that turns free-text needs into
 * structured requirements. Designed as a swap-in point: the response shape
 * mirrors what a Claude / Gemini / OpenAI call would return, so the action in
 * convex/ai.ts can later be switched to a real LLM without UI changes.
 * Supports English + Tamil.
 */
import type { NeedCategory } from "./eligibility";

export type ParsedNeed = {
  primary: NeedCategory;
  confidence: number; // 0..1
  language: "en" | "ta";
  signals: string[];
  secondary: NeedCategory[];
};

const KEYWORDS: Record<NeedCategory, string[]> = {
  agriculture: ["farm", "agriculture", "crop", "farming", "agri", "விவசாய", "பயிர்", "நிலம்"],
  start_business: ["business", "start", "shop", "enterprise", "venture", "entrepreneur", "தொழில்", "கடை", "வணிக"],
  business_loan: ["loan", "capital", "working capital", "finance", "fund", "credit", "கடன்", "மூலதனம்"],
  higher_education: ["college", "degree", "study", "course", "education", "engineering", "கல்லூரி", "படிப்பு"],
  study_abroad: ["abroad", "overseas", "foreign", "japan", "usa", "uk", "canada", "germany", "வெளிநாடு"],
  housing: ["house", "home", "housing", "rent", "construct", "வீடு", "குடில்"],
  womens_entrepreneurship: ["women", "woman", "mahila", "her", "மகளிர்", "பெண்"],
  disability_support: ["disability", "disabled", "blind", "wheelchair", "differently", "மாற்றுத்திறன்"],
  skill_training: ["training", "skill", "certification", "work skill", "learn a trade", "பயிற்சி", "திறன்"],
  farming_equipment: ["tractor", "machine", "equipment", "irrigation", "pump", "implement", "இயந்திரம்", "பம்பு"],
  financial_assistance: ["assistance", "money", "support", "help", "subsidy", "grant", "பண உதவி", "மானியம்"],
  scholarship: ["scholarship", "stipend", "fee", "merit", "உதவித்தொகை", "கட்டணம்"],
  family_benefits: ["family", "mother", "father", "child", "household", "குடும்ப", "தாய்"],
};

const TAMIL_HINTS = /[\u0B80-\u0BFF]/;

export function mockParseNeed(text: string): ParsedNeed {
  const lowered = text.toLowerCase();
  const isTamil = TAMIL_HINTS.test(text);
  const signals: string[] = [];
  const scores = new Map<NeedCategory, number>();

  for (const [need, words] of Object.entries(KEYWORDS) as [NeedCategory, string[]][]) {
    let hit = 0;
    for (const w of words) {
      if (lowered.includes(w.toLowerCase())) {
        hit += w.length > 6 ? 2 : 1;
        signals.push(w);
      }
    }
    if (hit > 0) scores.set(need, hit);
  }

  const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1]);
  const primary = ranked[0]?.[0] ?? "start_business";
  const secondary = ranked.slice(1, 3).map(([k]) => k);

  return {
    primary,
    confidence: ranked.length > 0 ? Math.min(0.95, 0.45 + ranked[0][1] * 0.15) : 0.3,
    language: isTamil ? "ta" : "en",
    signals: [...new Set(signals)].slice(0, 6),
    secondary,
  };
}

/** Sampled Tamil/English replies the assistant can show for the demo. */
export function parseSummaryNote(parsed: ParsedNeed): string {
  const labels: Record<NeedCategory, string> = {
    agriculture: "Agriculture",
    start_business: "Starting a business",
    business_loan: "Business finance",
    higher_education: "Higher education",
    study_abroad: "Studying abroad",
    housing: "Housing",
    womens_entrepreneurship: "Women entrepreneurship",
    disability_support: "Disability support",
    skill_training: "Skill training",
    farming_equipment: "Farm equipment",
    financial_assistance: "Financial assistance",
    scholarship: "Scholarship",
    family_benefits: "Family benefits",
  };
  if (parsed.language === "ta") {
    return `AI தேடல்: "${labels[parsed.primary]}" — ${Math.round(parsed.confidence * 100)}% உறுதி. அரசு திட்டங்கள் கண்டுபிடிக்கப்பட்டன.`;
  }
  return `AI understood: primary need = "${labels[parsed.primary]}" (${Math.round(parsed.confidence * 100)}% confidence). Searching ${parsed.secondary.length} related areas…`;
}