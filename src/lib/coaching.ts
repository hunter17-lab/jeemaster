import { GraduationCap, Atom, Rocket, BookOpen, Sigma, Landmark, Lightbulb, School, Compass } from "lucide-react";

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
  {
    slug: "aakash",
    name: "AAKASH",
    short: "AAKASH",
    desc: "JEE Study Material",
    icon: Atom,
    gradient: "from-[hsl(190_80%_45%/0.28)] via-[hsl(210_80%_45%/0.12)] to-transparent",
    ring: "border-[hsl(190_80%_50%/0.35)] hover:border-[hsl(190_80%_55%/0.7)]",
    accent: "text-[hsl(190_85%_60%)]",
  },
  {
    slug: "mathongo",
    name: "MATHONGO",
    short: "MATHONGO",
    desc: "JEE Study Material",
    icon: Sigma,
    gradient: "from-[hsl(28_90%_50%/0.28)] via-[hsl(280_70%_50%/0.12)] to-transparent",
    ring: "border-[hsl(28_90%_55%/0.35)] hover:border-[hsl(28_90%_60%/0.7)]",
    accent: "text-[hsl(30_92%_62%)]",
  },
  {
    slug: "bansal",
    name: "BANSAL CLASSES",
    short: "BANSAL",
    desc: "JEE Study Material",
    icon: Landmark,
    gradient: "from-[hsl(0_75%_48%/0.26)] via-[hsl(220_75%_45%/0.12)] to-transparent",
    ring: "border-[hsl(0_75%_52%/0.35)] hover:border-[hsl(0_75%_58%/0.7)]",
    accent: "text-[hsl(2_80%_63%)]",
  },
  {
    slug: "esaral",
    name: "E-SARAL",
    short: "E-SARAL",
    desc: "JEE Study Material",
    icon: Lightbulb,
    gradient: "from-[hsl(275_75%_52%/0.28)] via-[hsl(325_75%_50%/0.12)] to-transparent",
    ring: "border-[hsl(285_75%_58%/0.35)] hover:border-[hsl(285_75%_62%/0.7)]",
    accent: "text-[hsl(290_80%_70%)]",
  },
  {
    slug: "motion",
    name: "MOTION",
    short: "MOTION",
    desc: "JEE Study Material",
    icon: Rocket,
    gradient: "from-[hsl(20_88%_50%/0.26)] via-[hsl(205_80%_45%/0.12)] to-transparent",
    ring: "border-[hsl(20_88%_55%/0.35)] hover:border-[hsl(20_88%_60%/0.7)]",
    accent: "text-[hsl(20_90%_63%)]",
  },
  {
    slug: "sri_chaitanya",
    name: "SRI CHAITANYA",
    short: "SRI CHAITANYA",
    desc: "JEE Study Material",
    icon: School,
    gradient: "from-[hsl(150_70%_40%/0.28)] via-[hsl(180_70%_40%/0.12)] to-transparent",
    ring: "border-[hsl(158_70%_45%/0.35)] hover:border-[hsl(158_70%_50%/0.7)]",
    accent: "text-[hsl(158_72%_55%)]",
  },
  {
    slug: "vmc",
    name: "VMC",
    short: "VMC",
    desc: "JEE Study Material",
    icon: Compass,
    gradient: "from-[hsl(220_80%_50%/0.28)] via-[hsl(262_75%_52%/0.14)] to-transparent",
    ring: "border-[hsl(235_80%_58%/0.35)] hover:border-[hsl(235_80%_62%/0.7)]",
    accent: "text-[hsl(240_85%_72%)]",
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
