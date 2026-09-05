import { useMemo, useState } from "react";
import { TerminalCard } from "@/components/terminal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { inr } from "@/lib/format";
import { Calculator } from "lucide-react";
import type { Scheme } from "@/lib/eligibility";

type Inputs = {
  amount: number; // ₹
  rate: number; // % p.a.
  tenure: number; // years
  moratorium: number; // months
  subsidy: number; // % (principal) or >=100 => full interest subvention
  marketRate: number; // % p.a. comparison
  own: number; // ₹ own contribution
};

const DEFAULTS: Inputs = {
  amount: 5_00_000,
  rate: 8,
  tenure: 5,
  moratorium: 0,
  subsidy: 15,
  marketRate: 12,
  own: 0,
};

function compute(i: Inputs) {
  const rMonthly = i.rate / 100 / 12;
  const mktMonthly = i.marketRate / 100 / 12;
  const fullSubvention = i.subsidy >= 100;
  const subsidyAmount =
    !fullSubvention && i.subsidy > 0 ? (i.amount * i.subsidy) / 100 : 0;

  const loaned = Math.max(0, i.amount - subsidyAmount - i.own);
  const months = Math.max(1, i.tenure * 12 - i.moratorium);

  // Interest capitalised during moratorium.
  const P = loaned * Math.pow(1 + rMonthly, i.moratorium);
  const effRate = fullSubvention ? 0 : rMonthly;

  const emi =
    effRate === 0
      ? P / months
      : (P * effRate * Math.pow(1 + effRate, months)) /
        (Math.pow(1 + effRate, months) - 1);
  const totalPaid = emi * months;
  const interest = totalPaid - loaned;

  // Market comparison on the same loaned amount, no subvention/moratorium.
  const marketEmi =
    (loaned * mktMonthly * Math.pow(1 + mktMonthly, i.tenure * 12)) /
    (Math.pow(1 + mktMonthly, i.tenure * 12) - 1);
  const marketTotal = marketEmi * i.tenure * 12;
  const saved = Math.max(0, marketTotal - totalPaid) + subsidyAmount;

  return {
    emi,
    totalPaid,
    interest,
    subsidyAmount,
    marketEmi,
    marketTotal,
    saved,
    pctOutlay: i.amount > 0 ? Math.round((Math.min(totalPaid, marketTotal) / marketTotal) * 100) : 0,
  };
}

function Field({
  label,
  suffix,
  value,
  onChange,
  min,
  step = 1,
}: {
  label: string;
  suffix: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  step?: number;
}) {
  return (
    <div>
      <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      <div className="relative mt-1">
        <Input
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="tabular pr-12 font-mono text-sm"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-muted-foreground">
          {suffix}
        </span>
      </div>
    </div>
  );
}

export function FinancialCalculator({
  preset,
}: {
  preset?: Scheme["loanWindow"];
}) {
  const [inputs, setInputs] = useState<Inputs>({
    ...DEFAULTS,
    ...(preset
      ? {
          amount: Math.max(preset.min, preset.max) * 100000,
          rate: preset.rate,
          tenure: preset.tenureMax || 5,
          subsidy: preset.subsidy,
        }
      : {}),
  });

  const r = useMemo(() => compute(inputs), [inputs]);
  const set = (k: keyof Inputs) => (v: number) =>
    setInputs((p) => ({ ...p, [k]: v }));

  return (
    <TerminalCard
      title="financial_calculator.tsx — demo"
      right={<Calculator className="size-3.5 text-muted-foreground" />}
    >
      <div className="grid gap-4 md:grid-cols-[1fr_220px]">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Field label="Loan amount" suffix="₹" value={inputs.amount} onChange={set("amount")} min={0} step={10000} />
          <Field label="Interest" suffix="% p.a." value={inputs.rate} onChange={set("rate")} min={0} step={0.25} />
          <Field label="Tenure" suffix="yrs" value={inputs.tenure} onChange={set("tenure")} min={1} step={1} />
          <Field label="Moratorium" suffix="mo" value={inputs.moratorium} onChange={set("moratorium")} min={0} step={1} />
          <Field label="Subsidy" suffix="%" value={inputs.subsidy} onChange={set("subsidy")} min={0} step={5} />
          <Field label="Own contribution" suffix="₹" value={inputs.own} onChange={set("own")} min={0} step={10000} />
          <Field label="Market rate (compare)" suffix="% p.a." value={inputs.marketRate} onChange={set("marketRate")} min={0} step={0.25} />
        </div>

        <div className="rounded-md border border-primary/25 bg-primary/[0.06] p-3">
          <p className="font-mono text-[10px] uppercase tracking-wider text-primary">EMI (monthly)</p>
          <p className="tabular mt-1 font-mono text-2xl font-bold text-foreground">
            {inr(Math.round(r.emi))}
          </p>
          <div className="mt-3 space-y-1.5 font-mono text-[10px] text-muted-foreground">
            <p className="flex justify-between gap-2">
              <span>Total repayment</span>
              <span className="tabular text-foreground/80">{inr(Math.round(r.totalPaid))}</span>
            </p>
            <p className="flex justify-between gap-2">
              <span>Total interest</span>
              <span className="tabular text-foreground/80">{inr(Math.round(r.interest))}</span>
            </p>
            {r.subsidyAmount > 0 && (
              <p className="flex justify-between gap-2 text-primary">
                <span>Upfront subsidy</span>
                <span className="tabular">+ {inr(Math.round(r.subsidyAmount))}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <div className="mb-1 flex justify-between font-mono text-[10px] text-muted-foreground">
            <span>Scheme EMI vs market-rate EMI ({inputs.marketRate}%)</span>
            <span className="tabular text-primary">
              saves {inr(Math.round(Math.max(0, r.marketEmi - r.emi)))}/month
            </span>
          </div>
          <div className="flex h-2.5 gap-1 overflow-hidden rounded-sm">
            <div
              className="bg-primary transition-all duration-500"
              style={{ width: `${Math.min(100, (r.emi / Math.max(1, r.marketEmi)) * 100)}%` }}
            />
            <div className="flex-1 bg-foreground/15 transition-all duration-500" />
          </div>
          <div className="mt-1 flex justify-between font-mono text-[9px] text-muted-foreground">
            <span className="text-primary">● scheme {inr(Math.round(r.emi))}/mo</span>
            <span>● market {inr(Math.round(r.marketEmi))}/mo</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-amber-500/30 bg-amber-100/40 px-3 py-2">
          <p className="font-mono text-[11px] text-amber-800">
            Effective financial benefit with subsidy + interest savings
          </p>
          <p className="tabular font-mono text-sm font-bold text-amber-700">
            {inr(Math.round(r.saved))}
          </p>
        </div>
        <p className="font-mono text-[10px] leading-4 text-muted-foreground">
          Indicative prototype estimate only — actual rates, subsidy and moratorium are set by
          the official scheme guidelines.
        </p>
      </div>
    </TerminalCard>
  );
}