export function slugify(parts: Array<string | number | undefined>): string {
  return parts
    .filter((p): p is string | number => p !== undefined && p !== '')
    .map((p) => String(p).toLowerCase().trim())
    .join(' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
