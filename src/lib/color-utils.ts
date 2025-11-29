/**
 * Color Utility Functions
 *
 * Helpers for working with colors, contrast, and luminance calculations
 */

export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((x) => {
    x = x / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function getContrastText(backgroundColor: string): string {
  const rgb = hexToRgb(backgroundColor);
  if (!rgb) return '#000000';

  const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

export function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
  );
}

export const categoryColors: Record<string, string> = {
  food: '#DC2626',
  transport: '#3B82F6',
  utilities: '#8B5CF6',
  entertainment: '#EC4899',
  shopping: '#F59E0B',
  health: '#10B981',
  education: '#06B6D4',
  other: '#6B7280',
};

export function getCategoryColor(category?: string): string {
  if (!category) return categoryColors.other;
  return categoryColors[category.toLowerCase()] ?? categoryColors.other;
}

export function getCategoryTextColor(category?: string): string {
  const bgColor = getCategoryColor(category);
  return getContrastText(bgColor);
}
