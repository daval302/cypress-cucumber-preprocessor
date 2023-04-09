export function getTags(env: Record<string, unknown>): string | null {
  const tags = env.TAGS ?? env.tags;

  return tags == null ? null : String(tags);
}
