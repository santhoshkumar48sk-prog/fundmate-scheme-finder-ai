import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Terminal window chrome: traffic-light dots + title, body below. */
export function TerminalCard({
  title,
  right,
  children,
  className,
  bodyClassName,
}: {
  title: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-border bg-card terminal-shadow",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-border bg-secondary/70 px-3 py-2">
        <span className="flex gap-1.5">
          <i className="size-2.5 rounded-full bg-[#e0b341]/80" />
          <i className="size-2.5 rounded-full bg-primary/50" />
          <i className="size-2.5 rounded-full bg-foreground/20" />
        </span>
        <span className="ml-1 truncate font-mono text-[11px] tracking-wide text-muted-foreground">
          {title}
        </span>
        {right && <span className="ml-auto flex items-center gap-2">{right}</span>}
      </div>
      <div className={cn("p-4 sm:p-5", bodyClassName)}>{children}</div>
    </div>
  );
}

/** Green/amber/gray status LED. */
export function StatusLed({
  tone = "green",
  pulse = false,
  className,
}: {
  tone?: "green" | "amber" | "gray" | "red";
  pulse?: boolean;
  className?: string;
}) {
  const tones: Record<string, string> = {
    green: "bg-primary",
    amber: "bg-amber-500",
    gray: "bg-foreground/25",
    red: "bg-red-600",
  };
  return (
    <span
      className={cn(
        "inline-block size-2 shrink-0 rounded-full",
        tones[tone],
        pulse && "status-pulse",
        className,
      )}
      aria-hidden
    />
  );
}

/** `$ herald> text` style mono line. */
export function Prompt({
  children,
  dollar = true,
  className,
}: {
  children: ReactNode;
  dollar?: boolean;
  className?: string;
}) {
  return (
    <p className={cn("font-mono text-xs text-muted-foreground", className)}>
      <span className="text-primary">{dollar ? "$ " : ""}</span>
      {children}
      <span className="ml-1 inline-block h-3 w-1.5 translate-y-0.5 bg-primary/70 cursor-blink" />
    </p>
  );
}

/** Small uppercase mono section header. */
export function SectionLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground",
        className,
      )}
    >
      {children}
    </p>
  );
}

/** Tiny mono legend used for brackets like [status]. */
export function Brackets({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-[10px] text-muted-foreground">
      <span className="text-primary/70">[</span>
      {children}
      <span className="text-primary/70">]</span>
    </span>
  );
}