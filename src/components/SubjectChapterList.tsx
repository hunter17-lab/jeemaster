import { motion } from "framer-motion";
import { ChevronRight, FileText, Bookmark, CheckCircle2 } from "lucide-react";
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

const SubjectChapterList = ({ data, sectionLabel }: Props) => {
  const { toggle: toggleBookmark, isBookmarked } = useBookmarks();
  const { toggleComplete, isCompleted, completed } = useProgress();

  const totalChapters = data.sections.reduce((sum, s) => sum + s.chapters.length, 0);
  const doneCount = data.sections.reduce(
    (sum, s) => sum + s.chapters.filter((ch) => isCompleted(`${data.subject}-${ch.name}`)).length,
    0
  );
  const pct = totalChapters === 0 ? 0 : Math.round((doneCount / totalChapters) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${colorMap[data.color]} flex items-center justify-center`}>
          <FileText size={20} className="text-primary-foreground" />
        </div>
        <div className="flex-1">
          <h3 className="font-display font-bold text-lg">{data.subject}</h3>
          {sectionLabel && <span className={`subject-badge ${badgeMap[data.color]}`}>{sectionLabel}</span>}
        </div>
        <span className="text-xs text-muted-foreground">{doneCount}/{totalChapters}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-secondary rounded-full h-2">
        <div
          className={`h-2 rounded-full ${colorMap[data.color]} transition-all duration-300`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {data.sections.map((section, si) => (
        <div key={si}>
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{section.title}</h4>
          <div className="grid gap-2">
            {section.chapters.map((ch, ci) => {
              const id = `${data.subject}-${ch.name}`;
              return (
                <motion.div
                  key={ci}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: ci * 0.03 }}
                  className="chapter-item group"
                >
                  <a href={ch.link} className="flex-1 flex items-center gap-2 min-w-0">
                    <button
                      onClick={(e) => { e.preventDefault(); toggleComplete(id); }}
                      className={`shrink-0 transition-colors ${isCompleted(id) ? "text-green-500" : "text-muted-foreground hover:text-green-400"}`}
                    >
                      <CheckCircle2 size={16} />
                    </button>
                    <span className={`text-sm font-medium truncate ${isCompleted(id) ? "line-through text-muted-foreground" : ""}`}>
                      {ch.name}
                    </span>
                  </a>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.preventDefault(); toggleBookmark(id); }}
                      className={`shrink-0 transition-colors ${isBookmarked(id) ? "text-yellow-500" : "text-muted-foreground hover:text-yellow-400"}`}
                    >
                      <Bookmark size={14} fill={isBookmarked(id) ? "currentColor" : "none"} />
                    </button>
                    <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SubjectChapterList;
