// Best stars per island, kept on this device only. Storage can be unavailable
// (private browsing); the game then simply forgets between visits.

const KEY = "notlara-progress-v1";

type Stars = Record<string, number>;

function read(): Stars {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    return value && typeof value === "object" ? (value as Stars) : {};
  } catch {
    return {};
  }
}

let cache: Stars | null = null;

export function getStars(topicId: string): number {
  cache ??= read();
  return cache[topicId] ?? 0;
}

/** Keep the best result. Returns true if this was a new record. */
export function saveStars(topicId: string, stars: number): boolean {
  cache ??= read();
  if (stars <= (cache[topicId] ?? 0)) return false;
  cache[topicId] = stars;
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    // storage unavailable — keep it for this visit
  }
  return true;
}

export function totalStars(): number {
  cache ??= read();
  return Object.values(cache).reduce((a, b) => a + b, 0);
}

export function resetProgress() {
  cache = {};
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
