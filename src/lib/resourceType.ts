export const RESOURCE_TYPES = [
  "NOTES",
  "PAPER",
  "PYQ",
  "MODULE",
  "DPP",
  "TEST",
  "BOOK",
  "REFERENCE",
  "OTHER",
] as const;

export type ResourceType = (typeof RESOURCE_TYPES)[number];

const RULES: { tag: ResourceType; patterns: RegExp[] }[] = [
  { tag: "PYQ", patterns: [/\bpyqs?\b/i, /previous\s*year/i] },
  { tag: "DPP", patterns: [/\bdpp\b/i, /daily\s*practice/i] },
  { tag: "NOTES", patterns: [/\bnotes?\b/i, /handwritten/i, /short\s*note/i, /long\s*note/i] },
  { tag: "MODULE", patterns: [/\bmodules?\b/i] },
  { tag: "TEST", patterns: [/\btests?\b/i, /mock\s*test/i, /test\s*series/i] },
  { tag: "PAPER", patterns: [/\bpapers?\b/i, /question\s*paper/i, /\bshift\s*\d?\b/i] },
  { tag: "REFERENCE", patterns: [/\breference\b/i, /\brefresher\b/i] },
  { tag: "BOOK", patterns: [/\bbooks?\b/i, /\bedition\b/i, /\bvol(ume)?\.?\s*\d/i] },
];

/**
 * Resolve the resource-type tag for a content item.
 * An explicit admin-selected type always wins. Otherwise keywords are matched
 * against title / section / description. Returns null when unclear (no guessing).
 */
export const resolveResourceType = (item: {
  resource_type?: string | null;
  title?: string | null;
  section?: string | null;
  description?: string | null;
}): ResourceType | null => {
  const explicit = item.resource_type?.toUpperCase();
  if (explicit && (RESOURCE_TYPES as readonly string[]).includes(explicit)) {
    return explicit as ResourceType;
  }

  const haystack = [item.title, item.section, item.description].filter(Boolean).join(" ");
  if (!haystack.trim()) return null;

  for (const rule of RULES) {
    if (rule.patterns.some((p) => p.test(haystack))) return rule.tag;
  }
  return null;
};

export const resourceTypeStyles: Record<ResourceType, string> = {
  NOTES: "bg-primary/15 border-primary/30 text-primary",
  PAPER: "bg-accent/15 border-accent/30 text-accent",
  PYQ: "bg-warning/15 border-warning/30 text-warning",
  MODULE: "bg-accent/15 border-accent/30 text-accent",
  DPP: "bg-success/15 border-success/30 text-success",
  TEST: "bg-destructive/15 border-destructive/30 text-destructive",
  BOOK: "bg-primary/15 border-primary/30 text-primary",
  REFERENCE: "bg-muted border-border text-muted-foreground",
  OTHER: "bg-muted border-border text-muted-foreground",
};
