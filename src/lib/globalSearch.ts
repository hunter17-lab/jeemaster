/**
 * Global search engine — fuzzy, typo-tolerant, relevance-ranked search over a
 * flat in-memory index of every searchable resource in the app.
 */

export type SearchKind =
  | "NOTES"
  | "MIND MAPS"
  | "DPP"
  | "PYQ"
  | "BOOKS"
  | "COACHING"
  | "MOCK HUB"
  | "JEE HUB";

export interface SearchDoc {
  id: string;
  /** Primary label shown to the user. */
  title: string;
  /** Section this resource lives in. */
  kind: SearchKind;
  /** Subject / coaching / category badge. */
  category?: string | null;
  /** Extra badge (class, shift, material type, author...). */
  meta?: string | null;
  /** Author, topics, aliases — searched but not always displayed. */
  keywords?: string | null;
  /** Where clicking opens. */
  url: string;
  /** true when url points outside the app (Drive, mathongo...). */
  external: boolean;
  icon: string;
}

export interface SearchHit {
  doc: SearchDoc;
  score: number;
}

export const KIND_ORDER: SearchKind[] = [
  "NOTES",
  "MIND MAPS",
  "DPP",
  "PYQ",
  "BOOKS",
  "COACHING",
  "MOCK HUB",
  "JEE HUB",
];

export const KIND_ICON: Record<SearchKind, string> = {
  NOTES: "📘",
  "MIND MAPS": "🧠",
  DPP: "📝",
  PYQ: "🎯",
  BOOKS: "📚",
  COACHING: "🏫",
  "MOCK HUB": "🏆",
  "JEE HUB": "✨",
};

const norm = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

const levenshtein = (a: string, b: string): number => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
};

/** Best match score of one query token against a list of words. */
const tokenScore = (token: string, words: string[]): number => {
  let best = 0;
  for (const w of words) {
    if (w === token) return 1;
    if (w.startsWith(token)) best = Math.max(best, 0.88);
    else if (w.includes(token)) best = Math.max(best, 0.72);
    else if (token.length >= 4 && Math.abs(w.length - token.length) <= 3) {
      const d = levenshtein(token, w);
      const tol = token.length >= 7 ? 2 : 1;
      if (d <= tol) best = Math.max(best, 0.62 - d * 0.08);
    }
  }
  return best;
};

/** Is `needle` an in-order subsequence of `hay`, with few gaps? */
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

interface IndexedDoc {
  doc: SearchDoc;
  title: string;
  titleWords: string[];
  keywords: string;
  keywordWords: string[];
  category: string;
  meta: string;
  hayFlat: string;
}

/** Pre-normalises docs once so typing stays fast on thousands of records. */
export const buildIndex = (docs: SearchDoc[]): IndexedDoc[] =>
  docs.map((doc) => {
    const title = norm(doc.title);
    const keywords = norm(doc.keywords || "");
    const category = norm(doc.category || "");
    const meta = norm(doc.meta || "");
    const hay = `${title} ${keywords} ${category} ${meta} ${norm(doc.kind)}`;
    return {
      doc,
      title,
      titleWords: title.split(" ").filter(Boolean),
      keywords,
      keywordWords: keywords.split(" ").filter(Boolean),
      category,
      meta,
      hayFlat: hay.replace(/\s+/g, " ").trim(),
    };
  });

export type SearchIndex = ReturnType<typeof buildIndex>;

/**
 * Ranks the index against a raw query.
 * Order of priority: exact title > phrase > starts-with > contains >
 * keyword/topic > category > metadata > fuzzy.
 */
export function searchIndex(index: SearchIndex, rawQuery: string, limit = 300): SearchHit[] {
  const q = norm(rawQuery);
  if (!q) return [];
  const tokens = q.split(" ").filter(Boolean);
  const compact = q.replace(/\s/g, "");
  const hits: SearchHit[] = [];

  for (const entry of index) {
    let score = 0;

    if (entry.title === q) score += 1000;
    else if (entry.title.startsWith(q)) score += 720;
    else if (entry.title.includes(q)) score += 560;
    else if (entry.title.replace(/\s/g, "").includes(compact)) score += 420;

    if (entry.keywords.includes(q)) score += 300;
    if (entry.category.includes(q)) score += 210;
    if (entry.meta.includes(q)) score += 170;

    // multi-word / partial token matching
    let total = 0;
    let matched = 0;
    for (const t of tokens) {
      const s = Math.max(
        tokenScore(t, entry.titleWords),
        tokenScore(t, entry.keywordWords) * 0.9,
        tokenScore(t, entry.hayFlat.split(" ")) * 0.7,
      );
      if (s > 0) matched++;
      total += s;
    }
    const avg = total / tokens.length;
    if (matched === tokens.length) score += 200 * avg;
    else if (matched > 0) score += 45 * avg;

    // typo-tolerant fallback for glued/misspelled queries
    if (score === 0 && compact.length >= 4) {
      const sub = subsequenceScore(compact, entry.hayFlat.replace(/\s/g, ""));
      if (sub > 0.72) score += sub * 40;
    }

    if (score > 0) {
      score += Math.max(0, 40 - entry.title.length) * 0.25; // shorter titles win ties
      hits.push({ doc: entry.doc, score });
    }
  }

  hits.sort((a, b) => b.score - a.score || a.doc.title.localeCompare(b.doc.title));
  return hits.slice(0, limit);
}

/**
 * Groups hits by section. Groups are ordered by their most relevant hit so the
 * best match always appears first, with section order as the tie-breaker.
 */
export function groupHits(hits: SearchHit[]): { kind: SearchKind; hits: SearchHit[] }[] {
  const map = new Map<SearchKind, SearchHit[]>();
  for (const h of hits) {
    const list = map.get(h.doc.kind);
    if (list) list.push(h);
    else map.set(h.doc.kind, [h]);
  }
  return [...map.entries()]
    .map(([kind, list]) => ({ kind, hits: list }))
    .sort(
      (a, b) =>
        b.hits[0].score - a.hits[0].score ||
        KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind),
    );
}

