export function getCategoryDisplayName(slug: string): string {
  const parts = slug.split(".");
  const lastPart = parts[parts.length - 1];
  return lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
}

export function getParentSlug(slug: string): string | null {
  const lastDotIndex = slug.lastIndexOf(".");
  return lastDotIndex > 0 ? slug.substring(0, lastDotIndex) : null;
}

export function getCategoryLevel(slug: string): number {
  return slug.split(".").length - 1;
}
