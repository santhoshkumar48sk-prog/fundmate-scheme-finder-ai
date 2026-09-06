/**
 * Fundmate — authorized channel partners (prototype data).
 *
 * Partner types:
 *  - SCA       State Channel Agency (regional facilitation hub)
 *  - BANK      Public/private bank branch handling scheme lending
 *  - NBFC-MFI  Micro-finance institution with scheme-linked credit lines
 *
 * Each partner carries geo coordinates (for nearest-partner ranking and the
 * Leaflet/OpenStreetMap view) and a current-FY fund ledger in ₹ lakh. A partner
 * is only "fund-eligible" for a user when its uncommitted balance can cover the
 * requested loan amount. In production this ledger syncs from the bank/NBFC;
 * here it is realistic demo data.
 */

export type PartnerType = "SCA" | "BANK" | "NBFC-MFI";

export type Partner = {
  id: string;
  name: string;
  type: PartnerType;
  address: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  phone: string;
  /** Scheme ids (from scheme-data.ts) this partner can process. */
  schemeIds: string[];
  /** Current-FY fund ledger, in ₹ lakh. */
  funds: {
    allocated: number;
    utilized: number;
    /** Committed to in-flight applications — reduces available headroom. */
    pipeline: number;
  };
};

export const PARTNERS: Partner[] = [
  {
    id: "sca-cbe",
    name: "TN SCA — Coimbatore Hub",
    type: "SCA",
    address: "SIDCO Complex, Thadagam Road, GCT Signal",
    district: "Coimbatore",
    state: "Tamil Nadu",
    lat: 11.0183,
    lng: 76.9674,
    phone: "+91 422 111 0101",
    schemeIds: ["pmegp", "vishwakarma", "mudra", "cgtmse", "pudhumai_penn", "standup"],
    funds: { allocated: 450, utilized: 310, pipeline: 60 },
  },
  {
    id: "bank-sbi-cbe",
    name: "SBI Main Branch — Coimbatore",
    type: "BANK",
    address: "701, Cross Cut Road, Gandhipuram",
    district: "Coimbatore",
    state: "Tamil Nadu",
    lat: 11.0168,
    lng: 76.9558,
    phone: "+91 422 111 0102",
    schemeIds: ["pmegp", "mudra", "standup", "cgtmse", "education-loan"],
    funds: { allocated: 900, utilized: 640, pipeline: 120 },
  },
  {
    id: "nbfc-cbe",
    name: "MFI Partner — Bharat Microfinance, Coimbatore",
    type: "NBFC-MFI",
    address: "22, Avinashi Road, Peelamedu",
    district: "Coimbatore",
    state: "Tamil Nadu",
    lat: 11.0268,
    lng: 77.0396,
    phone: "+91 422 111 0103",
    schemeIds: ["mudra", "vishwakarma", "standup"],
    funds: { allocated: 220, utilized: 150, pipeline: 20 },
  },
  {
    id: "sca-mdu",
    name: "TN SCA — Madurai Hub",
    type: "SCA",
    address: "TC-1, Anna Nagar Main Road",
    district: "Madurai",
    state: "Tamil Nadu",
    lat: 9.9252,
    lng: 78.1198,
    phone: "+91 452 111 0104",
    schemeIds: ["pmegp", "vishwakarma", "mudra", "tahdco", "mannin_magal", "standup"],
    funds: { allocated: 380, utilized: 210, pipeline: 40 },
  },
  {
    id: "bank-canara-mdu",
    name: "Canara Bank — Madurai Main",
    type: "BANK",
    address: "108, West Veli Street",
    district: "Madurai",
    state: "Tamil Nadu",
    lat: 9.9195,
    lng: 78.1193,
    phone: "+91 452 111 0105",
    schemeIds: ["pmegp", "mudra", "standup", "cgtmse"],
    funds: { allocated: 500, utilized: 480, pipeline: 15 },
  },
  {
    id: "nbfc-mdu",
    name: "MFI Partner — Sakthi Finance Micro, Madurai",
    type: "NBFC-MFI",
    address: "45, KK Nagar Avenue",
    district: "Madurai",
    state: "Tamil Nadu",
    lat: 9.9395,
    lng: 78.1218,
    phone: "+91 452 111 0106",
    schemeIds: ["mudra", "vishwakarma", "tahdco"],
    funds: { allocated: 160, utilized: 95, pipeline: 15 },
  },
  {
    id: "sca-che",
    name: "TN SCA — Chennai Hub",
    type: "SCA",
    address: "Chepauk Palace Annexe, Anna Salai",
    district: "Chennai",
    state: "Tamil Nadu",
    lat: 13.0732,
    lng: 80.2609,
    phone: "+91 44 111 0107",
    schemeIds: ["pmegp", "mudra", "standup", "tahdco", "nos", "pudhumai_penn"],
    funds: { allocated: 700, utilized: 520, pipeline: 90 },
  },
  {
    id: "bank-iob-che",
    name: "Indian Overseas Bank — Royapettah, Chennai",
    type: "BANK",
    address: "31, Westcott Road, Royapettah",
    district: "Chennai",
    state: "Tamil Nadu",
    lat: 13.0562,
    lng: 80.2655,
    phone: "+91 44 111 0108",
    schemeIds: ["pmegp", "mudra", "education-loan", "cgtmse"],
    funds: { allocated: 420, utilized: 300, pipeline: 45 },
  },
  {
    id: "sca-salem",
    name: "TN SCA — Salem Hub",
    type: "SCA",
    address: "Housing Board Unit, Fairlands",
    district: "Salem",
    state: "Tamil Nadu",
    lat: 11.6643,
    lng: 78.146,
    phone: "+91 427 111 0109",
    schemeIds: ["pmegp", "vishwakarma", "mudra", "mannin_magal"],
    funds: { allocated: 260, utilized: 140, pipeline: 25 },
  },
  {
    id: "nbfc-salem",
    name: "MFI Partner — Salem Agri Micro Credit",
    type: "NBFC-MFI",
    address: "12, Sarada College Road",
    district: "Salem",
    state: "Tamil Nadu",
    lat: 11.662,
    lng: 78.145,
    phone: "+91 427 111 0110",
    schemeIds: ["mudra", "kcc", "smam_chc"],
    funds: { allocated: 140, utilized: 88, pipeline: 10 },
  },
];

/* ------------------------------ helpers ------------------------------ */

/** Available (uncommitted) funds in ₹ lakh. */
export function availableFunds(p: Partner): number {
  return Math.max(0, p.funds.allocated - p.funds.utilized - p.funds.pipeline);
}

/** Fund utilisation ratio 0..1 — drives the green/amber/red status LED. */
export function utilisation(p: Partner): number {
  if (p.funds.allocated === 0) return 1;
  return (p.funds.utilized + p.funds.pipeline) / p.funds.allocated;
}

export type FundStatus = "available" | "low" | "exhausted";

export function fundStatus(p: Partner): FundStatus {
  const u = utilisation(p);
  if (u >= 1) return "exhausted";
  if (u >= 0.85) return "low";
  return "available";
}

/** Great-circle distance in km between two lat/lng points (Haversine). */
export function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export type RankedPartner = Partner & {
  distance: number;
  available: number;
  status: FundStatus;
};

/**
 * The Smart Partner Router: keep partners that (a) handle the scheme and
 * (b) can actually fund the requested amount, sorted nearest-first.
 */
export function rankPartners(
  schemeId: string | undefined,
  amount: number, // full ₹
  loc: { lat: number; lng: number },
): RankedPartner[] {
  return PARTNERS.map((p) => ({
    ...p,
    distance: distanceKm(loc.lat, loc.lng, p.lat, p.lng),
    available: availableFunds(p),
    status: fundStatus(p),
  }))
    .filter((p) => (schemeId ? p.schemeIds.includes(schemeId) : true))
    .filter((p) => p.available * 100000 >= amount)
    .sort((a, b) => a.distance - b.distance);
}
