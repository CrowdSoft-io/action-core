export function slugify(name: string): string {
  return name.replace(/\s+/g, "_").replace(/\W+/g, "").replace(/_{2,}/g, "_").toLowerCase();
}
