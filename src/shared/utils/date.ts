/**
 * Calendar-date helpers that use the PHONE'S LOCAL date.
 *
 * Never use `new Date().toISOString().slice(0, 10)` for "today": that is the
 * UTC date, which in India (UTC+5:30) is still yesterday until 5:30 AM, so
 * "today" filters, promo start dates and expiry checks would be a day off.
 */

/** Local calendar date of a Date, as 'YYYY-MM-DD'. */
export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Today's local calendar date, 'YYYY-MM-DD'. */
export function localToday(): string {
  return toDateString(new Date());
}

/** 'YYYY-MM-DD' -> Date at LOCAL midnight. */
export function dateStringToDate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** 'YYYY-MM-DD' -> "Thu, 12 Nov" (adds the year when it isn't this year). */
export function formatShortDate(value: string | null | undefined): string {
  if (!value) return '';
  const date = dateStringToDate(value.slice(0, 10));
  if (Number.isNaN(date.getTime())) return value;
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}
