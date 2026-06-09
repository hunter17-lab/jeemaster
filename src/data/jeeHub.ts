import { Brain, BookOpenCheck, Trophy, Sparkles, FileQuestion, Layers, Zap } from "lucide-react";

export interface HubTool {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  url: string;
  icon: any;
  accent: string; // tailwind gradient classes
  badge?: string;
}

export const hubTools: HubTool[] = [
  {
    slug: "infinity-bank",
    title: "Infinity Question Bank — Maths",
    tagline: "Adaptive practice that never runs out",
    description: "An endless adaptive engine that keeps serving Maths problems calibrated to your level.",
    url: "https://www.acrolly.com/adaptive-learning",
    icon: Sparkles,
    accent: "from-violet-500 to-fuchsia-500",
    badge: "Adaptive",
  },
  {
    slug: "chapter-tests",
    title: "Chapter-wise Tests & PYQs",
    tagline: "Drill any chapter, any time",
    description: "Chapter selection for targeted test series and previous year questions.",
    url: "https://www.acrolly.com/chapter-selection",
    icon: Layers,
    accent: "from-sky-500 to-cyan-500",
  },
  {
    slug: "mains-pyq",
    title: "JEE Mains PYQ — Full Syllabus (Year-wise)",
    tagline: "Real papers, real pressure",
    description: "Year-wise full-syllabus JEE Mains previous year papers.",
    url: "https://www.acrolly.com/year-selection/JEE_MAINS",
    icon: Trophy,
    accent: "from-amber-500 to-orange-500",
  },
  {
    slug: "advanced-pyq",
    title: "JEE Advanced PYQ — Full Syllabus (Year-wise)",
    tagline: "The toughest, ranked by year",
    description: "Year-wise full-syllabus JEE Advanced previous year papers.",
    url: "https://www.acrolly.com/year-selection/JEE_ADVANCED",
    icon: Trophy,
    accent: "from-rose-500 to-red-500",
  },
  {
    slug: "ai-tutor",
    title: "AI Personal Tutor",
    tagline: "On-demand, every chapter",
    description: "An AI teacher that explains, solves and drills every JEE concept instantly.",
    url: "https://www.acrolly.com/ai-teacher/chapters",
    icon: Brain,
    accent: "from-emerald-500 to-teal-500",
    badge: "AI",
  },
  {
    slug: "mains-mock",
    title: "JEE Mains Mock Tests (Non-PYQ)",
    tagline: "Full-length fresh papers",
    description: "Brand new full mock papers designed for JEE Mains.",
    url: "https://www.acrolly.com/mock-full-test-papers?exam=JEE_MAIN",
    icon: FileQuestion,
    accent: "from-blue-500 to-indigo-500",
  },
  {
    slug: "mains-chapter-mock",
    title: "JEE Mains Chapter-wise Mock (Non-PYQ)",
    tagline: "Fresh chapter drills",
    description: "Chapter-wise non-PYQ mock tests for JEE Mains practice.",
    url: "https://www.acrolly.com/mock-chapter-selection",
    icon: BookOpenCheck,
    accent: "from-pink-500 to-rose-500",
  },
  {
    slug: "advanced-mock",
    title: "JEE Advanced Mock Tests (Non-PYQ)",
    tagline: "Full-length advanced challenge",
    description: "Fresh full-length mock papers for JEE Advanced.",
    url: "https://www.acrolly.com/mock-full-test-papers?exam=JEE_ADVANCED",
    icon: Zap,
    accent: "from-purple-500 to-violet-500",
  },
];

export const getHubTool = (slug: string) => hubTools.find((t) => t.slug === slug);
