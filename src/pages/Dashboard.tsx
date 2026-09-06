import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import {
  Bell,
  Check,
  FileText,
  Loader2,
  LogOut,
  Search,
  Sparkles,
  TerminalSquare,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MatchRing } from "@/components/match-ring";
import { SchemeCard } from "@/components/scheme-card";
import { SchemeDetail } from "@/components/scheme-detail";
import { FinancialCalculator } from "@/components/financial-calculator";
import { PartnerMap } from "@/components/partner-map";
import { LanguageSwitcher, useLang } from "@/components/language";
import { Brackets, Prompt, SectionLabel, StatusLed, TerminalCard } from "@/components/terminal";
import { useAuth } from "@/hooks/use-auth";
import { DOC_LIBRARY, NEEDS, documentReadiness, type Profile, type SchemeMatch } from "@/lib/eligibility";
import { inrCompact } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function greetingKey() {
  const h = new Date().getHours();
  if (h < 12) return "dash.greeting.morning" as const;
  if (h < 17) return "dash.greeting.afternoon" as const;
  return "dash.greeting.evening" as const;
}

const DEMO_NOTIFICATIONS = [
  { title: "New opportunity", body: "Your profile now matches PM Vishwakarma (96%)", tone: "green" },
  { title: "Deadline approaching", body: "PMEGP quarterly window closes 30 Sep", tone: "amber" },
  { title: "Document needed", body: "Income certificate missing for TAHDCO (if applying)", tone: "gray" },
];

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const data = useQuery(api.schemes.getMatches);
  const seedSchemes = useMutation(api.schemes.seedSchemes);
  const updateDocuments = useMutation(api.profiles.updateDocuments);

  const [selected, setSelected] = useState<SchemeMatch | null>(null);
  const [owned, setOwned] = useState<string[]>([]);
  const [docsDirty, setDocsDirty] = useState(false);
  const [savingDocs, setSavingDocs] = useState(false);

  const profile: Profile | null = data?.profile ?? null;

  // Seed the catalogue once, then matches flow in reactively.
  useEffect(() => {
    if (data && !data.seeded) {
      void seedSchemes();
    }
  }, [data, seedSchemes]);

  // Initialise the document checklist from the stored profile.
  useEffect(() => {
    if (data?.profile) setOwned(data.profile.documents ?? []);
  }, [data?.profile?.documents]);

  const matches = data?.matches ?? [];
  const hidden = data?.hidden ?? [];
  const topMatches = useMemo(() => matches.slice(0, 6), [matches]);
  const readinessSchemes = useMemo(
    () => matches.slice(0, 10).map((m) => m.scheme),
    [matches],
  );
  const readiness = useMemo(
    () => documentReadiness(readinessSchemes, owned),
    [readinessSchemes, owned],
  );
  const best = matches[0];

  const improvement = useMemo(() => {
    if (!best) return null;
    const seen = new Set<string>();
    const items: { text: string; gain: number }[] = [];
    for (const m of matches.slice(0, 5)) {
      for (const s of m.suggestions) {
        if (!seen.has(s.text)) {
          seen.add(s.text);
          items.push(s);
        }
      }
    }
    return { from: best.score, to: Math.max(best.potentialScore, ...matches.slice(0, 5).map((m) => m.potentialScore)), items: items.slice(0, 4) };
  }, [matches, best]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const toggleDoc = (key: string) => {
    setOwned((prev) => (prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]));
    setDocsDirty(true);
  };

  const saveDocs = async () => {
    if (!profile) return;
    setSavingDocs(true);
    try {
      await updateDocuments({ documents: owned });
      setDocsDirty(false);
      toast.success("Document checklist saved", {
        description: `Readiness recalculated: ${readiness.pct}% of required documents available.`,
      });
    } finally {
      setSavingDocs(false);
    }
  };

  if (data === undefined) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-5 animate-spin text-primary" />
      </main>
    );
  }
  if (!data.profile) return <Navigate to="/quiz" replace />;

  const need = NEEDS.find((n) => n.key === profile!.needCategory);

  return (
    <main className="grid-paper min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-[4px] border border-primary/40 bg-primary/10">
              <TerminalSquare className="size-4 text-primary" />
            </span>
            <span className="font-mono text-sm font-bold">
              FUNDMATE<span className="text-primary">.</span>
            </span>
          </Link>
          <LanguageSwitcher className="hidden sm:flex" />
          <span className="hidden font-mono text-[10px] text-muted-foreground md:inline">
            session: {user?.name || user?.email || "guest"}
          </span>

          <div className="ml-auto flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Bell className="size-4" />
                  <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-amber-500 font-mono text-[9px] font-bold text-white">
                    3
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72 p-0">
                <div className="border-b border-border px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  notifications // demo
                </div>
                {DEMO_NOTIFICATIONS.map((n) => (
                  <div key={n.title} className="flex gap-2 border-b border-border/60 px-3 py-2.5">
                    <StatusLed tone={n.tone as "green" | "amber" | "gray" | "red"} className="mt-1" />
                    <div>
                      <p className="font-mono text-[11px] font-semibold">{n.title}</p>
                      <p className="font-mono text-[10px] leading-4 text-muted-foreground">{n.body}</p>
                    </div>
                  </div>
                ))}
                <p className="px-3 py-2 font-mono text-[10px] text-muted-foreground">
                  Full alerting ships in v2 — deadline, status and new-scheme alerts.
                </p>
              </PopoverContent>
            </Popover>
            <Button variant="outline" size="sm" className="font-mono text-[11px]" onClick={handleSignOut}>
              <LogOut className="size-3.5" /> sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        {/* Greeting */}
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] text-muted-foreground">
              <StatusLed tone="green" pulse className="mr-1.5" />
              eligibility engine: online · {matches.length} scheme(s) scored
            </p>
            <h1 className="mt-1 font-mono text-2xl font-bold sm:text-3xl">
              {t(greetingKey())}, {profile!.name?.split(" ")[0] || "entrepreneur"} 👋
            </h1>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              need: <span className="text-foreground">{need?.label ?? profile!.needCategory}</span>
              {profile!.needDescription && (
                <span className="ml-1 text-muted-foreground/80">— "{profile!.needDescription}"</span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              profile!.state,
              profile!.category,
              inrCompact(profile!.annualFamilyIncome) + "/yr",
              profile!.hasExistingBusiness ? "existing biz" : "new biz",
            ].map((c) => (
              <span key={c} className="rounded-[3px] border border-border bg-secondary/70 px-2 py-1 font-mono text-[10px] text-muted-foreground">
                {c}
              </span>
            ))}
          </div>
        </section>

        {/* Top matches */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <SectionLabel>ai_recommendation // ranked by your profile</SectionLabel>
              <h2 className="mt-1 font-mono text-lg font-bold">
                {matches.length} potential opportunities for you
              </h2>
            </div>
            <p className="font-mono text-[10px] text-muted-foreground">
              sorted by rule-weighted score {"·"} deeper matches win
            </p>
          </div>
          <div className="space-y-2.5">
            {topMatches.map((m, i) => (
              <SchemeCard key={m.scheme.id} match={m} rank={i + 1} onOpen={setSelected} />
            ))}
          </div>
        </section>

        {/* Hidden schemes — the USP */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <SectionLabel className="text-primary">hidden_discovery // low-awareness matches</SectionLabel>
              <h2 className="mt-1 font-mono text-lg font-bold">
                <Search className="mr-1.5 inline size-4 text-primary" />
                Schemes you didn't know you could get
              </h2>
            </div>
            <span className="rounded-[3px] border border-primary/30 bg-primary/10 px-2 py-1 font-mono text-[10px] text-primary">
              {hidden.length} hidden gem(s)
            </span>
          </div>

          {hidden.length > 0 ? (
            <TerminalCard
              title="hidden_schemes.ts — you_didn't_search_for_these"
              className="border-primary/30"
              right={<Sparkles className="size-3.5 text-primary" />}
            >
              <div className="space-y-4">
                <p className="flex items-center gap-2 font-mono text-[11px] text-foreground/80">
                  <Sparkles className="size-3.5 shrink-0 text-primary" />
                  You may not have searched for these — but your profile matches them.
                </p>
                <div className="space-y-2.5">
                  {hidden.slice(0, 4).map((m, i) => (
                    <SchemeCard key={m.scheme.id} match={m} rank={i + 1} onOpen={setSelected} />
                  ))}
                </div>
              </div>
            </TerminalCard>
          ) : (
            <TerminalCard title="hidden_schemes.ts">
              <Prompt>seed_catalogue …</Prompt>
            </TerminalCard>
          )}
        </section>

        {/* Readiness + Improvement */}
        <section className="grid gap-4 lg:grid-cols-2">
          {/* Document readiness */}
          <TerminalCard
            title="document_readiness.ts"
            right={
              <div className="flex items-center gap-2">
                <span className="tabular font-mono text-[11px] font-bold text-primary">{readiness.pct}%</span>
                <FileText className="size-3.5 text-muted-foreground" />
              </div>
            }
          >
            <div className="mb-1 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
              <span>
                {readiness.available.length}/{readiness.required.length} required docs available
              </span>
              {docsDirty && (
                <Button size="sm" variant="outline" className="h-6 px-2 font-mono text-[10px]" onClick={saveDocs} disabled={savingDocs}>
                  {savingDocs ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />} save
                </Button>
              )}
            </div>
            <Progress value={readiness.pct} className="h-2 bg-primary/15" />

            <div className="mt-4 space-y-1.5">
              {readiness.required.map((key) => {
                const has = owned.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleDoc(key)}
                    className={cn(
                      "flex w-full items-start gap-2 rounded-[3px] border px-2.5 py-2 text-left transition-colors",
                      has ? "border-primary/30 bg-primary/[0.06]" : "border-border bg-background hover:border-amber-400/50",
                    )}
                  >
                    <span className={cn("mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-[3px] border", has ? "border-primary bg-primary text-primary-foreground" : "border-border text-transparent")}>
                      {has && <Check className="size-3" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-mono text-[11px] text-foreground/85">
                        {DOC_LIBRARY[key]?.label ?? key}
                      </span>
                      {!has && DOC_LIBRARY[key] && (
                        <span className="mt-0.5 block text-[10px] leading-4 text-muted-foreground">
                          how to get it: {DOC_LIBRARY[key].howToObtain}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 font-mono text-[10px] leading-4 text-muted-foreground">
              Tick what you already hold — Fundmate never fabricates certificates and never
              stores uploads without consent.
            </p>
          </TerminalCard>

          {/* Improvement engine */}
          <TerminalCard
            title="improve_eligibility.ts"
            right={<TrendingUp className="size-3.5 text-primary" />}
          >
            {improvement && best ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <MatchRing score={best.score} size={68} label="now" />
                  <div className="flex-1">
                    <p className="font-mono text-[11px] text-muted-foreground">
                      best match today
                    </p>
                    <p className="font-mono text-sm font-semibold leading-snug">{best.scheme.name}</p>
                    <p className="mt-1 font-mono text-[11px] text-primary">
                      with legitimate actions → potential{" "}
                      <span className="tabular font-bold">{improvement.to}%</span>
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
                  <div className="rounded-md border border-border bg-secondary/50 p-3 text-center">
                    <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">current score</p>
                    <p className="tabular mt-1 font-mono text-xl font-bold">{improvement.from}%</p>
                  </div>
                  <div className="rounded-md border border-primary/30 bg-primary/[0.07] p-3 text-center">
                    <p className="font-mono text-[9px] uppercase tracking-wider text-primary">potential score</p>
                    <p className="tabular mt-1 font-mono text-xl font-bold text-primary">{improvement.to}%</p>
                  </div>
                </div>
                <ul className="space-y-1.5">
                  {improvement.items.map((s) => (
                    <li key={s.text} className="flex items-start gap-2 font-mono text-[11px] text-foreground/80">
                      <TrendingUp className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      <span className="flex-1">{s.text}</span>
                      <span className="tabular shrink-0 text-primary">+{s.gain}%</span>
                    </li>
                  ))}
                </ul>
                <p className="rounded-[3px] border border-amber-500/30 bg-amber-100/40 px-2.5 py-1.5 font-mono text-[10px] text-amber-800">
                  Only genuine, documented actions are suggested — never fake certificates or
                  misreporting income.
                </p>
              </div>
            ) : (
              <Prompt>no_schemes_yet — complete the quiz first</Prompt>
            )}
          </TerminalCard>
        </section>

        {/* Financial calculator */}
        <section className="space-y-3">
          <SectionLabel>financial_calculator // loan_math for your scheme</SectionLabel>
          <FinancialCalculator preset={best?.scheme.loanWindow} />
        </section>

        {/* Smart Partner Router — nearest funded SCA/Bank/NBFC-MFI */}
        <section className="space-y-3">
          <SectionLabel>smart_partner_router // geospatial + fund-aware</SectionLabel>
          <PartnerMap
            schemeId={best?.scheme.id}
            schemeName={best?.scheme.name}
            amount={
              profile!.financialRequirement ||
              profile!.projectCost ||
              (best?.scheme.loanWindow ? best.scheme.loanWindow.max * 100000 : 0) ||
              500000
            }
          />
          <p className="font-mono text-[10px] leading-4 text-muted-foreground">
            Partners are filtered by their live fund utilisation — offices with exhausted
            allocations are hidden so you never apply where money has run out.
          </p>
        </section>

        {/* Footer note */}
        <footer className="border-t border-border pt-6 pb-4">
          <p className="font-mono text-[10px] leading-4 text-muted-foreground">
            <span className="text-primary">$</span> disclaimer: prototype demo data — every
            scheme carries its official source and last-verified date; confirm details at the
            linked government portal before applying. <Brackets>v1 · smart profile + matching</Brackets>{" "}
            <Link to="/" className="underline underline-offset-2">landing</Link>
          </p>
        </footer>
      </div>

      <SchemeDetail match={selected} open={selected !== null} onClose={() => setSelected(null)} />
    </main>
  );
}