const HEX_COLOR_PATTERN = /^#([A-Fa-f0-9]{6})$/;

const COLOR_PALETTE = [
  '#2563EB',
  '#0EA5E9',
  '#14B8A6',
  '#22C55E',
  '#EAB308',
  '#F97316',
  '#EF4444',
  '#EC4899',
  '#8B5CF6',
];

export const DEFAULT_COLLECTION_ICON = 'books';
export const DEFAULT_COLLECTION_TEMPLATE_ID = 'classic';
export const DEFAULT_ENTITY_SLUG = 'item';

const normalizeSpaces = (value: string): string => value.trim().replace(/\s+/g, ' ');

export const normalizeRequiredName = (rawName: string, entityLabel: string): string => {
  const normalized = normalizeSpaces(rawName);
  if (!normalized) {
    throw new Error(`Nome de ${entityLabel} e obrigatorio.`);
  }
  return normalized;
};

export const normalizeOptionalText = (rawValue: string | null | undefined): string | null => {
  if (typeof rawValue !== 'string') {
    return null;
  }
  const normalized = normalizeSpaces(rawValue);
  return normalized || null;
};

export const normalizeColorFromName = (rawColor: string | undefined, name: string): string => {
  const normalized = rawColor?.trim() ?? '';
  if (HEX_COLOR_PATTERN.test(normalized)) {
    return normalized.toUpperCase();
  }
  const paletteIndex = Math.abs(name.toLowerCase().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) %
    COLOR_PALETTE.length;
  return COLOR_PALETTE[paletteIndex];
};

export const normalizeLowercaseOrFallback = (rawValue: string | undefined, fallback: string): string => {
  const normalized = rawValue?.trim().toLowerCase() ?? '';
  return normalized || fallback;
};

export const toSlug = (value: string): string => {
  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

  return normalized || DEFAULT_ENTITY_SLUG;
};

export const createUniqueSlug = (name: string, slugExists: (slug: string) => boolean): string => {
  const baseSlug = toSlug(name);
  if (!slugExists(baseSlug)) {
    return baseSlug;
  }

  let suffix = 2;
  let candidate = `${baseSlug}-${suffix}`;
  while (slugExists(candidate)) {
    suffix += 1;
    candidate = `${baseSlug}-${suffix}`;
  }
  return candidate;
};

export const sanitizePositiveIds = (ids: number[]): number[] =>
  Array.from(new Set(ids.filter((id) => Number.isFinite(id) && id > 0).map((id) => Math.trunc(id))));

export const matchesSearchQuery = (value: string, query: string): boolean =>
  value.toLowerCase().includes(query.trim().toLowerCase());

