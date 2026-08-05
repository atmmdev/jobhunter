/**
 * Token Jaccard similarity for soft semantic dedupe of job titles/descriptions.
 */
export function jaccardSimilarity(left: string, right: string): number {
  const a = tokenize(left);
  const b = tokenize(right);
  if (a.size === 0 || b.size === 0) {
    return 0;
  }
  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) {
      intersection += 1;
    }
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Returns true when two job texts are near-duplicates above threshold.
 */
export function isNearDuplicate(
  left: string,
  right: string,
  threshold = 0.82,
): boolean {
  return jaccardSimilarity(left, right) >= threshold;
}

function tokenize(value: string): Set<string> {
  return new Set(
    value
      .toLowerCase()
      .split(/[^a-z0-9+#.]+/i)
      .filter((token) => token.length >= 3),
  );
}
