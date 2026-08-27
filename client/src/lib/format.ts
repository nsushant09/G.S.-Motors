/** Nepali lakh grouping: 8450000 -> "84,50,000" (last 3 digits, then pairs). */
function groupNepali(digits: string): string {
  if (digits.length <= 3) return digits;
  const lastThree = digits.slice(-3);
  let rest = digits.slice(0, -3);
  let grouped = '';
  while (rest.length > 2) {
    grouped = ',' + rest.slice(-2) + grouped;
    rest = rest.slice(0, -2);
  }
  grouped = rest + grouped;
  return `${grouped},${lastThree}`;
}

export function formatNPR(amount: number): string {
  const negative = amount < 0;
  const digits = Math.round(Math.abs(amount)).toString();
  return `Rs. ${negative ? '-' : ''}${groupNepali(digits)}`;
}

export function formatKm(km: number): string {
  return `${Math.round(km).toLocaleString('en-US')} km`;
}

export function formatNumber(value: number): string {
  return Math.round(value).toLocaleString('en-US');
}

export function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
