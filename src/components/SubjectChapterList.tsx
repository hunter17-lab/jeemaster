import { motion } from "framer-motion";
import { ChevronRight, FileText } from "lucide-react";
import type { SubjectData } from "@/data/chapters";

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

const SubjectChapterList = ({ data, sectionLabel }: Props) => (
  <div className="space-y-6">
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl ${colorMap[data.color]} flex items-center justify-center`}>
        <FileText size={20} className="text-primary-foreground" />
      </div>
      <div>
        <h3 className="font-display font-bold text-lg">{data.subject}</h3>
        {sectionLabel && <span className={`subject-badge ${badgeMap[data.color]}`}>{sectionLabel}</span>}
      </div>
    </div>

    {data.sections.map((section, si) => (
      <div key={si}>
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{section.title}</h4>
        <div className="grid gap-2">
          {section.chapters.map((ch, ci) => (
            <motion.a
              key={ci}
              href={ch.link}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: ci * 0.03 }}
              className="chapter-item"
            >
              <span className="text-sm font-medium">{ch.name}</span>
              <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </motion.a>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export default SubjectChapterList;
