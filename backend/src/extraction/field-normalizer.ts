/**
 * Field-level normalization helpers. Templates extract raw spans; these
 * functions coerce them into canonical types so validation and ETL can
 * rely on stable shapes (numbers are numbers, dates are ISO 8601, …).
 *
 * Everything here is pure and side-effect free — easy to unit test.
 */

export const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Numeric currency amount parser. Accepts:
 *   "15,000.50", "15.000,50", "$15,000", "MXN 15.000,00", "1 234,56"
 * Returns null if the input is structurally not a number.
 */
export function parseAmount(raw: string | null | undefined): number | null {
  if (raw == null) return null;
  const cleaned = String(raw)
    .replace(/[^0-9,.\-]/g, '')
    .trim();
  if (!cleaned) return null;

  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');
  let normalized: string;

  if (lastComma === -1 && lastDot === -1) {
    normalized = cleaned;
  } else if (lastComma > lastDot) {
    // comma is the decimal separator (1.234,56)
    normalized = cleaned.replace(/\./g, '').replace(',', '.');
  } else {
    // dot is the decimal separator (1,234.56)
    normalized = cleaned.replace(/,/g, '');
  }

  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

/** ISO 4217-ish currency normalizer. Returns 3-letter uppercase or null. */
export function parseCurrency(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const upper = raw.toUpperCase();
  const symbol: Record<string, string> = {
    $: 'USD',
    '€': 'EUR',
    '£': 'GBP',
    '¥': 'JPY',
    'MX$': 'MXN',
    USD: 'USD',
    EUR: 'EUR',
    MXN: 'MXN',
    GBP: 'GBP',
    JPY: 'JPY',
    BRL: 'BRL',
    CAD: 'CAD',
    AUD: 'AUD',
  };
  for (const [k, v] of Object.entries(symbol)) {
    if (upper.includes(k)) return v;
  }
  const match = upper.match(/\b([A-Z]{3})\b/);
  return match ? match[1] : null;
}

/**
 * Date parser covering the formats we see in invoices/receipts:
 *   YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY (ambiguous → preferDmy decides),
 *   DD-MM-YYYY, D Mon YYYY, "May 21, 2026".
 * Returns a yyyy-mm-dd string or null.
 */
export function parseDate(raw: string | null | undefined, preferDmy = true): string | null {
  if (!raw) return null;
  const s = raw.trim();

  if (ISO_DATE_RE.test(s)) return s;

  // Numeric: 2026-05-21, 2026/05/21
  const iso = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (iso) return pad(iso[1], iso[2], iso[3]);

  // DD/MM/YYYY or MM/DD/YYYY
  const slash = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/);
  if (slash) {
    let y = slash[3];
    if (y.length === 2) y = (Number(y) > 50 ? '19' : '20') + y;
    const [a, b] = [slash[1], slash[2]];
    const [d, m] = preferDmy ? [a, b] : [b, a];
    return pad(y, m, d);
  }

  // Month-name forms
  const months = [
    'jan', 'feb', 'mar', 'apr', 'may', 'jun',
    'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
  ];
  const named = s.toLowerCase().match(/^(\d{1,2})\s+([a-z]{3,9})\s+(\d{4})$/);
  if (named) {
    const m = months.findIndex((mm) => named[2].startsWith(mm));
    if (m >= 0) return pad(named[3], String(m + 1), named[1]);
  }
  const namedUs = s.toLowerCase().match(/^([a-z]{3,9})\s+(\d{1,2}),?\s+(\d{4})$/);
  if (namedUs) {
    const m = months.findIndex((mm) => namedUs[1].startsWith(mm));
    if (m >= 0) return pad(namedUs[3], String(m + 1), namedUs[2]);
  }

  return null;
}

function pad(y: string, m: string, d: string): string {
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

/** Collapse internal whitespace and trim — useful for names and addresses. */
export function tidyString(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const s = String(raw).replace(/\s+/g, ' ').trim();
  return s.length === 0 ? null : s;
}

/** Simple match→capture helper used by every template. */
export function pickFirst(re: RegExp, text: string, group = 1): string | null {
  const m = text.match(re);
  return m ? (m[group] ?? null) : null;
}
