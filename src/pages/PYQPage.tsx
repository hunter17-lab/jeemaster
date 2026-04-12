import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Layout from "@/components/Layout";
import SubjectChapterList from "@/components/SubjectChapterList";
import { allSubjects, pyqYears } from "@/data/chapters";

const PYQPage = () => {
  const [tab, setTab] = useState<"papers" | "chapters">("papers");
  const [activeSubject, setActiveSubject] = useState(0);

  return (
    <Layout>
      <div className="page-container">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold mb-2">🎯 Previous Year Questions</h1>
          <p className="text-muted-foreground mb-6">Year-wise full papers & chapter-wise PYQs</p>
        </motion.div>

        <div className="flex gap-2 mb-8">
          {(["papers", "chapters"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t ? "gradient-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
              }`}
            >
              {t === "papers" ? "Full Papers (Year-wise)" : "Chapter-wise PYQ"}
            </button>
          ))}
        </div>

        {tab === "papers" ? (
          <div className="space-y-8">
            {/* Simple years */}
            <div className="glass-card p-6">
              <h3 className="font-display font-semibold mb-4">JEE Main — Single Paper</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {pyqYears.simple.map((y) => (
                  <a key={y} href={`#pyq-${y}`} className="chapter-item justify-center">
                    <span className="text-sm font-medium">{y}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Shift-wise years */}
            <div className="glass-card p-6">
              <h3 className="font-display font-semibold mb-4">JEE Main — Shift-wise (2019 onwards)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {pyqYears.shiftWise.map((y) => (
                  <div key={y} className="bg-secondary/50 rounded-lg p-4">
                    <h4 className="font-semibold mb-3">{y}</h4>
                    <div className="space-y-2">
                      {["Shift 1", "Shift 2"].map((s) => (
                        <a key={s} href={`#pyq-${y}-${s.replace(" ", "")}`} className="chapter-item">
                          <span className="text-sm">{s}</span>
                          <ChevronRight size={14} className="text-muted-foreground" />
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex gap-2 mb-6 flex-wrap">
              {allSubjects.map((s, i) => (
                <button
                  key={s.subject}
                  onClick={() => setActiveSubject(i)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeSubject === i ? "bg-primary/10 text-primary border border-primary/30" : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {s.subject}
                </button>
              ))}
            </div>
            <div className="glass-card p-6">
              <SubjectChapterList data={allSubjects[activeSubject]} sectionLabel="PYQ" />
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default PYQPage;
