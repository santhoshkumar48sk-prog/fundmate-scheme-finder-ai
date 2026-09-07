import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, type ReactNode } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import {
  Accessibility,
  ArrowLeft,
  ArrowRight,
  Award,
  Banknote,
  Check,
  Cpu,
  GraduationCap,
  HandCoins,
  HeartHandshake,
  Home,
  Loader2,
  Mic,
  Plane,
  Sprout,
  Store,
  TerminalSquare,
  Tractor,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LanguageSwitcher, useLang } from "@/components/language";
import { useSpeech } from "@/hooks/use-speech";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { NEEDS, type Category, type Gender, type NeedCategory, type Profile } from "@/lib/eligibility";
import { inrCompact } from "@/lib/format";
import { parseSummaryNote, type ParsedNeed } from "@/lib/mock-ai";
import { cn } from "@/lib/utils";

const NEED_ICONS: Record<NeedCategory, LucideIcon> = {
  agriculture: Sprout,
  start_business: Store,
  business_loan: HandCoins,
  higher_education: GraduationCap,
  study_abroad: Plane,
  housing: Home,
  womens_entrepreneurship: HeartHandshake,
  disability_support: Accessibility,
  skill_training: Wrench,
  farming_equipment: Tractor,
  financial_assistance: Banknote,
  scholarship: Award,
  family_benefits: Users,
};

const STEPS = ["Need", "Personal", "Financial", "Business", "Agri + Edu", "Review"];

const CATEGORIES: Category[] = ["SC", "ST", "OBC", "EBC", "DNT", "General"];
const GENDERS: { value: Gender; label: string }[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "other", label: "Other" },
];
const STATES = ["Tamil Nadu", "Karnataka", "Andhra Pradesh", "Kerala", "Telangana", "Maharashtra", "Other state"];
const DISTRICTS = ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Erode", "Vellore", "Other district"];
const BUSINESS_TYPES = [
  { value: "retail", label: "Retail / Kirana shop" },
  { value: "food", label: "Food production / Tiffin" },
  { value: "tailoring", label: "Tailoring / Stitching" },
  { value: "carpentry", label: "Carpentry" },
  { value: "blacksmith", label: "Blacksmithy" },
  { value: "pottery", label: "Pottery" },
  { value: "handicraft", label: "Handicraft / Arts" },
  { value: "manufacturing", label: "Small manufacturing" },
  { value: "services", label: "Services / Repair shop" },
  { value: "startup", label: "Startup / Tech idea" },
  { value: "agri_allied", label: "Agri-allied (dairy, poultry…)" },
  { value: "other", label: "Other" },
];
const SECTORS = ["Food & FMCG", "Textiles & Apparel", "Agri & Allied", "Handicrafts", "Manufacturing", "Retail & Trade", "Services", "Tech / IT", "Construction", "Other"];
const QUALIFICATIONS = ["Below 10th", "10th / SSLC", "12th / HSC", "ITI / Diploma", "Undergraduate", "Postgraduate", "No formal schooling"];

const MAYBE = (label: string) => (
  <span className="font-mono text-[10px] text-muted-foreground"> ({label})</span>
);

function RadioCards<T extends string>({
  options,
  value,
  onChange,
  columns = 3,
}: {
  options: { value: T; label: string; hint?: string }[];
  value: T | undefined;
  onChange: (v: T) => void;
  columns?: 2 | 3 | 4 | 6;
}) {
  const cols = {
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-4",
    6: "grid-cols-3 sm:grid-cols-6",
  } as const;
  return (
    <div className={cn("grid gap-2", cols[columns])}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "flex items-center justify-between gap-2 rounded-md border px-3 py-2.5 text-left font-mono text-xs transition-colors",
            value === o.value
              ? "border-primary/60 bg-primary/10 text-foreground"
              : "border-border bg-card text-muted-foreground hover:border-primary/40",
          )}
        >
          <span>
            {o.label}
            {o.hint && MAYBE(o.hint)}
          </span>
          <span
            className={cn(
              "flex size-4 items-center justify-center rounded-[3px] border",
              value === o.value ? "border-primary bg-primary text-primary-foreground" : "border-border",
            )}
          >
            {value === o.value && <Check className="size-3" />}
          </span>
        </button>
      ))}
    </div>
  );
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <Label className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          {label}
        </Label>
        {hint && <span className="font-mono text-[9px] text-muted-foreground/70">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function YesNo({
  value,
  onChange,
  yes = "Yes",
  no = "No",
}: {
  value: boolean | undefined;
  onChange: (v: boolean) => void;
  yes?: string;
  no?: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {[true, false].map((b) => (
        <button
          key={String(b)}
          type="button"
          onClick={() => onChange(b)}
          className={cn(
            "rounded-md border px-3 py-2.5 font-mono text-xs transition-colors",
            value === b
              ? "border-primary/60 bg-primary/10 text-foreground"
              : "border-border bg-card text-muted-foreground hover:border-primary/40",
          )}
        >
          {b ? yes : no}
        </button>
      ))}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string | undefined;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <Field label={label}>
      <div className="relative">
        <select
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-md border border-input bg-card px-3 py-2 font-mono text-xs text-foreground outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
          ▼
        </span>
      </div>
    </Field>
  );
}

export default function Quiz() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { t, locale } = useLang();
  const existingProfile = useQuery(api.profiles.getMyProfile);
  const saveProfile = useMutation(api.profiles.saveProfile);
  const parseNeed = useAction(api.ai.parseNeed);

  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [p, setP] = useState<Partial<Profile>>({
    age: 28,
    gender: "female",
    category: "SC",
    state: "Tamil Nadu",
    annualFamilyIncome: 250000,
    hasExistingBusiness: true,
    businessType: "retail",
    documents: [],
  });

  const [needText, setNeedText] = useState("");
  const [parsed, setParsed] = useState<ParsedNeed | null>(null);
  const [parsing, setParsing] = useState(false);

  const speech = useSpeech(locale, (text) =>
    setNeedText((prev) => (prev ? `${prev} ${text}`.trim() : text)),
  );

  const set = <K extends keyof Profile>(k: K, v: Profile[K]) =>
    setP((prev) => ({ ...prev, [k]: v }));

  const handleParse = async () => {
    if (!needText.trim()) return;
    setParsing(true);
    setError(null);
    try {
      const result = await parseNeed({ text: needText.trim() });
      setParsed(result);
      set("needCategory", result.primary);
      set("needDescription", needText.trim());
    } catch {
      setError("Mock AI parser unavailable — pick a need below instead.");
    } finally {
      setParsing(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const profile: Profile = {
        name: p.name ?? undefined,
        age: p.age ?? 30,
        gender: p.gender ?? "other",
        category: p.category ?? "General",
        hasDisability: p.hasDisability ?? false,
        state: p.state ?? "Tamil Nadu",
        district: p.district ?? "",
        annualFamilyIncome: p.annualFamilyIncome ?? 0,
        monthlyIncome: p.monthlyIncome ?? 0,
        existingLoan: p.existingLoan ?? false,
        assets: p.assets ?? "none",
        financialRequirement: p.financialRequirement ?? p.projectCost ?? 0,
        qualification: p.qualification ?? "No formal schooling",
        firstGraduate: p.firstGraduate ?? false,
        hasExistingBusiness: p.hasExistingBusiness ?? false,
        businessType: p.businessType ?? "other",
        sector: p.sector ?? "Other",
        projectCost: p.projectCost ?? 0,
        investmentRequired: p.investmentRequired ?? 0,
        businessExperience: p.businessExperience ?? 0,
        isFarmer: p.isFarmer ?? false,
        ownsLand: p.ownsLand ?? false,
        interestedFarming: p.interestedFarming ?? false,
        needCategory: p.needCategory ?? "start_business",
        needDescription: p.needDescription,
        documents: p.documents ?? [],
      };
      await saveProfile({ profile });
      toast.success("Smart profile saved", {
        description: "Running the eligibility engine across the scheme catalogue…",
      });
      navigate("/dashboard");
    } catch {
      setError("Could not save profile. Please try again.");
      setSaving(false);
    }
  };

  if (authLoading || existingProfile === undefined) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-5 animate-spin text-primary" />
      </main>
    );
  }
  if (!isAuthenticated) return <Navigate to="/auth?returnTo=/quiz" replace />;
  if (existingProfile) return <Navigate to="/dashboard" replace />;

  const canContinue = step === 0 ? Boolean(p.needCategory) : true;

  return (
    <main className="grid-paper min-h-screen bg-background py-10 text-foreground">
      <div className="mx-auto max-w-2xl px-4">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Link to="/" className="flex size-8 items-center justify-center rounded-[4px] border border-primary/40 bg-primary/10">
            <TerminalSquare className="size-4 text-primary" />
          </Link>
          <div>
            <h1 className="font-mono text-lg font-bold leading-tight">Smart Profile Quiz</h1>
            <p className="font-mono text-[11px] text-muted-foreground">
              small_business_owner · SIH 26092 · 2 min
            </p>
          </div>
          <LanguageSwitcher className="ml-auto" />
          <div className="ml-auto text-right font-mono text-[11px] text-muted-foreground">
            <span className="tabular text-foreground">{String(step + 1).padStart(2, "0")}</span>
            /{String(STEPS.length).padStart(2, "0")}
            <div className="mt-1 flex w-28 gap-0.5">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={cn("h-1 flex-1 rounded-full", i <= step ? "bg-primary" : "bg-border")}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Step body */}
        <div className="rounded-md border border-border bg-card p-5 sm:p-6">
          {step === 0 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                <span className="text-primary">$</span> tell us your need
              </div>
              <h2 className="font-mono text-xl font-bold leading-snug">
                What do you need help with?
              </h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {NEEDS.map((n) => {
                  const Icon = NEED_ICONS[n.key];
                  const active = p.needCategory === n.key;
                  return (
                    <button
                      key={n.key}
                      type="button"
                      onClick={() => set("needCategory", n.key)}
                      className={cn(
                        "flex flex-col items-start gap-2 rounded-md border p-3 text-left transition-colors",
                        active
                          ? "border-primary/60 bg-primary/10"
                          : "border-border bg-background hover:border-primary/40",
                      )}
                    >
                      <Icon className={cn("size-4", active ? "text-primary" : "text-muted-foreground")} />
                      <span className="font-mono text-xs font-medium leading-tight">{n.label}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{n.blurb}</span>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2 border-t border-border pt-4">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  or describe your need — AI structures it (English / தமிழ்)
                </p>
                <Textarea
                  value={needText}
                  onChange={(e) => setNeedText(e.target.value)}
                  placeholder="e.g. I am a 28-year-old woman from Coimbatore. My family income is ₹2.5 lakh. I run a tailoring unit and want a loan to buy machines."
                  rows={3}
                  className="font-mono text-xs"
                />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleParse}
                    disabled={parsing || !needText.trim()}
                    className="font-mono text-[11px]"
                  >
                    {parsing ? <Loader2 className="size-3 animate-spin" /> : <Cpu className="size-3" />}
                    analyze with mock AI
                  </Button>
                  <Button
                    type="button"
                    variant={speech.listening ? "default" : "outline"}
                    size="sm"
                    onClick={speech.listening ? speech.stop : speech.start}
                    disabled={!speech.supported}
                    title={speech.supported ? t("voice.micHint") : t("voice.unsupported")}
                    className="font-mono text-[11px]"
                  >
                    {speech.listening ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <Mic className={cn("size-3", !speech.supported && "opacity-40")} />
                    )}
                    {speech.listening ? t("voice.listening") : t("voice.micHint")}
                  </Button>
                  {parsed && (
                    <span className="truncate font-mono text-[10px] text-primary">
                      ✓ {parseSummaryNote(parsed)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                <span className="text-primary">$</span> personal // demographic
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" hint="optional">
                  <Input value={p.name ?? ""} onChange={(e) => set("name", e.target.value)} className="font-mono text-xs" placeholder="Your name" />
                </Field>
                <Field label="Age">
                  <Input type="number" min={1} max={120} value={p.age ?? ""} onChange={(e) => set("age", Number(e.target.value) || 0)} className="tabular font-mono text-xs" />
                </Field>
              </div>
              <Field label="Gender">
                <RadioCards options={GENDERS.map((g) => ({ value: g.value, label: g.label }))} value={p.gender} onChange={(v) => set("gender", v)} columns={3} />
              </Field>
              <Field label="Community / category" hint="used for scheme eligibility">
                <RadioCards options={CATEGORIES.map((c) => ({ value: c, label: c }))} value={p.category} onChange={(v) => set("category", v)} columns={6} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Disability status">
                  <YesNo value={p.hasDisability} onChange={(v) => set("hasDisability", v)} yes="Has disability certificate" no="No disability" />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField label="State" value={p.state} onChange={(v) => set("state", v)} options={STATES} placeholder="Select state" />
                <SelectField label="District" value={p.district} onChange={(v) => set("district", v)} options={DISTRICTS} placeholder="Select district" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                <span className="text-primary">$</span> financial // income & assets
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Annual family income">
                  <Input type="number" min={0} step={10000} value={p.annualFamilyIncome ?? ""} onChange={(e) => set("annualFamilyIncome", Number(e.target.value) || 0)} className="tabular font-mono text-xs" placeholder="e.g. 250000" />
                </Field>
                <Field label="Monthly income (own)">
                  <Input type="number" min={0} step={1000} value={p.monthlyIncome ?? ""} onChange={(e) => set("monthlyIncome", Number(e.target.value) || 0)} className="tabular font-mono text-xs" />
                </Field>
              </div>
              <Field label="Do you have an existing loan?">
                <YesNo value={p.existingLoan} onChange={(v) => set("existingLoan", v)} yes="Yes" no="No" />
              </Field>
              <Field label="Assets you own" hint="vehicles, gold, machines, shop…">
                <Input value={p.assets ?? ""} onChange={(e) => set("assets", e.target.value)} className="font-mono text-xs" placeholder="e.g. sewing machines worth ₹80,000" />
              </Field>
              <Field label="Financial requirement (₹)">
                <Input type="number" min={0} step={10000} value={p.financialRequirement ?? ""} onChange={(e) => set("financialRequirement", Number(e.target.value) || 0)} className="tabular font-mono text-xs" />
              </Field>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                <span className="text-primary">$</span> business // the small-business module
              </div>
              <Field label="Do you already run a business?">
                <YesNo value={p.hasExistingBusiness} onChange={(v) => set("hasExistingBusiness", v)} yes="Yes, running" no="Starting new" />
              </Field>
              <Field label="Business type">
                <RadioCards options={BUSINESS_TYPES} value={p.businessType} onChange={(v) => set("businessType", v)} columns={2} />
              </Field>
              <SelectField label="Sector" value={p.sector} onChange={(v) => set("sector", v)} options={SECTORS} placeholder="Select sector" />
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Project cost (₹)">
                  <Input type="number" min={0} step={10000} value={p.projectCost ?? ""} onChange={(e) => set("projectCost", Number(e.target.value) || 0)} className="tabular font-mono text-xs" placeholder="e.g. 500000" />
                </Field>
                <Field label="Investment needed (₹)">
                  <Input type="number" min={0} step={10000} value={p.investmentRequired ?? ""} onChange={(e) => set("investmentRequired", Number(e.target.value) || 0)} className="tabular font-mono text-xs" />
                </Field>
                <Field label="Experience (years)">
                  <Input type="number" min={0} step={1} value={p.businessExperience ?? ""} onChange={(e) => set("businessExperience", Number(e.target.value) || 0)} className="tabular font-mono text-xs" />
                </Field>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                <span className="text-primary">$</span> agriculture + education
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Are you a farmer / agri worker?">
                  <YesNo value={p.isFarmer} onChange={(v) => set("isFarmer", v)} />
                </Field>
                <Field label="Do you own/lease farmland?">
                  <YesNo value={p.ownsLand} onChange={(v) => set("ownsLand", v)} />
                </Field>
              </div>
              <Field label="Interested in farming / agri-business?">
                <YesNo value={p.interestedFarming} onChange={(v) => set("interestedFarming", v)} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField label="Highest qualification" value={p.qualification} onChange={(v) => set("qualification", v)} options={QUALIFICATIONS} placeholder="Select qualification" />
                <Field label="First-generation graduate?" hint="neither parent graduated">
                  <YesNo value={p.firstGraduate} onChange={(v) => set("firstGraduate", v)} />
                </Field>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                <span className="text-primary">$</span> review // ready to match
              </div>
              <div className="rounded-md border border-primary/25 bg-primary/[0.06] p-3">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                  primary need
                </p>
                <p className="mt-1 font-mono text-sm text-foreground">
                  {NEEDS.find((n) => n.key === p.needCategory)?.label ?? p.needCategory}
                  {p.needDescription && (
                    <span className="ml-2 text-xs text-muted-foreground">"{p.needDescription}"</span>
                  )}
                </p>
              </div>
              <div className="grid gap-x-6 gap-y-2 rounded-md border border-border bg-secondary/40 p-4 font-mono text-[11px]">
                {[
                  ["name", p.name || "—"],
                  ["age / gender", `${p.age ?? "—"} / ${p.gender ?? "—"}`],
                  ["category", p.category ?? "—"],
                  ["disability", p.hasDisability ? "yes" : "no"],
                  ["state / district", `${p.state ?? "—"} / ${p.district || "—"}`],
                  ["annual family income", p.annualFamilyIncome ? inrCompact(p.annualFamilyIncome) : "—"],
                  ["business", `${p.hasExistingBusiness ? "existing" : "new"} · ${p.businessType ?? "—"}`],
                  ["project cost", p.projectCost ? inrCompact(p.projectCost) : "—"],
                  ["experience", `${p.businessExperience ?? 0} yrs`],
                  ["farmer / land", `${p.isFarmer ? "farmer" : "no"} / ${p.ownsLand ? "owns land" : "landless"}`],
                ].map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[160px_1fr] gap-2">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="truncate text-foreground/85">{v}</span>
                  </div>
                ))}
              </div>
              {error && <p className="font-mono text-[11px] text-error">{error}</p>}
              <Button onClick={handleSave} disabled={saving} className="w-full font-mono text-sm">
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                {saving ? "matching schemes…" : "save profile & find my schemes"}
              </Button>
              <p className="text-center font-mono text-[10px] leading-4 text-muted-foreground">
                Your data is used only to match you with government schemes. Nothing is ever
                shared publicly.
              </p>
            </div>
          )}
        </div>

        {/* Nav */}
        <div className="mt-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="font-mono text-[11px]"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            <ArrowLeft className="size-3" /> back
          </Button>
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
            {STEPS.map((s, i) => (
              <span key={s} className={cn("hidden sm:inline", i === step && "text-primary")}>
                {s}
                {i < STEPS.length - 1 && <span className="mx-1">›</span>}
              </span>
            ))}
          </div>
          {step < STEPS.length - 1 && (
            <Button
              size="sm"
              className="font-mono text-[11px]"
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              disabled={!canContinue}
            >
              next <ArrowRight className="size-3" />
            </Button>
          )}
          {step === STEPS.length - 1 && <span className="w-[74px]" />}
        </div>
      </div>
    </main>
  );
}