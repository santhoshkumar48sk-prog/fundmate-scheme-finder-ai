import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MatchRing } from "@/components/match-ring";
import { Brackets } from "@/components/terminal";
import type { Scheme, SchemeMatch } from "@/lib/eligibility";
import { DOC_LIBRARY } from "@/lib/eligibility";
import { inrCompact } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  BadgeCheck,
  Check,
  ExternalLink,
  FileText,
  Landmark,
  MapPin,
  ShieldCheck,
  TrendingUp,
  X,
} from "lucide-react";

export function SchemeDetail({
  match,
  open,
  onClose,
}: {
  match: SchemeMatch | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!match) return null;
  const s: Scheme = match.scheme;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader className="pr-6">
          <div className="flex flex-wrap items-center gap-2">
            <MatchRing score={match.score} size={44} stroke={4} />
            <div className="min-w-0">
              <DialogTitle className="font-mono text-base leading-snug">
                {s.name}
              </DialogTitle>
              <DialogDescription className="font-mono text-[11px]">
                {s.department} ·{" "}
                <Brackets>{s.level === "central" ? "CENTRAL GOVT" : "TAMIL NADU"}</Brackets> ·{" "}
                <Brackets>{s.sector}</Brackets>
              </DialogDescription>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" className="border-success/30 bg-success-light font-mono text-[10px] text-success-foreground">
              <BadgeCheck className="size-3" /> Officially verified
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                "font-mono text-[10px]",
                s.awareness === "hidden"
                  ? "border-ai/30 bg-ai-light text-ai-foreground"
                  : s.awareness === "lesser"
                    ? "border-info/30 bg-info-light text-info-foreground"
                    : "",
              )}
            >
              {s.awareness === "hidden"
                ? "Hidden gem — low awareness"
                : s.awareness === "lesser"
                  ? "Lesser-known scheme"
                  : "Commonly known scheme"}
            </Badge>
            <span className="font-mono text-[10px] text-muted-foreground">
              last verified {s.verifiedDate}
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-5">
          {/* Summary / benefit */}
          <section>
            <h4 className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Summary
            </h4>
            <p className="text-xs leading-6 text-foreground/80">{s.summary}</p>
            <div className="mt-3 rounded-md border border-primary/25 bg-primary/[0.06] p-3">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                What you get
              </p>
              <p className="mt-1 text-xs leading-5 text-foreground/85">{s.benefit}</p>
            </div>
            {s.loanWindow && (
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { l: "Loan range", v: `${inrCompact(s.loanWindow.min * 100000)} – ${inrCompact(s.loanWindow.max * 100000)}` },
                  { l: "Interest", v: `${s.loanWindow.rate}% p.a.` },
                  { l: "Subsidy", v: s.loanWindow.subsidy >= 100 ? "Up to 100%" : s.loanWindow.subsidy > 0 ? `${s.loanWindow.subsidy}%` : "—" },
                  { l: "Max tenure", v: `${s.loanWindow.tenureMax} yrs` },
                ].map((c) => (
                  <div key={c.l} className="rounded-md border border-border bg-secondary/50 p-2">
                    <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{c.l}</p>
                    <p className="tabular mt-0.5 font-mono text-xs font-semibold text-foreground">{c.v}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Why eligible / not */}
          <section>
            <h4 className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Why am I eligible?
            </h4>
            <ul className="space-y-1">
              {match.passed.map((p) => (
                <li key={p.rule.when} className="flex items-start gap-2 font-mono text-[11px] text-foreground/80">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                  <span>{p.rule.when}</span>
                </li>
              ))}
              {match.passed.length === 0 && (
                <li className="font-mono text-[11px] text-muted-foreground">No conditions met yet.</li>
              )}
            </ul>
            {match.failed.length > 0 && (
              <div className="mt-3">
                <h4 className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Why might I not fit — and how to fix it
                </h4>
                <ul className="space-y-1.5">
                  {match.failed.map((f) => (
                    <li key={f.rule.when} className="flex items-start gap-2 font-mono text-[11px]">
                      <X className="mt-0.5 size-3.5 shrink-0 text-warning" />
                      <span className="text-foreground/70">
                        {f.rule.when}
                        {f.rule.fix && (
                          <span className="mt-0.5 block text-foreground/80">
                            <TrendingUp className="mr-1 inline size-3 text-primary" />
                            {f.rule.fix}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {match.suggestions.length > 0 && (
              <p className="mt-3 font-mono text-[11px] text-primary">
                Legitimate actions could raise this match to{" "}
                <span className="tabular font-semibold">{match.potentialScore}%</span>.
              </p>
            )}
          </section>

          {/* Eligibility text */}
          <section>
            <h4 className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Eligibility (official summary)
            </h4>
            <p className="text-xs leading-6 text-foreground/80">{s.eligibilityText}</p>
          </section>

          {/* Documents */}
          <section>
            <h4 className="mb-1.5 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              <FileText className="size-3.5" /> Required documents
            </h4>
            <ul className="grid gap-1 sm:grid-cols-2">
              {s.documents.map((d) => (
                <li key={d} className="flex items-start gap-2 font-mono text-[11px] text-foreground/80">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-primary/70" />
                  <span>{DOC_LIBRARY[d]?.label ?? d}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Application route + official source */}
          <section className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-border bg-secondary/40 p-3">
              <p className="flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/80">
                <MapPin className="size-3.5 text-primary" /> Application route
              </p>
              <p className="mt-1.5 text-xs leading-5 text-foreground/80">{s.applicationRoute}</p>
              {s.helpdesk && (
                <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                  Helpdesk: {s.helpdesk}
                </p>
              )}
            </div>
            <div className="rounded-md border border-primary/25 bg-primary/[0.06] p-3">
              <p className="flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                <ShieldCheck className="size-3.5" /> Official source
              </p>
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-foreground/85">
                <Landmark className="size-3.5 text-primary" /> {s.officialSource}
              </p>
              <Button
                variant="link"
                className="h-auto p-0 font-mono text-[11px]"
                onClick={() => window.open(s.sourceUrl, "_blank", "noopener,noreferrer")}
              >
                {s.sourceUrl.replace(/^https?:\/\//, "")} <ExternalLink className="size-3" />
              </Button>
              <p className="mt-1.5 font-mono text-[10px] leading-4 text-muted-foreground">
                Prototype data — confirm the latest rules at the official portal before applying.
              </p>
            </div>
          </section>

        </div>
      </DialogContent>
    </Dialog>
  );
}