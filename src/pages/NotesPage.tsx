import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Trophy } from "lucide-react";
import Layout from "@/components/Layout";
import SubjectChapterList from "@/components/SubjectChapterList";
import { allSubjects } from "@/data/chapters";
import { chemistryShortNotes, physicsShortNotes } from "@/data/shortNotes";

const noteTypes = ["Short Notes", "Topper Notes"] as const;

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
              {t === "Short Notes" ? "📋 " : "🏆 "}{t}
            </button>
          ))}
        </div>

        {activeType === "Topper Notes" ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden glass-card p-10 md:p-16 text-center"
          >
            {/* Glow blobs */}
            <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-primary/30 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-accent/30 blur-3xl pointer-events-none" />

            <div className="relative flex flex-col items-center gap-5">
              <motion.div
                animate={{ rotate: [0, 8, -8, 0], y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/30"
              >
                <Trophy size={40} className="text-primary-foreground" />
              </motion.div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium uppercase tracking-widest">
                <Sparkles size={14} />
                In the works
              </div>

              <h2 className="font-display font-extrabold text-4xl md:text-6xl bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
                Coming Soon
              </h2>

              <p className="max-w-md text-muted-foreground text-sm md:text-base">
                Topper Notes are being curated from AIR holders and toppers. Stay tuned — something legendary is on the way.
              </p>

              {/* Animated dots */}
              <div className="flex items-center gap-2 mt-2">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-2.5 h-2.5 rounded-full bg-primary"
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <>
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
              <SubjectChapterList
                data={
                  allSubjects[activeSubject].subject === "Chemistry"
                    ? chemistryShortNotes
                    : allSubjects[activeSubject].subject === "Physics"
                    ? physicsShortNotes
                    : allSubjects[activeSubject]
                }
                sectionLabel={activeType}
              />
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default NotesPage;
