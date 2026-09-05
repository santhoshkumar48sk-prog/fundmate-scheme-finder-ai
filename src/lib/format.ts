/** Indian-rupee formatting with lakh/crore grouping. */
export function inr(n: number): string {
  const neg = n < 0;
  const abs = Math.abs(Math.round(n));
  const s = abs.toString();
  if (s.length <= 3) return `${neg ? "-" : ""}₹${s}`;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3);
  const grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `${neg ? "-" : ""}₹${grouped},${last3}`;
}

/** Compact amount: ₹2.5L, ₹1Cr, ₹50,000. */
export function inrCompact(n: number): string {
  if (n >= 10_000_000) {
    const v = n / 10_000_000;
    return `₹${trimZero(v)}Cr`;
  }
  if (n >= 100_000) {
    const v = n / 100_000;
    return `₹${trimZero(v)}L`;
  }
  if (n >= 1_000) return `₹${trimZero(n / 1_000)}k`;
  return `₹${n}`;
}

function trimZero(v: number): string {
  return (Math.round(v * 10) / 10).toString();
}

export function pct(n: number): string {
  return `${Math.round(n)}%`;
}

export function years(n: number): string {
  return n === 1 ? "1 year" : `${n} years`;
}

export function months(n: number): string {
  return n === 1 ? "1 month" : `${n} months`;
}