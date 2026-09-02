import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { allSubjects, pyqYears } from "@/data/chapters";
import { chemistryShortNotes, physicsShortNotes, mathsShortNotes } from "@/data/shortNotes";
import { getMonthsForYear, PYQ_SHIFTS } from "@/data/pyqAttempts";
import { hubTools } from "@/data/jeeHub";
import { COACHINGS } from "@/lib/coaching";
import { buildIndex, KIND_ICON, type SearchDoc } from "@/lib/globalSearch";

const BOOK_SLUG: Record<string, string> = {
  Physics: "physics",
  Chemistry: "chemistry",
  Mathematics: "mathematics",
  PCM: "pcm",
};

const shiftSlug = (shift: string) => (shift === "Shift 1" ? "shift1" : "shift2");

/** Every resource that lives in code (chapters, years, coachings, hub tools). */
const staticDocs = (): SearchDoc[] => {
  const docs: SearchDoc[] = [];

  // Short Notes (real chapter files)
  [physicsShortNotes, chemistryShortNotes, mathsShortNotes].forEach((subj) => {
    subj.sections.forEach((sec) => {
      sec.chapters.forEach((ch) => {
        docs.push({
          id: `note-${subj.subject}-${sec.title}-${ch.name}`,
          title: ch.name,
          kind: "NOTES",
          category: subj.subject,
          meta: sec.title,
          keywords: `short notes ${subj.subject} ${sec.title} chapter topic`,
          url: ch.link,
          external: true,
          icon: KIND_ICON.NOTES,
        });
      });
    });
  });

  // Chapter lists shared by Mind Maps, DPP and chapter-wise PYQ
  allSubjects.forEach((subj) => {
    subj.sections.forEach((sec) => {
      sec.chapters.forEach((ch) => {
        docs.push({
          id: `mm-${subj.subject}-${sec.title}-${ch.name}`,
          title: ch.name,
          kind: "MIND MAPS",
          category: subj.subject,
          meta: sec.title,
          keywords: `mind map revision ${subj.subject} ${sec.title} chapter topic`,
          url: "/mindmaps",
          external: false,
          icon: KIND_ICON["MIND MAPS"],
        });
        docs.push({
          id: `dpp-${subj.subject}-${sec.title}-${ch.name}`,
          title: `${ch.name} DPP`,
          kind: "DPP",
          category: subj.subject,
          meta: sec.title,
          keywords: `daily practice problems ${ch.name} ${subj.subject} ${sec.title}`,
          url: "/dpp",
          external: false,
          icon: KIND_ICON.DPP,
        });
        docs.push({
          id: `pyqch-${subj.subject}-${sec.title}-${ch.name}`,
          title: `${ch.name} PYQ`,
          kind: "PYQ",
          category: subj.subject,
          meta: "Chapter-wise",
          keywords: `previous year questions chapter wise ${ch.name} ${subj.subject}`,
          url: "/pyq",
          external: false,
          icon: KIND_ICON.PYQ,
        });
      });
    });
  });

  // PYQ full papers — single-paper years
  pyqYears.simple.forEach((y) => {
    docs.push({
      id: `pyqy-${y}`,
      title: `JEE Main ${y} Full Paper`,
      kind: "PYQ",
      category: "Full Papers",
      meta: String(y),
      keywords: `${y} previous year question paper jee main full paper`,
      url: "/pyq",
      external: false,
      icon: KIND_ICON.PYQ,
    });
  });

  // PYQ full papers — shift/month wise years
  pyqYears.shiftWise.forEach((y) => {
    PYQ_SHIFTS.forEach((shift) => {
      getMonthsForYear(y).forEach((month) => {
        docs.push({
          id: `pyqs-${y}-${shift}-${month}`,
          title: `JEE Main ${y} — ${shift} · ${month} Attempt`,
          kind: "PYQ",
          category: "Full Papers",
          meta: `${y} • ${shift}`,
          keywords: `${y} ${shift} ${month} attempt previous year paper jee main`,
          url: `/pyq/${y}/${shiftSlug(shift)}/${month}`,
          external: false,
          icon: KIND_ICON.PYQ,
        });
      });
    });
  });

  // Coaching institutes
  COACHINGS.forEach((c) => {
    docs.push({
      id: `coach-${c.slug}`,
      title: `${c.name} Material`,
      kind: "COACHING",
      category: c.short,
      meta: "All resources",
      keywords: `${c.name} ${c.short} ${c.slug} ${c.desc} coaching module dpp test notes`,
      url: `/coaching/${c.slug}`,
      external: false,
      icon: KIND_ICON.COACHING,
    });
  });

  // Book categories
  Object.entries(BOOK_SLUG).forEach(([key, slug]) => {
    docs.push({
      id: `bookcat-${slug}`,
      title: key === "PCM" ? "PCM Combined Books" : `${key} Books`,
      kind: "BOOKS",
      category: key,
      meta: "Category",
      keywords: `${key} books category collection`,
      url: `/books/${slug}`,
      external: false,
      icon: KIND_ICON.BOOKS,
    });
  });

  // JEE Hub tools
  hubTools.forEach((t) => {
    docs.push({
      id: `hub-${t.slug}`,
      title: t.title,
      kind: "JEE HUB",
      category: t.badge || "Tool",
      meta: t.tagline,
      keywords: `${t.tagline} ${t.description} jee hub practice`,
      url: `/hub/${t.slug}`,
      external: false,
      icon: KIND_ICON["JEE HUB"],
    });
  });

  // Mock Hub
  docs.push({
    id: "mock-hub",
    title: "Mock Hub",
    kind: "MOCK HUB",
    category: "Mock Tests",
    meta: "Section",
    keywords: "mock test series full syllabus practice exam mock hub",
    url: "/mock-hub",
    external: false,
    icon: KIND_ICON["MOCK HUB"],
  });

  return docs;
};

interface ContentRow {
  id: string;
  type: string;
  subject: string;
  section: string | null;
  title: string;
  description: string | null;
  link: string;
  resource_type: string | null;
}

const sel = (s: string): string => s;

const fetchContent = async (): Promise<ContentRow[]> => {
  const { data } = await supabase
    .from("content_items")
    .select(sel("id,type,subject,section,title,description,link,resource_type"))
    .order("created_at", { ascending: false })
    .returns<ContentRow[]>();
  return data ?? [];
};

/** Maps a database resource row to a search document. */
const rowToDoc = (r: ContentRow): SearchDoc | null => {
  switch (r.type) {
    case "books": {
      const slug = BOOK_SLUG[r.subject] || "physics";
      return {
        id: r.id,
        title: r.title,
        kind: "BOOKS",
        category: r.subject === "PCM" ? "PCM Combined" : r.subject,
        meta: r.section || r.resource_type || null,
        keywords: `${r.section || ""} ${r.description || ""} ${r.resource_type || ""} book /books/${slug}`,
        url: r.link,
        external: true,
        icon: KIND_ICON.BOOKS,
      };
    }
    case "coaching": {
      const c = COACHINGS.find((x) => x.slug === r.subject);
      return {
        id: r.id,
        title: r.title,
        kind: "COACHING",
        category: c?.short || r.subject.toUpperCase(),
        meta: r.resource_type || "OTHER",
        keywords: `${c?.name || r.subject} ${r.resource_type || ""} ${r.description || ""} coaching material`,
        url: r.link,
        external: true,
        icon: KIND_ICON.COACHING,
      };
    }
    case "pyq":
      return {
        id: r.id,
        title: r.title,
        kind: "PYQ",
        category: "Full Papers",
        meta: [r.subject, r.section].filter(Boolean).join(" • "),
        keywords: `${r.subject} ${r.section || ""} previous year question paper jee main`,
        url: r.link,
        external: true,
        icon: KIND_ICON.PYQ,
      };
    case "notes":
    case "mindmaps":
    case "dpp":
      return {
        id: r.id,
        title: r.title,
        kind: r.type === "notes" ? "NOTES" : r.type === "dpp" ? "DPP" : "MIND MAPS",
        category: r.subject,
        meta: r.section || null,
        keywords: `${r.section || ""} ${r.description || ""} ${r.subject}`,
        url: r.link,
        external: true,
        icon: r.type === "notes" ? KIND_ICON.NOTES : r.type === "dpp" ? KIND_ICON.DPP : KIND_ICON["MIND MAPS"],
      };
    default:
      return null;
  }
};

/**
 * Builds the full app-wide search index once (static content + one database
 * request, cached), so typing never triggers new network calls.
 */
export const useSearchIndex = () => {
  const { data: rows, isLoading } = useQuery({
    queryKey: ["global-search-content"],
    queryFn: fetchContent,
    staleTime: 5 * 60 * 1000,
  });

  const index = useMemo(() => {
    const dbDocs = (rows ?? []).map(rowToDoc).filter((d): d is SearchDoc => d !== null);
    return buildIndex([...dbDocs, ...staticDocs()]);
  }, [rows]);

  return { index, loading: isLoading };
};
