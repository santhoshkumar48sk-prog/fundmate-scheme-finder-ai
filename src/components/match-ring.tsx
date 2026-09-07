import { cn } from "@/lib/utils";

/** Circular match-score gauge. */
export function MatchRing({
  score,
  size = 64,
  stroke = 5,
  className,
  label,
}: {
  score: number;
  size?: number;
  stroke?: number;
  className?: string;
  label?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color =
    score >= 90 ? "stroke-primary" : score >= 75 ? "stroke-ai" : score >= 55 ? "stroke-info" : "stroke-disabled";

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Match score ${score} percent`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-border"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={c - (c * Math.min(100, score)) / 100}
          strokeLinecap="round"
          className={cn("transition-all duration-700", color)}
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="tabular font-mono text-sm font-semibold text-foreground">
          {score}
          <span className="text-[10px] text-muted-foreground">%</span>
        </span>
        {label && (
          <span className="mt-0.5 font-mono text-[8px] uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
        )}
      </span>
    </div>
  );
}