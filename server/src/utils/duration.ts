const UNIT_MS: Record<string, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

// Parses simple "30d" / "15m" / "12h" / "45s" style strings into milliseconds.
// Falls back to `fallbackMs` if the string doesn't match — keeps callers safe
// even if an env var is misconfigured.
export function parseDurationMs(value: string, fallbackMs: number): number {
  const match = /^(\d+)\s*(s|m|h|d)$/.exec(value.trim());
  if (!match) return fallbackMs;
  const [, amount, unit] = match;
  return Number(amount) * UNIT_MS[unit];
}
