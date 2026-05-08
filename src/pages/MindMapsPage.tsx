import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import SubjectChapterList from "@/components/SubjectChapterList";
import AdminItemsList from "@/components/AdminItemsList";
import { allSubjects } from "@/data/chapters";

const MindMapsPage = () => {
  const [activeSubject, setActiveSubject] = useState(0);

  return (
    <Layout>
      <div className="page-container">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold mb-2">🧠 Mind Maps</h1>
          <p className="text-muted-foreground mb-6">Visual chapter-wise summaries for quick revision</p>
        </motion.div>

        <div className="flex gap-2 mb-8 flex-wrap">
          {allSubjects.map((s, i) => (
            <button
              key={s.subject}
              onClick={() => setActiveSubject(i)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSubject === i ? "bg-primary/10 text-primary border border-primary/30" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {s.subject}
            </button>
          ))}
        </div>

        <AdminItemsList type="mindmaps" subject={allSubjects[activeSubject].subject} />
        <div className="glass-card p-6">
          <SubjectChapterList data={allSubjects[activeSubject]} sectionLabel="Mind Map" />
        </div>
      </div>
    </Layout>
  );
};

export default MindMapsPage;
