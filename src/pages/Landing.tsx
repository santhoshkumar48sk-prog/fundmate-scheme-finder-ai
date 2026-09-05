import { Link } from "react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Cpu,
  Landmark,
  Lock,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Prompt, SectionLabel, StatusLed, TerminalCard } from "@/components/terminal";
import { useAuth } from "@/hooks/use-auth";

const HIDDEN_DEMO = [
  {
    name: "CGTMSE — Credit Guarantee Fund",
    score: 88,
    tag: "hidden",
    line: "No collateral, no third-party guarantee — the guarantee that lets banks say YES to MSMEs up to ₹2Cr.",
    dept: "Ministry of MSME",
  },
  {
    name: "SISFS — Startup India Seed Fund",
    score: 82,
    tag: "hidden",
    line: "Up to ₹50L seed capital via DPIIT-approved incubators — for ideas at proof-of-concept stage.",
    dept: "DPIIT · Startup India",
  },
  {
    name: "Mannin Magal Thittam",
    score: 76,
    tag: "hidden",
    line: "TN buys agricultural land in the name of SC/ST women from landless families. Most applicants never hear of it.",
    dept: "Govt. of Tamil Nadu",
  },
];

function HeroTerminal() {
  return (
    <TerminalCard
      title="yojanai — session@marginalized-entrepreneur"
      className="text-left"
      right={
        <span className="flex items-center gap-1.5">
          <StatusLed tone="green" pulse />
          <span className="font-mono text-[10px] text-muted-foreground">engine: live</span>
        </span>
      }
    >
      <div className="space-y-2 font-mono text-xs leading-6 sm:text-[13px]">
        <Prompt>yojanai discover --need "I run a tailoring unit. I need a loan to buy machines"</Prompt>
        <p className="text-muted-foreground">
          <span className="text-primary">ai{">"}</span> parsing need
        </p>
        <p className="pl-4 text-muted-foreground">
          ✓ understood: <span className="text-foreground/85">start_business</span>,{" "}
          <span className="text-foreground/85">business_loan</span>,{" "}
          <span className="text-foreground/85">skill_training</span>
          <span className="ml-2 text-primary">[confidence 92%]</span>
        </p>
        <p className="text-muted-foreground">
          <span className="text-primary">engine{">"}</span> running eligibility rules ×{" "}
          {`>`}23 schemes … <span className="text-foreground/70">done</span>
        </p>
        <div className="grid gap-1.5 pt-1 sm:grid-cols-[1fr_auto]">
          <p>
            <span className="text-amber-600">1.</span> PM Vishwakarma{" "}
            <span className="text-muted-foreground">— artisan loan, 0% effective interest</span>
          </p>
          <p className="tabular text-primary">
            <span className="mr-1 text-muted-foreground">match</span> 96%
          </p>
          <p>
            <span className="text-amber-600">2.</span> PMEGP{" "}
            <span className="text-muted-foreground">— 25–35% capital subsidy</span>
          </p>
          <p className="tabular text-primary">
            <span className="mr-1 text-muted-foreground">match</span> 91%
          </p>
          <p>
            <span className="text-amber-600">3.</span> CGTMSE{" "}
            <span className="text-muted-foreground">— collateral-free guarantee</span>
          </p>
          <p className="tabular text-primary">
            <span className="mr-1 text-muted-foreground">match</span> 88%
          </p>
        </div>
        <p className="border-t border-border pt-2 text-muted-foreground">
          <span className="text-primary">engine{">"}</span> 🔍 2 hidden schemes surfaced you didn't search for.
          <span className="ml-1 text-amber-600">[verify at official portals]</span>
        </p>
        <Prompt dollar={false}>
          you_didn't_need_to_know_the_scheme.
        </Prompt>
      </div>
    </TerminalCard>
  );
}

export default function Landing() {
  const { isAuthenticated } = useAuth();
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-[4px] border border-primary/40 bg-primary/10">
              <TerminalSquare className="size-4 text-primary" />
            </span>
            <span className="font-mono text-sm font-bold tracking-tight">
              YOJANAI<span className="text-primary">.</span>
            </span>
          </Link>
          <span className="hidden font-mono text-[10px] text-muted-foreground sm:inline">
            SIH 26092 · demo build
          </span>
          <div className="ml-auto flex items-center gap-2">
            {isAuthenticated ? (
              <Button asChild size="sm" className="font-mono text-[11px]">
                <Link to="/dashboard">
                  dashboard <ArrowRight className="size-3" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="font-mono text-[11px]">
                  <Link to="/auth">sign in</Link>
                </Button>
                <Button asChild size="sm" className="font-mono text-[11px]">
                  <Link to="/auth?returnTo=/quiz">
                    start quiz <ArrowRight className="size-3" />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="grid-paper relative">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-14 lg:grid-cols-2 lg:pt-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-primary/30 bg-primary/10 font-mono text-[10px] text-primary">
                <Cpu className="size-3" /> AI + rule-based matching
              </Badge>
              <Badge variant="outline" className="font-mono text-[10px]">
                <Lock className="size-3" /> private by design
              </Badge>
            </div>
            <h1 className="mt-5 font-mono text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem]">
              You don't need to know the scheme.
              <br />
              <span className="text-primary">Tell us your need.</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
              YOJANAI finds government opportunities for you — including the
              lesser-known ones you've never heard of. Built first for{" "}
              <span className="text-foreground">small business owners</span>: a
              2-minute smart-profile quiz, an eligibility engine, and a ranked
              answer to <em className="text-foreground not-italic">"what can I actually get?"</em>
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              {isAuthenticated ? (
                <Button asChild size="lg" className="font-mono text-sm">
                  <Link to="/dashboard">
                    open my dashboard <ArrowRight className="size-4" />
                  </Link>
                </Button>
              ) : (
                <Button asChild size="lg" className="font-mono text-sm">
                  <Link to="/auth?returnTo=/quiz">
                    take the smart-profile quiz <ArrowRight className="size-4" />
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline" size="lg" className="font-mono text-sm">
                <a href="#how">
                  <Search className="size-4" /> how it works
                </a>
              </Button>
            </div>
            <p className="mt-4 font-mono text-[11px] text-muted-foreground">
              <StatusLed tone="amber" className="mr-1.5" />
              demo data · always verify at official sources before applying
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <HeroTerminal />
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <SectionLabel>pipeline // how the engine works</SectionLabel>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <Sparkles className="size-4" />,
                step: "01",
                title: "Tell your need",
                body: "Pick what you need help with, or describe it in plain words — English or Tamil. No scheme names required.",
              },
              {
                icon: <Cpu className="size-4" />,
                step: "02",
                title: "AI structures it",
                body: "The AI layer converts your words into a structured requirement with confidence, ready for matching.",
              },
              {
                icon: <Landmark className="size-4" />,
                step: "03",
                title: "Eligibility engine",
                body: "29 weighted rules check age, community, income, land, business and documents against each scheme.",
              },
              {
                icon: <Search className="size-4" />,
                step: "04",
                title: "Hidden scheme surfacing",
                body: "Ranked matches plus a dedicated 'schemes you didn't know' list — prioritising low-awareness opportunities.",
              },
            ].map((c) => (
              <div key={c.step} className="rounded-md border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <span className="flex size-8 items-center justify-center rounded-[4px] border border-primary/30 bg-primary/10 text-primary">
                    {c.icon}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">{c.step}</span>
                </div>
                <h3 className="mt-3 font-mono text-sm font-semibold">{c.title}</h3>
                <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hidden schemes USP */}
      <section className="border-t border-border bg-secondary/40">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <SectionLabel className="text-primary">
                hidden_gems // the point of this platform
              </SectionLabel>
              <h2 className="mt-2 max-w-xl font-mono text-2xl font-bold">
                Schemes you didn't know you could get
              </h2>
            </div>
            <p className="max-w-sm text-xs leading-5 text-muted-foreground">
              Most portals show the same popular schemes. YOJANAI actively
              filters for low-awareness schemes your profile actually matches.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {HIDDEN_DEMO.map((s, i) => (
              <div key={s.name} className="rounded-md border border-primary/25 bg-card p-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-primary/30 bg-primary/10 font-mono text-[10px] text-primary">
                    <Search className="size-3" /> low awareness
                  </Badge>
                  <span className="tabular font-mono text-sm font-bold text-primary">
                    {s.score}%
                  </span>
                </div>
                <h3 className="mt-3 font-mono text-sm font-semibold leading-snug">{s.name}</h3>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{s.line}</p>
                <p className="mt-3 font-mono text-[10px] text-muted-foreground">
                  <BadgeCheck className="mr-1 inline size-3 text-primary" />
                  {s.dept}
                </p>
                <p className="mt-2 font-mono text-[10px] text-foreground/70">
                  #{i + 1} in "you may not have searched for this, but your profile matches it"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For small business owners */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <SectionLabel>first_user // small business owners</SectionLabel>
          <h2 className="mt-2 max-w-2xl font-mono text-2xl font-bold">
            Loans, subsidies and guarantees — mapped to{" "}
            <span className="text-primary">your</span> business, not a brochure.
          </h2>
          <div className="mt-8 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: <Wallet className="size-4" />, k: "loan_math", t: "Financial calculator", d: "EMI, subsidy, moratorium and effective benefit computed live on your numbers." },
              { icon: <Search className="size-4" />, k: "readiness", t: "Document readiness", d: "See exactly which certificates are missing and how to get each one free of charge." },
              { icon: <TrendingUp className="size-4" />, k: "improve", t: "Match improvement", d: "Legitimate actions only — never fabricated documents — to raise your potential score." },
              { icon: <ShieldCheck className="size-4" />, k: "verify", t: "Official source tracking", d: "Every scheme links to its real department portal with last-verified date." },
              { icon: <BadgeCheck className="size-4" />, k: "elig", t: "Why-eligible breakdown", d: "A transparent checklist of what passed and what doesn't — not just a percentage." },
              { icon: <MapPin className="size-4" />, k: "local", t: "TN + central coverage", d: "Demo catalogue spans Tamil Nadu state schemes and central MSME/social-justice schemes." },
            ].map((f) => (
              <div key={f.k} className="flex gap-3">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-[4px] border border-primary/30 bg-primary/10 text-primary">
                  {f.icon}
                </span>
                <div>
                  <h3 className="font-mono text-[13px] font-semibold">{f.t}</h3>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-primary/[0.05]">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="text-primary">$</span> yojanai --profile small_business_owner
          </p>
          <h2 className="mx-auto mt-3 max-w-xl font-mono text-2xl font-bold leading-tight">
            Two minutes of questions.
            <br />
            A ranked answer you can act on.
          </h2>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {isAuthenticated ? (
              <Button asChild size="lg" className="font-mono text-sm">
                <Link to="/dashboard">
                  view my matches <ArrowRight className="size-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="font-mono text-sm">
                  <Link to="/auth?returnTo=/quiz">
                    start the quiz <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="font-mono text-sm">
                  <Link to="/auth">sign in to your dashboard</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 font-mono text-xs">
            <TerminalSquare className="size-4 text-primary" />
            <span className="font-bold">YOJANAI</span>
            <span className="text-muted-foreground">· SIH 26092 prototype</span>
          </div>
          <p className="max-w-md font-mono text-[10px] leading-4 text-muted-foreground">
            Scheme details are prototype demo data. Before applying, always verify
            eligibility, benefits and deadlines at the official government portals
            linked in each scheme record.
          </p>
        </div>
      </footer>
    </div>
  );
}