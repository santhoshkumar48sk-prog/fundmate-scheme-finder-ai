import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MatchRing } from "@/components/match-ring";
import { Brackets } from "@/components/terminal";
import type { SchemeMatch } from "@/lib/eligibility";
import { inrCompact, years } from "@/lib/format";
import { Check, ChevronRight, Crown, Medal, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

const MEDALS = ["#1", "#2", "#3"];

export function ratingLabel(r: SchemeMatch["rating"]): string {
  switch (r) {
    case "excellent":
      return "Excellent match";
    case "strong":
      return "Strong match";
    case "possible":
      return "Possible match";
    default:
      return "Low match";
  }
}

export function awarenessMeta(a: SchemeMatch["scheme"]["awareness"]): {
  label: string;
  tone: "green" | "amber" | "slate";
} {
  switch (a) {
    case "hidden":
      return { label: "You likely didn't know this", tone: "green" };
    case "lesser":
      return { label: "Lesser-known", tone: "amber" };
    default:
      return { label: "Commonly known", tone: "slate" };
  }
}

export function SchemeCard({
  match,
  rank,
  onOpen,
}: {
  match: SchemeMatch;
  rank: number;
  onOpen: (m: SchemeMatch) => void;
}) {
  const awareness = awarenessMeta(match.scheme.awareness);
  const ranked = rank <= 3;

  return (
    <div className="group relative overflow-hidden rounded-md border border-border bg-card transition-colors hover:border-primary/50">
      <div className="grid gap-4 p-4 sm:grid-cols-[auto_1fr_auto] sm:items-start sm:p-5">
        <div className="flex items-center gap-3 sm:flex-col sm:gap-1">
          {ranked ? (
            <span className="flex size-10 items-center justify-center rounded-md border border-border bg-secondary/70 font-mono text-sm font-semibold text-foreground">
              {rank === 1 ? <Crown className="size-4 text-amber-600" /> : rank === 2 ? <Medal className="size-4 text-foreground/70" /> : <Medal className="size-4 text-foreground/40" />}
            </span>
          ) : (
            <span className="flex size-10 items-center justify-center rounded-md border border-border bg-secondary/70 font-mono text-xs text-muted-foreground">
              {MEDALS[rank - 1] ?? `#${rank}`}
            </span>
          )}
          <MatchRing score={match.score} size={58} stroke={4.5} />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-mono text-sm font-semibold leading-tight text-foreground">
              {match.scheme.name}
            </h3>
            {match.scheme.awareness !== "known" && (
              <Badge
                variant="outline"
                className={cn(
                  "font-mono text-[10px]",
                  awareness.tone === "green"
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-amber-500/40 bg-amber-100/60 text-amber-700",
                )}
              >
                <Search className="size-3" /> {awareness.label}
              </Badge>
            )}
          </div>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">
            {match.scheme.department} · <Brackets>{match.scheme.level === "central" ? "CENTRAL" : "STATE"}</Brackets> · <Brackets>{match.scheme.sector}</Brackets>
          </p>

          <p className="mt-2 line-clamp-2 text-xs leading-5 text-foreground/75">
            {match.scheme.summary}
          </p>

          <ul className="mt-3 grid gap-1 sm:grid-cols-2">
            {match.passed.slice(0, 3).map((p) => (
              <li key={p.rule.when} className="flex items-start gap-1.5 font-mono text-[11px] text-foreground/70">
                <Check className="mt-0.5 size-3 shrink-0 text-primary" />
                <span className="line-clamp-1">{p.rule.when}</span>
              </li>
            ))}
            {match.failed.slice(0, 1).map((f) => (
              <li key={f.rule.when} className="flex items-start gap-1.5 font-mono text-[11px] text-muted-foreground">
                <X className="mt-0.5 size-3 shrink-0 text-amber-600" />
                <span className="line-clamp-1">{f.rule.when}</span>
              </li>
            ))}
          </ul>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-muted-foreground">
            {match.scheme.loanWindow && (
              <>
                <span>
                  up to <span className="tabular text-foreground/80">{inrCompact(match.scheme.loanWindow.max * 100000)}</span>
                </span>
                {match.scheme.loanWindow.subsidy > 0 && match.scheme.loanWindow.subsidy < 100 && (
                  <span className="text-primary">
                    +{match.scheme.loanWindow.subsidy}% subsidy
                  </span>
                )}
                <span>
                  ~{match.scheme.loanWindow.rate}% · {years(match.scheme.loanWindow.tenureMax)}
                </span>
              </>
            )}
            <span>{ratingLabel(match.rating)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-end">
          <Button
            variant="outline"
            size="sm"
            className="font-mono text-[11px]"
            onClick={() => onOpen(match)}
          >
            inspect <ChevronRight className="size-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}