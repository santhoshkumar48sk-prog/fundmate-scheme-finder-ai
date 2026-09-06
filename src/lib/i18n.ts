/**
 * Fundmate — lightweight i18n (no runtime dependency).
 * English is the source of truth; other locales may be partial and fall
 * back to English keys at lookup time. Type-safe keys derived from `en`.
 */

export const LOCALES = ["en", "ta", "hi"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_META: Record<Locale, { label: string; native: string; speech: string }> = {
  en: { label: "English", native: "English", speech: "en-IN" },
  ta: { label: "Tamil", native: "தமிழ்", speech: "ta-IN" },
  hi: { label: "Hindi", native: "हिन्दी", speech: "hi-IN" },
};

type Dict = Record<string, string>;

const en: Dict = {
  "nav.dashboard": "Dashboard",
  "nav.quiz": "Smart Profile",
  "nav.signout": "sign out",
  "dash.greeting.morning": "Good morning",
  "dash.greeting.afternoon": "Good afternoon",
  "dash.greeting.evening": "Good evening",
  "dash.engineOnline": "eligibility engine: online",
  "dash.schemesScored": "scheme(s) scored",
  "dash.need": "need:",
  "dash.opportunities": "potential opportunities for you",
  "dash.hiddenTitle": "Schemes you didn't know you could get",
  "dash.hiddenGem": "hidden gem(s)",
  "dash.readiness": "required docs available",
  "dash.save": "save",
  "dash.saved": "Document checklist saved",
  "dash.improve": "with legitimate actions → potential",
  "dash.bestMatchToday": "best match today",
  "dash.disclaimer": "prototype demo data — confirm details at the linked government portal before applying.",
  "partners.title": "Nearest eligible channel partners",
  "partners.subtitle": "SCA / Bank / NBFC-MFI filtered by your location and their live fund availability",
  "partners.useLocation": "use my location",
  "partners.locating": "locating…",
  "partners.denied": "location unavailable — showing Coimbatore as demo",
  "partners.noPartners": "No partner currently has funds for this scheme amount. Widen your search or raise/lower the loan amount.",
  "partners.fundsAvailable": "funds available",
  "partners.fundsLow": "funds low",
  "partners.exhausted": "funds exhausted",
  "partners.applyNow": "apply here first",
  "partners.away": "away",
  "partners.handles": "handles",
  "partners.directions": "directions",
  "partners.call": "call",
  "partners.fundUtilisation": "fund utilisation",
  "voice.micHint": "or hold the mic and speak your need",
  "voice.listening": "listening…",
  "voice.unsupported": "Voice input isn't supported in this browser — try Chrome or Edge.",
};

const ta: Dict = {
  "dash.greeting.morning": "காலை வணக்கம்",
  "dash.greeting.afternoon": "மதிய வணக்கம்",
  "dash.greeting.evening": "மாலை வணக்கம்",
  "dash.opportunities": "உங்களுக்கான வாய்ப்புகள்",
  "dash.hiddenTitle": "நீங்கள் அறியாத திட்டங்கள்",
  "dash.readiness": "தேவையான ஆவணங்கள் உள்ளன",
  "dash.save": "சேமி",
  "dash.saved": "ஆவண பட்டியல் சேமிக்கப்பட்டது",
  "partners.title": "அருகிலுள்ள அங்கீகாரம் பெற்ற பங்காளர்கள்",
  "partners.subtitle": "உங்கள் இடம் மற்றும் நிதி கிடைக்கும் தன்மையின் அடிப்படையில்",
  "partners.useLocation": "எனது இடத்தைப் பயன்படுத்து",
  "partners.locating": "தேடுகிறது…",
  "partners.fundsAvailable": "நிதி உள்ளது",
  "partners.fundsLow": "நிதி குறைவு",
  "partners.exhausted": "நிதி தீர்ந்தது",
  "partners.applyNow": "முதலில் இங்கே விண்ணப்பிக்கவும்",
  "partners.away": "தூரம்",
  "partners.directions": "வழிகாட்டி",
  "partners.call": "அழை",
  "voice.listening": "கேட்கிறது…",
  "voice.unsupported": "குரல் உள்ளீடு இந்த உலாவியில் ஆதரிக்கப்படவில்லை.",
};

const hi: Dict = {
  "dash.greeting.morning": "सुप्रभात",
  "dash.greeting.afternoon": "नमस्कार",
  "dash.greeting.evening": "शुभ संध्या",
  "dash.opportunities": "आपके लिए संभावित अवसर",
  "dash.hiddenTitle": "आपको नहीं पता थे ऐसी योजनाएँ",
  "dash.readiness": "आवश्यक दस्तावेज़ उपलब्ध",
  "dash.save": "सहेजें",
  "dash.saved": "दस्तावेज़ सूची सहेजी गई",
  "partners.title": "निकटतम प्रमाणित भागीदार",
  "partners.subtitle": "आपके स्थान और निधि उपलब्धता के अनुसार",
  "partners.useLocation": "मेरा स्थान उपयोग करें",
  "partners.locating": "खोज रहे हैं…",
  "partners.fundsAvailable": "निधि उपलब्ध",
  "partners.fundsLow": "निधि कम",
  "partners.exhausted": "निधि समाप्त",
  "partners.applyNow": "पहले यहाँ आवेदन करें",
  "partners.away": "दूर",
  "partners.directions": "मार्गदर्शन",
  "partners.call": "कॉल",
  "voice.listening": "सुन रहे हैं…",
  "voice.unsupported": "इस ब्राउज़र में वॉइस इनपुट उपलब्ध नहीं है.",
};

const DICTS: Record<Locale, Dict> = { en, ta, hi };

export function translate(locale: Locale, key: TKey): string {
  return DICTS[locale][key] ?? en[key] ?? key;
}

/* Type-safe keys: en is the source of truth. */
type EnKeys = keyof typeof en;
export type TKey = EnKeys;
/*  */
