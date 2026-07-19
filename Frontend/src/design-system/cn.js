// Concatène des classes conditionnelles (falsy ignorés).
export function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}
