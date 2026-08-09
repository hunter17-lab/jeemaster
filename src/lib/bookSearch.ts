export interface SearchableBook {
  id: string;
  title: string;
  author: string | null;
  edition: string | null;
  subject: string;
  link: string;
}

const norm = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

/** Ratio-based fuzzy: is `needle` an in-order subsequence of `hay` with few gaps? */
const subsequenceScore = (needle: string, hay: string): number => {
  let i = 0;
  let gaps = 0;
  for (let j = 0; j < hay.length && i < needle.length; j++) {
    if (hay[j] === needle[i]) i++;
    else if (i > 0) gaps++;
  }
  if (i < needle.length) return 0;
  return Math.max(0, 1 - gaps / (hay.length + 1));
};

const levenshtein = (a: string, b: string): number => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = cur;
  }
  return prev[b.length];
};

const tokenFuzzy = (token: string, words: string[]): number => {
  let best = 0;
  for (const w of words) {
    if (w === token) best = Math.max(best, 1);
    else if (w.startsWith(token)) best = Math.max(best, 0.85);
    else if (w.includes(token)) best = Math.max(best, 0.7);
    else if (token.length >= 4) {
      const d = levenshtein(token, w);
      const tol = token.length >= 7 ? 2 : 1;
      if (d <= tol) best = Math.max(best, 0.6 - d * 0.1);
    }
  }
  return best;
};

export interface BookResult<T extends SearchableBook> {
  book: T;
  score: number;
  fuzzyOnly: boolean;
}

export function searchBooks<T extends SearchableBook>(books: T[], rawQuery: string): BookResult<T>[] {
  const q = norm(rawQuery);
  if (!q) return [];
  const tokens = q.split(" ");
  const out: BookResult<T>[] = [];

  for (const book of books) {
    const title = norm(book.title);
    const author = norm(book.author || "");
    const subject = norm(book.subject || "");
    const edition = norm(book.edition || "");
    const haystack = `${title} ${author} ${subject} ${edition}`;
    const words = haystack.split(" ").filter(Boolean);

    let score = 0;
    let strong = false;

    if (title === q) { score += 1000; strong = true; }
    else if (title.startsWith(q)) { score += 700; strong = true; }
    else if (title.includes(q)) { score += 500; strong = true; }

    if (author.includes(q)) { score += 380; strong = true; }
    if (subject.includes(q) || edition.includes(q)) { score += 220; strong = true; }

    // per-token scoring for multi-word / partial queries
    let tokenTotal = 0;
    let matchedTokens = 0;
    for (const t of tokens) {
      const s = Math.max(
        tokenFuzzy(t, title.split(" ").filter(Boolean)) * 1.0,
        tokenFuzzy(t, author.split(" ").filter(Boolean)) * 0.9,
        tokenFuzzy(t, words) * 0.7,
      );
      if (s > 0) matchedTokens++;
      tokenTotal += s;
    }
    if (matchedTokens === tokens.length) {
      score += 150 * (tokenTotal / tokens.length);
      if (tokenTotal / tokens.length > 0.8) strong = true;
    } else if (matchedTokens > 0) {
      score += 40 * (tokenTotal / tokens.length);
    }

    // fuzzy subsequence fallback
    if (score === 0) {
      const sub = subsequenceScore(q.replace(/\s/g, ""), haystack.replace(/\s/g, ""));
      if (sub > 0.35) score += sub * 60;
    }

    if (score > 0) {
      // shorter titles win ties
      score += Math.max(0, 40 - title.length) * 0.2;
      out.push({ book, score, fuzzyOnly: !strong });
    }
  }

  out.sort((a, b) => b.score - a.score || a.book.title.localeCompare(b.book.title));
  return out.slice(0, 200);
}
