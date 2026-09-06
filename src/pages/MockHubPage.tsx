import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Target, Bot, School, ClipboardList, BookOpen, TrendingUp, Flame,
  ArrowLeft, ArrowRight, ChevronDown, Zap, FlaskConical, Sigma,
  Clock3, Star, CheckCircle2, AlertTriangle, Timer,
} from "lucide-react";
import Layout from "@/components/Layout";
import useSEO from "@/hooks/useSEO";
import { allSubjects } from "@/data/chapters";

type HubTab = "ai" | "coaching";
type Exam = "JEE Main" | "JEE Advanced";
type Difficulty = "Easy" | "Medium" | "Hard" | "Mixed";
type TimeMode = "standard" | "challenge";

const QUESTION_COUNTS = [10, 20, 30, 60, 75] as const;
const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard", "Mixed"];

const subjectMeta = {
  Physics: { icon: Zap, emoji: "⚡", chip: "bg-physics/15 text-physics", bar: "bg-physics" },
  Chemistry: { icon: FlaskConical, emoji: "🧪", chip: "bg-chemistry/15 text-chemistry", bar: "bg-chemistry" },
  Mathematics: { icon: Sigma, emoji: "📐", chip: "bg-maths/15 text-maths", bar: "bg-maths" },
} as const;

// Minutes per question per exam (JEE Main ~3min/q, JEE Advanced ~4min/q)
const minsPerQuestion = (exam: Exam) => (exam === "JEE Main" ? 3 : 4);

const MockHubPage = () => {
  useSEO({
    title: "Mock Hub — JEE MASTER",
    description: "Create custom JEE Main and JEE Advanced mock tests by subject, chapter, difficulty, and time mode.",
  });

  const [hubTab, setHubTab] = useState<HubTab>("ai");
  const [view, setView] = useState<"menu" | "create">("menu");

  // Create-test state
  const [exam, setExam] = useState<Exam | null>(null);
  const [openSubjects, setOpenSubjects] = useState<string[]>([]);
  const [selectedChapters, setSelectedChapters] = useState<Set<string>>(new Set());
  const [difficulty, setDifficulty] = useState<Difficulty>("Mixed");
  const [questionCount, setQuestionCount] = useState<number>(30);
  const [timeMode, setTimeMode] = useState<TimeMode>("standard");
  const [result, setResult] = useState<{ type: "error" | "success"; message: string } | null>(null);

  const chapterKey = (subject: string, name: string) => `${subject}::${name}`;

  const toggleSubjectOpen = (s: string) =>
    setOpenSubjects((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const toggleChapter = (subject: string, name: string) => {
    setSelectedChapters((prev) => {
      const next = new Set(prev);
      const key = chapterKey(subject, name);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const subjectChapters = (subject: string) =>
    allSubjects.find((d) => d.subject === subject)?.sections.flatMap((s) => s.chapters.map((c) => c.name)) ?? [];

  const selectedForSubject = (subject: string) =>
    subjectChapters(subject).filter((c) => selectedChapters.has(chapterKey(subject, c))).length;

  const toggleSelectAll = (subject: string) => {
    const names = subjectChapters(subject);
    setSelectedChapters((prev) => {
      const next = new Set(prev);
      const allSelected = names.every((n) => next.has(chapterKey(subject, n)));
      names.forEach((n) => {
        const key = chapterKey(subject, n);
        if (allSelected) next.delete(key);
        else next.add(key);
      });
      return next;
    });
  };

  const selectedSubjects = useMemo(
    () => allSubjects.filter((d) => selectedForSubject(d.subject) > 0).map((d) => d.subject),
    [selectedChapters]
  );
  const totalChaptersSelected = selectedChapters.size;

  const standardMinutes = questionCount * minsPerQuestion(exam ?? "JEE Main");
  const challengeMinutes = Math.max(standardMinutes - 15, 5);
  const activeMinutes = timeMode === "standard" ? standardMinutes : challengeMinutes;

  const recommendedCount = exam === "JEE Advanced" ? 60 : 75;

  const handleGenerate = () => {
    if (!exam) return setResult({ type: "error", message: "Please select an exam: JEE Main or JEE Advanced." });
    if (totalChaptersSelected === 0) return setResult({ type: "error", message: "Please select at least one subject and chapter." });
    if (!difficulty) return setResult({ type: "error", message: "Please select a difficulty." });
    if (!questionCount) return setResult({ type: "error", message: "Please select the number of questions." });
    if (!timeMode) return setResult({ type: "error", message: "Please select a time mode." });
    setResult({ type: "success", message: "Test configuration saved. Test generation will be added in the next step." });
  };

  const hubTabs: { id: HubTab; label: string; icon: typeof Bot }[] = [
    { id: "ai", label: "AI Test Series", icon: Bot },
    { id: "coaching", label: "Coaching Test Series", icon: School },
  ];

  const aiOptions = [
    { id: "create", emoji: "📝", title: "Create Your Test", desc: "Build a custom test by exam, subject, chapter, difficulty and time.", icon: ClipboardList, action: () => setView("create") },
    { id: "past", emoji: "📚", title: "Past Tests", desc: "Revisit and re-attempt your previous tests.", icon: BookOpen, comingSoon: true },
    { id: "performance", emoji: "📈", title: "Performance", desc: "Track scores, accuracy and progress over time.", icon: TrendingUp, comingSoon: true },
    { id: "mistakes", emoji: "🔥", title: "Mistake Practice", desc: "Re-practice only the questions you got wrong.", icon: Flame, comingSoon: true },
  ];

  const pill = (active: boolean) =>
    `inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 border ${
      active
        ? "gradient-primary text-primary-foreground border-primary/40 shadow-lg shadow-primary/25"
        : "bg-secondary/60 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
    }`;

  const optionPill = (active: boolean) =>
    `rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
      active
        ? "gradient-primary text-primary-foreground border-primary/40 shadow-md shadow-primary/20"
        : "bg-secondary/50 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
    }`;

  return (
    <Layout>
      <div className="page-container py-10 md:py-14">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-5 py-2 rounded-full text-sm font-semibold mb-5 border border-primary/20">
            <Target size={16} className="animate-pulse" /> Mock Tests & Practice
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-3">
            🎯 <span className="text-gradient">Mock Hub</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Build custom JEE tests from your syllabus and master every chapter.
          </p>
        </div>

        {/* Top pill tabs */}
        <div className="flex justify-center gap-3 mb-10 flex-wrap">
          {hubTabs.map((t) => (
            <button key={t.id} onClick={() => { setHubTab(t.id); setView("menu"); setResult(null); }} className={pill(hubTab === t.id)}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {hubTab === "coaching" ? (
            <motion.div
              key="coaching"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="glass-card p-10 md:p-16 text-center max-w-2xl mx-auto"
            >
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/25">
                <School size={30} className="text-primary-foreground" />
              </div>
              <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">🏫 Coaching Test Series</h2>
              <p className="text-muted-foreground max-w-md mx-auto">Coaching test series will be available soon.</p>
            </motion.div>
          ) : view === "menu" ? (
            <motion.div
              key="ai-menu"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid gap-4 sm:grid-cols-2 max-w-3xl mx-auto"
            >
              {aiOptions.map((o, i) => (
                <motion.button
                  key={o.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={o.action}
                  disabled={o.comingSoon}
                  className={`group text-left glass-card p-6 transition-all duration-300 ${
                    o.comingSoon ? "opacity-70 cursor-not-allowed" : "hover:-translate-y-1 hover:shadow-xl hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                      <o.icon size={22} />
                    </span>
                    {o.comingSoon && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-secondary text-muted-foreground px-2.5 py-1 rounded-full border border-border">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <h3 className="font-display font-bold text-lg mb-1">{o.emoji} {o.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{o.desc}</p>
                  {!o.comingSoon && (
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                      Get started <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  )}
                </motion.button>
              ))}
            </motion.div>
          ) : (
            /* ================= CREATE YOUR TEST (single page) ================= */
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl mx-auto space-y-8"
            >
              <button
                onClick={() => { setView("menu"); setResult(null); }}
                className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={16} /> Back to AI Test Series
              </button>

              <h2 className="text-2xl md:text-3xl font-display font-bold">📝 Create Your Test</h2>

              {/* 1. Exam */}
              <section className="glass-card p-6">
                <h3 className="font-display font-bold mb-4">1. Exam</h3>
                <div className="flex gap-3 flex-wrap">
                  {(["JEE Main", "JEE Advanced"] as Exam[]).map((e) => (
                    <button key={e} onClick={() => setExam(e)} className={optionPill(exam === e)}>
                      {e.toUpperCase()}
                    </button>
                  ))}
                </div>
              </section>

              {/* 2 & 3. Subjects + Chapters */}
              <section className="glass-card p-6">
                <h3 className="font-display font-bold mb-4">2. Subjects & Chapters</h3>
                <div className="flex flex-col md:flex-row gap-4">
                  {allSubjects.map((d) => {
                    const meta = subjectMeta[d.subject as keyof typeof subjectMeta];
                    const open = openSubjects.includes(d.subject);
                    const count = selectedForSubject(d.subject);
                    const names = subjectChapters(d.subject);
                    const allSel = names.length > 0 && count === names.length;
                    return (
                      <div key={d.subject} className="flex-1 rounded-2xl border border-border bg-secondary/30 overflow-hidden">
                        <button
                          onClick={() => toggleSubjectOpen(d.subject)}
                          className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/50 transition-colors"
                        >
                          <span className={`w-9 h-9 rounded-xl ${meta.chip} flex items-center justify-center shrink-0`}>
                            <meta.icon size={17} />
                          </span>
                          <span className="flex-1 text-left">
                            <span className="block font-display font-bold text-sm">{meta.emoji} {d.subject}</span>
                            <span className="block text-[11px] text-muted-foreground">{count} chapters selected</span>
                          </span>
                          <ChevronDown size={16} className={`text-muted-foreground transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
                        </button>
                        <AnimatePresence initial={false}>
                          {open && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 pt-1 space-y-1">
                                <label className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-secondary/60 cursor-pointer text-sm font-semibold">
                                  <input
                                    type="checkbox"
                                    checked={allSel}
                                    onChange={() => toggleSelectAll(d.subject)}
                                    className="h-4 w-4 rounded accent-primary"
                                  />
                                  Select All
                                </label>
                                {d.sections.map((sec) => (
                                  <div key={sec.title}>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 pt-2 pb-1">{sec.title}</p>
                                    {sec.chapters.map((ch) => (
                                      <label
                                        key={ch.name}
                                        className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-secondary/60 cursor-pointer text-sm"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={selectedChapters.has(chapterKey(d.subject, ch.name))}
                                          onChange={() => toggleChapter(d.subject, ch.name)}
                                          className="h-4 w-4 rounded accent-primary shrink-0"
                                        />
                                        <span className="leading-snug">{ch.name}</span>
                                      </label>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* 4. Difficulty */}
              <section className="glass-card p-6">
                <h3 className="font-display font-bold mb-4">3. Difficulty</h3>
                <div className="flex gap-3 flex-wrap">
                  {DIFFICULTIES.map((d) => (
                    <button key={d} onClick={() => setDifficulty(d)} className={optionPill(difficulty === d)}>
                      {d}
                    </button>
                  ))}
                </div>
              </section>

              {/* 5. Number of Questions */}
              <section className="glass-card p-6">
                <h3 className="font-display font-bold mb-4">4. Number of Questions</h3>
                <div className="flex gap-3 flex-wrap">
                  {QUESTION_COUNTS.map((n) => (
                    <button key={n} onClick={() => setQuestionCount(n)} className={optionPill(questionCount === n && n !== recommendedCount)}>
                      {n}
                    </button>
                  ))}
                  <button
                    onClick={() => setQuestionCount(recommendedCount)}
                    className={`${optionPill(questionCount === recommendedCount)} inline-flex items-center gap-1.5`}
                  >
                    <Star size={14} /> Recommended ({recommendedCount})
                  </button>
                </div>
              </section>

              {/* 6. Time Mode */}
              <section className="glass-card p-6">
                <h3 className="font-display font-bold mb-4">5. Time Mode</h3>
                <div className="flex gap-3 flex-wrap">
                  <button onClick={() => setTimeMode("standard")} className={`${optionPill(timeMode === "standard")} inline-flex items-center gap-2`}>
                    <Clock3 size={15} /> Standard · {standardMinutes} min
                  </button>
                  <button onClick={() => setTimeMode("challenge")} className={`${optionPill(timeMode === "challenge")} inline-flex items-center gap-2`}>
                    <Timer size={15} /> Challenge · {challengeMinutes} min
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-3">Duration updates automatically with your exam and question count. Challenge mode is 15 minutes shorter.</p>
              </section>

              {/* 7. Live Summary */}
              <section className="glass-card p-6 border-primary/30">
                <h3 className="font-display font-bold mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" /> Live Summary
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {[
                    exam ?? "No exam selected",
                    selectedSubjects.length > 0 ? selectedSubjects.join(" + ") : "No subjects",
                    `${totalChaptersSelected} Chapter${totalChaptersSelected === 1 ? "" : "s"}`,
                    `${difficulty} Difficulty`,
                    `${questionCount} Questions`,
                    `${timeMode === "standard" ? "Standard" : "Challenge"} Time · ${activeMinutes} min`,
                  ].map((s, i) => (
                    <span key={i} className="inline-flex items-center rounded-full bg-secondary/70 border border-border px-3.5 py-1.5 text-xs font-semibold">
                      {s}
                    </span>
                  ))}
                </div>
              </section>

              {/* Validation / success message */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex items-center gap-3 rounded-2xl border px-5 py-4 text-sm font-semibold ${
                      result.type === "success"
                        ? "border-success/40 bg-success/10 text-success"
                        : "border-destructive/40 bg-destructive/10 text-destructive"
                    }`}
                  >
                    {result.type === "success" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                    {result.message}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 8. Generate button */}
              <button
                onClick={handleGenerate}
                className="w-full rounded-2xl gradient-primary text-primary-foreground font-display font-bold text-lg py-4 shadow-lg shadow-primary/30 hover:opacity-90 transition-opacity active:scale-[0.99]"
              >
                GENERATE MY TEST
              </button>

              <p className="text-[11px] text-muted-foreground text-center pb-6">
                Future tests will use verified authentic JEE PYQs matched to your selected exam. AI-generated practice questions, if added later, will always be labeled “AI Generated Practice”.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default MockHubPage;
