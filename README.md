# YOJANAI — AI-Powered Government Scheme Discovery & Matching

> **"You don't need to know the scheme. Just tell us your need — YOJANAI finds the opportunities for you."**

A Smart India Hackathon prototype for **SIH26092 — AI-Driven Scheme Matching for Marginalized
Entrepreneurs**. Instead of searching portals by scheme name, users describe their need in plain
words (English or Tamil), complete a 2-minute **Smart Profile quiz**, and get a transparent,
rule-based ranking of central + Tamil Nadu government schemes — with deliberate emphasis on
**lesser-known and hidden schemes** their profile matches.

## Version 1 scope (built first, deliberately)

- **First user:** a small business owner
- **Core flow:** Profile quiz → requirement-based discovery → eligibility engine → personalized
  match score → **hidden scheme discovery** → document readiness → match improvement suggestions →
  financial calculator → official source verification

Out of v1 (roadmap): partner locator map, application tracking, family profiles, admin dashboard,
life-event re-matching, real LLM integration.

## Feature highlights

| Module | What it does |
| --- | --- |
| Smart Profile quiz | 6 steps — need picker (13 categories) + free-text need, personal, financial, business, agri + education, review |
| Mock AI layer (`src/convex/ai.ts`) | `parseNeed` action converts free text (English/தமிழ்) into a structured requirement with confidence. Swap point for Claude/Gemini/OpenAI — the response contract stays identical |
| Eligibility engine (`src/lib/eligibility.ts`) | Weighted rules per scheme (age, gender, community, income, land, business type, project cost…). Produces score, rating, why-eligible / why-not breakdowns |
| Hidden scheme discovery | Catalogue records carry `awareness: known / lesser / hidden`; the dashboard surfaces low-awareness matches in a dedicated "Schemes You Didn't Know You Could Get" panel |
| Document readiness | Checklists required docs across top matches, tracks what the user holds, and shows **how to obtain each missing document through official channels** |
| Match improvement engine | Only legitimate actions (+% gains) — never fabricated certificates or false data |
| Financial calculator | EMI, moratorium capitalisation, subsidy, total interest and effective benefit vs a market-rate loan |
| Official source verification | Every scheme lists its department, official portal URL and last-verified date; the UI never presents an unverified site as the application portal |

## Tech stack

- **Frontend:** React 19 + Vite + Tailwind CSS v4 + shadcn/ui + Lucide icons, light **terminal theme**
  (monospace, off-white paper, green/amber status accents)
- **Backend:** Convex (database + reactive queries + auth) via Convex Auth (email OTP + guest)
- **AI:** mock service layer (no API key needed) — deterministic parser behind a Convex action
- **Package manager:** bun

## Running locally

```bash
bun install
bun convex dev --once   # generate Convex types + push schema
bun run dev             # start the Vite dev server
```

The scheme catalogue (23 demo records — central MSME/social-justice schemes + Tamil Nadu state
schemes) seeds itself automatically into the `schemes` table on first dashboard load.

## Project structure

```
src/
├── convex/               # backend
│   ├── schema.ts         # users (auth), profiles, schemes tables
│   ├── profiles.ts       # getMyProfile / saveProfile / updateDocuments
│   ├── schemes.ts        # seedSchemes + getMatches (rule engine over catalogue)
│   └── ai.ts             # parseNeed action (mock AI — swap point for a real LLM)
├── lib/
│   ├── eligibility.ts    # shared rule engine, profile & scheme types, doc library
│   ├── scheme-data.ts    # demo catalogue with weighted rules per scheme
│   ├── mock-ai.ts        # deterministic need parser (EN + தமிழ்)
│   └── format.ts         # INR / percentage helpers
├── components/           # match ring, scheme cards, detail modal, calculator, terminal chrome
└── pages/                # Landing, Auth, Quiz, Dashboard, NotFound
```

## Routes

- `/` — terminal-themed landing page (auth-aware CTAs)
- `/auth` — email OTP sign-in / guest demo login → redirects to `/quiz`
- `/quiz` — **protected** Smart Profile quiz (redirects to dashboard once complete)
- `/dashboard` — **protected** recommendations, hidden schemes, readiness, improvement, calculator

## Demo walkthrough (judges)

1. Landing → "start quiz" → sign in with any email (OTP) or continue as guest.
2. Pick **"Start a Business"** or type: *"I run a tailoring unit and want a loan to buy machines"*
   → "analyze with mock AI".
3. Fill the quick steps (defaults are sensible), review, save.
4. Dashboard: ranked matches with score rings → open a scheme to see *why you match*, documents,
   application route and the official source link.
5. Check the **hidden schemes** panel and the **document readiness** checklist — ticking a missing
   document recalculates readiness and the improvement engine shows potential score gains.
6. Try the **financial calculator** (preloaded with your best match's loan window).

## Data disclaimer

All scheme records are **prototype demo data** modelled on publicly documented central and Tamil
Nadu government schemes (PMEGP, MUDRA, Stand-Up India, PM Vishwakarma, CGTMSE, NSFDC, NHFDC,
PM-DAKSH, TAHDCO, Mannin Magal Thittam, Pudhumai Penn, National Overseas Scholarship, PM YASASVI,
KCC, SMAM-CHC, PMAY-U, Kalaignar Kanavu Illam, ADIP…). Before applying anywhere, verify the latest
eligibility, benefits and deadlines at the official portal linked in each scheme record.

---

## Platform conventions (kept from the template)

- **Auth is pre-wired.** Use `useAuth()` from `@/hooks/use-auth`; protect routes with `RequireAuth`.
  Do not modify `src/convex/auth.config.ts`, `src/convex/auth.ts`, or `src/convex/auth/emailOtp.ts`.
- `redirectAfterAuth` in `src/main.tsx` is set to `/quiz` (the product's main authenticated
  destination for v1); a validated `returnTo` query parameter takes priority.
- Convex functions authorise at the base level (`getAuthUserId`), keep `schemaValidation: false`,
  and never return unvalidated internal fields.
