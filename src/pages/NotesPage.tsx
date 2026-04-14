import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import SubjectChapterList from "@/components/SubjectChapterList";
import { allSubjects } from "@/data/chapters";

const noteTypes = ["Long Notes", "Short Notes", "Topper Notes"] as const;

const subjectEmojis = ["⚡ Physics", "🧪 Chemistry", "📐 Mathematics"];

const NotesPage = () => {
  const [activeType, setActiveType] = useState<string>(noteTypes[0]);
  const [activeSubject, setActiveSubject] = useState(0);

  return (
    <Layout>
      <div className="page-container">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold mb-2">📘 Notes</h1>
          <p className="text-muted-foreground mb-6">Chapter-wise notes for Physics, Chemistry & Maths</p>
        </motion.div>

        {/* Note type tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {noteTypes.map((t) => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeType === t ? "gradient-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {t === "Long Notes" ? "📄 " : t === "Short Notes" ? "📋 " : "🏆 "}{t}
            </button>
          ))}
        </div>

        {/* Subject tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {allSubjects.map((s, i) => (
            <button
              key={s.subject}
              onClick={() => setActiveSubject(i)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSubject === i ? "bg-primary/10 text-primary border border-primary/30" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {subjectEmojis[i]}
            </button>
          ))}
        </div>

        <div className="glass-card p-6">
          <SubjectChapterList data={allSubjects[activeSubject]} sectionLabel={activeType} />
        </div>
      </div>
    </Layout>
  );
};

export default NotesPage;
