import { GraduationCap, Atom, Rocket, BookOpen } from "lucide-react";

export const COACHING_MATERIAL_TYPES = ["MODULE", "DPP", "TEST", "NOTES", "OTHER"] as const;
export type CoachingMaterialType = (typeof COACHING_MATERIAL_TYPES)[number];

export interface CoachingInstitute {
  slug: string;
  name: string;
  short: string;
  desc: string;
  icon: typeof GraduationCap;
  gradient: string;
  ring: string;
  accent: string;
}

export const COACHINGS: CoachingInstitute[] = [
  {
    slug: "allen",
    name: "ALLEN",
    short: "ALLEN",
    desc: "JEE Study Material",
    icon: GraduationCap,
    gradient: "from-primary/25 via-primary/10 to-transparent",
    ring: "border-primary/30 hover:border-primary/60",
    accent: "text-primary",
  },
  {
    slug: "pw",
    name: "Physics Wallah (PW)",
    short: "PW",
    desc: "Modules, DPPs & Tests",
    icon: Rocket,
    gradient: "from-accent/25 via-accent/10 to-transparent",
    ring: "border-accent/30 hover:border-accent/60",
    accent: "text-accent",
  },
  {
    slug: "fiitjee",
    name: "FIITJEE",
    short: "FIITJEE",
    desc: "Premium Study Packages",
    icon: Atom,
    gradient: "from-primary/20 via-secondary/40 to-transparent",
    ring: "border-border hover:border-primary/50",
    accent: "text-primary",
  },
  {
    slug: "narayana",
    name: "NARAYANA",
    short: "NARAYANA",
    desc: "Modules & Test Series",
    icon: BookOpen,
    gradient: "from-success/25 via-primary/10 to-transparent",
    ring: "border-success/30 hover:border-success/60",
    accent: "text-success",
  },
];

export const getCoaching = (slug?: string) => COACHINGS.find((c) => c.slug === slug);

export const coachingMaterialType = (value?: string | null): CoachingMaterialType => {
  const v = (value || "").toUpperCase();
  return (COACHING_MATERIAL_TYPES as readonly string[]).includes(v)
    ? (v as CoachingMaterialType)
    : "OTHER";
};

export const materialTypeStyles: Record<CoachingMaterialType, string> = {
  MODULE: "bg-primary/15 border-primary/30 text-primary",
  DPP: "bg-success/15 border-success/30 text-success",
  TEST: "bg-destructive/15 border-destructive/30 text-destructive",
  NOTES: "bg-accent/15 border-accent/30 text-accent",
  OTHER: "bg-muted border-border text-muted-foreground",
};
