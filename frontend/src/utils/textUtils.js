/**
 * Converts a string to Sentence Case:
 * First letter of the first word capitalized, all remaining letters lowercase.
 * Example: "chocolate solar system" -> "Chocolate solar system"
 * Example: "CHOCOLATE SOLAR SYSTEM" -> "Chocolate solar system"
 */
export function toSentenceCase(str) {
  if (!str || typeof str !== 'string') return str || '';
  const trimmed = str.trim();
  if (!trimmed) return '';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}
