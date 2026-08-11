import { motion } from "framer-motion";
import { ArrowRight, FileText, Bookmark, CheckCircle2, Zap, FlaskConical, Sigma } from "lucide-react";
import type { SubjectData } from "@/data/chapters";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useProgress } from "@/hooks/useProgress";

interface Props {
  data: SubjectData;
  sectionLabel?: string;
}

const colorMap = {
  physics: "gradient-physics",
  chemistry: "gradient-chemistry",
  maths: "gradient-maths",
};

const badgeMap = {
  physics: "bg-physics/15 text-physics",
  chemistry: "bg-chemistry/15 text-chemistry",
  maths: "bg-maths/15 text-maths",
};

const accent = {
  physics: {
    icon: Zap,
    text: "text-physics",
    bg: "bg-physics/10",
    ring: "border-physics/20 hover:border-physics/50",
    glow: "hover:shadow-physics/10",
    bar: "bg-physics",
  },
  chemistry: {
    icon: FlaskConical,
    text: "text-chemistry",
    bg: "bg-chemistry/10",
    ring: "border-chemistry/20 hover:border-chemistry/50",
    glow: "hover:shadow-chemistry/10",
    bar: "bg-chemistry",
  },
  maths: {
    icon: Sigma,
    text: "text-maths",
    bg: "bg-maths/10",
    ring: "border-maths/20 hover:border-maths/50",
    glow: "hover:shadow-maths/10",
    bar: "bg-maths",
  },
} as const;

const classSubtitle = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes("11")) return "11th Standard • JEE Foundation";
  if (t.includes("12")) return "12th Standard • JEE Advanced Prep";
  return "JEE Syllabus • Short Notes";
};

const SubjectChapterList = ({ data, sectionLabel }: Props) => {
  const { toggle: toggleBookmark, isBookmarked } = useBookmarks();
  const { toggleComplete, isCompleted } = useProgress();

  const a = accent[data.color];
  const SubjectIcon = a.icon;

  const totalChapters = data.sections.reduce((sum, s) => sum + s.chapters.length, 0);
  const doneCount = data.sections.reduce(
    (sum, s) => sum + s.chapters.filter((ch) => isCompleted(`${data.subject}-${ch.name}`)).length,
    0
  );
  const pct = totalChapters === 0 ? 0 : Math.round((doneCount / totalChapters) * 100);

  return (
    <div className="space-y-7">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${colorMap[data.color]} flex items-center justify-center`}>
          <FileText size={20} className="text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-lg">{data.subject}</h3>
          {sectionLabel && <span className={`subject-badge ${badgeMap[data.color]}`}>{sectionLabel}</span>}
        </div>
        <span className="text-xs text-muted-foreground shrink-0">{doneCount}/{totalChapters}</span>
      </div>

      {/* Overall progress bar */}
      <div className="w-full bg-secondary rounded-full h-2">
        <div
          className={`h-2 rounded-full ${colorMap[data.color]} transition-all duration-300`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {data.sections.map((section, si) => (
        <div key={si}>
          <div className="mb-4">
            <h4 className="font-display text-base font-bold uppercase tracking-wider">{section.title}</h4>
            <p className="text-xs text-muted-foreground mt-0.5">{classSubtitle(section.title)}</p>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-1">
            {section.chapters.map((ch, ci) => {
              const id = `${data.subject}-${ch.name}`;
              const done = isCompleted(id);
              const marked = isBookmarked(id);
              const progress = done ? 100 : 0;
              const num = String(ci + 1).padStart(2, "0");

              return (
                <motion.a
                  key={ci}
                  href={ch.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(ci * 0.025, 0.3) }}
                  className={`group relative block rounded-2xl border bg-gradient-to-br from-card/80 via-card/50 to-secondary/30 px-3.5 py-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:bg-secondary/40 ${a.ring} ${a.glow}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Number badge */}
                    <span
                      className={`mt-0.5 shrink-0 rounded-xl ${a.bg} ${a.text} px-2 py-1 text-xs font-bold font-display tabular-nums`}
                    >
                      {num}
                    </span>

                    {/* Icon */}
                    <span className={`mt-1 shrink-0 ${a.text}`}>
                      <SubjectIcon size={15} />
                    </span>

                    {/* Body */}
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-semibold leading-snug break-words ${
                          done ? "line-through text-muted-foreground" : "text-foreground"
                        }`}
                      >
                        {ch.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Chapter {num} •{" "}
                        <span className={done ? "text-success font-medium" : ""}>
                          {done ? "Completed" : "Not started"}
                        </span>
                      </p>

                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full bg-secondary overflow-hidden">
                          <div
                            className={`h-full rounded-full ${a.bar} transition-all duration-300`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] tabular-nums text-muted-foreground w-8 text-right">{progress}%</span>

                        <button
                          type="button"
                          aria-label={done ? "Mark as not started" : "Mark as completed"}
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleComplete(id); }}
                          className={`shrink-0 rounded-lg p-1 transition-colors ${
                            done ? "text-success" : "text-muted-foreground hover:text-success"
                          }`}
                        >
                          <CheckCircle2 size={15} />
                        </button>

                        <button
                          type="button"
                          aria-label={marked ? "Remove bookmark" : "Add bookmark"}
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleBookmark(id); }}
                          className={`shrink-0 rounded-lg p-1 transition-colors ${
                            marked ? "text-warning" : "text-muted-foreground hover:text-warning"
                          }`}
                        >
                          <Bookmark size={14} fill={marked ? "currentColor" : "none"} />
                        </button>

                        <ArrowRight
                          size={15}
                          className="shrink-0 text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary"
                        />
                      </div>
                    </div>
                  </div>
                </motion.a>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SubjectChapterList;
