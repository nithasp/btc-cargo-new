const MONEY = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatMoney = (value: number): string => MONEY.format(value);

export const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

// The frontend adds 7 hours to these values itself, so they must stay naive UTC
// ("YYYY-MM-DD HH:mm:ss") exactly as the old Odoo API sent them; an ISO string with a zone would
// be shifted twice.
export function odooDateTime(value: Date | null | undefined): string | null {
  return value ? value.toISOString().slice(0, 19).replace('T', ' ') : null;
}

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export const escapeHtml = (value: unknown): string =>
  String(value ?? '').replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char);
