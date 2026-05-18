import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Layout from "@/components/Layout";
import SubjectChapterList from "@/components/SubjectChapterList";
import AdminItemsList from "@/components/AdminItemsList";
import { allSubjects, pyqYears } from "@/data/chapters";
import { supabase } from "@/integrations/supabase/client";

const subjectEmojis = ["⚡ Physics", "🧪 Chemistry", "📐 Mathematics"];

const PYQPage = () => {
  const [tab, setTab] = useState<"papers" | "chapters">("papers");
  const [activeSubject, setActiveSubject] = useState(0);
  const [openShift, setOpenShift] = useState<string | null>(null);
  const [paperLinks, setPaperLinks] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase
      .from("content_items")
      .select("subject, section, link, created_at")
      .eq("type", "pyq")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const map: Record<string, string> = {};
        (data || []).forEach((it: any) => {
          const key = it.section ? `${it.subject}::${it.section}` : it.subject;
          if (!map[key]) map[key] = it.link;
        });
        setPaperLinks(map);
      });
  }, []);

  const toggleShift = (key: string) =>
    setOpenShift((prev) => (prev === key ? null : key));

  return (
    <Layout>
      <div className="page-container">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold mb-2">🎯 Previous Year Questions</h1>
          <p className="text-muted-foreground mb-6">Year-wise full papers & chapter-wise PYQs</p>
        </motion.div>

        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setTab("papers")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              tab === "papers" ? "gradient-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            }`}
          >
            📅 Full Papers (Year-wise)
          </button>
          <button
            onClick={() => setTab("chapters")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              tab === "chapters" ? "gradient-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            }`}
          >
            📖 Chapter-wise PYQ
          </button>
        </div>

        {tab === "papers" ? (
          <div className="space-y-8">
            <div className="glass-card p-6">
              <h3 className="font-display font-semibold mb-4">📝 JEE Main — Single Paper</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {pyqYears.simple.map((y) => {
                  const link = paperLinks[String(y)];
                  return (
                    <a
                      key={y}
                      href={link || `#pyq-${y}`}
                      target={link ? "_blank" : undefined}
                      rel={link ? "noreferrer" : undefined}
                      className={`chapter-item justify-center hover:scale-105 transition-transform ${!link ? "opacity-60" : ""}`}
                    >
                      <span className="text-sm font-medium">{y}{!link && " ·"}</span>
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-display font-semibold mb-4">📋 JEE Main — Shift-wise (2019 onwards)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {pyqYears.shiftWise.map((y) => (
                  <motion.div
                    key={y}
                    whileHover={{ scale: 1.02 }}
                    className="bg-secondary/50 rounded-xl p-4 border border-border/50"
                  >
                    <h4 className="font-semibold mb-3">📌 {y}</h4>
                    <div className="space-y-2">
                      {["Shift 1", "Shift 2"].map((s) => {
                        const key = `${y}-${s}`;
                        const isOpen = openShift === key;
                        return (
                          <div key={s}>
                            <button
                              onClick={() => toggleShift(key)}
                              className="chapter-item w-full"
                            >
                              <span className="text-sm">{s === "Shift 1" ? "🅰️" : "🅱️"} {s}</span>
                              <ChevronRight
                                size={14}
                                className={`text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`}
                              />
                            </button>
                            {isOpen && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="mt-2 ml-4 space-y-2 border-l border-border/50 pl-3"
                              >
                                {(
                                  y === 2020
                                    ? ["January Attempt", "September Attempt"]
                                    : y === 2021
                                    ? ["February Attempt", "March Attempt", "July Attempt", "August Attempt"]
                                    : y === 2022
                                    ? ["June Attempt", "July Attempt"]
                                    : ["January Attempt", "April Attempt"]
                                ).map((a) => {
                                  const month = a.split(" ")[0];
                                  const shiftSlug = s === "Shift 1" ? "shift1" : "shift2";
                                  const emojiMap: Record<string, string> = {
                                    January: "❄️",
                                    February: "💝",
                                    March: "🌷",
                                    April: "🌸",
                                    June: "☀️",
                                    July: "🌞",
                                    August: "🏖️",
                                    September: "🍂",
                                  };
                                  return (
                                    <a
                                      key={a}
                                      href={`/pyq/${y}/${shiftSlug}/${month}`}
                                      className="chapter-item"
                                    >
                                      <span className="text-sm">
                                        {emojiMap[month] || "📅"} {a}
                                      </span>
                                      <ChevronRight size={14} className="text-muted-foreground" />
                                    </a>
                                  );
                                })}
                              </motion.div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
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
                  {subjectEmojis[i]}
                </button>
              ))}
            </div>
            <AdminItemsList type="pyq" subject={allSubjects[activeSubject].subject} />
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
