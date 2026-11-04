import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Clock, ChevronLeft, ChevronRight, Save, Flag, Eraser, CheckCircle2, XCircle,
  MinusCircle, Delete, ArrowLeft, Trophy, Target, Timer, ListChecks,
} from "lucide-react";
import useSEO from "@/hooks/useSEO";
import {
  loadSession, gradeAttempt, saveAttempt, MCQ_MARKS,
  type TestSession, type AttemptResponses, type AttemptResponseEntry, type GradedAttempt, type StoredAttempt,
} from "@/lib/testAttempt";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const pad = (n: number) => String(n).padStart(2, "0");
const fmtTime = (s: number) => `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;

const optionLetter = (i: number) => String.fromCharCode(65 + i);

const paletteChip = (state: "answered" | "not-answered" | "marked" | "not-visited") =>
  state === "answered"
    ? "bg-success/20 text-success border-success/40"
    : state === "not-answered"
    ? "bg-destructive/20 text-destructive border-destructive/40"
    : state === "marked"
    ? "bg-primary/20 text-primary border-primary/40"
    : "bg-secondary/60 text-muted-foreground border-border";

const statusOf = (entry: AttemptResponseEntry | undefined, visited: boolean): "answered" | "not-answered" | "marked" | "not-visited" => {
  const answered = !!entry && ((entry.selected !== null && entry.selected !== undefined) || (entry.integer !== null && entry.integer !== ""));
  if (entry?.marked) return "marked";
  if (answered) return "answered";
  return visited ? "not-answered" : "not-visited";
};

const TestPlayerPage = () => {
  useSEO({ title: "Test Player — JEE MASTER", description: "Attempt your custom JEE mock test in an NTA-style computer based test environment." });
  const location = useLocation() as { state?: { review?: StoredAttempt; noSave?: boolean } };
  const navigate = useNavigate();
  const { user } = useAuth();

  const review = location.state?.review;
  const noSave = !!location.state?.noSave || !!review;

  const session: TestSession | null = useMemo(() => {
    if (review) {
      const qs = review.localDetail?.questions ?? [];
      if (!qs.length) return null;
      return {
        title: review.title,
        source: review.source as TestSession["source"],
        exam: review.exam,
        durationMinutes: Math.max(1, Math.round(review.durationSeconds / 60)),
        createdAt: review.createdAt,
        config: null,
        questions: qs,
      };
    }
    return loadSession();
  }, [review]);

  const [idx, setIdx] = useState(0);
  const [responses, setResponses] = useState<AttemptResponses>(() => {
    if (review) return { ...(review.localDetail?.responses ?? {}) };
    const init: AttemptResponses = {};
    (session?.questions ?? []).forEach((q) => (init[q.id] = { selected: null, integer: null, marked: false }));
    return init;
  });
  const [visited, setVisited] = useState<Set<number>>(() => new Set(session ? [0] : []));
  const [timeLeft, setTimeLeft] = useState(() => (session ? session.durationMinutes * 60 : 0));
  const [result, setResult] = useState<{ graded: GradedAttempt; durationSeconds: number } | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const startedAt = useRef(Date.now());
  const autoSubmitted = useRef(false);

  const questions = session?.questions ?? [];
  const q = questions[idx];

  useEffect(() => {
    if (!session || result) return;
    const t = setInterval(() => setTimeLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [session, result]);

  useEffect(() => {
    if (session && !result && timeLeft === 0 && !autoSubmitted.current && questions.length) {
      autoSubmitted.current = true;
      doSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  if (!session || !questions.length) return <Navigate to="/mock-hub" replace />;

  const goto = (i: number) => {
    setIdx(i);
    setVisited((v) => new Set(v).add(i));
    setShowPalette(false);
  };

  const setEntry = (patch: Partial<AttemptResponseEntry>) =>
    setResponses((r) => ({ ...r, [q.id]: { selected: null, integer: null, marked: false, ...r[q.id], ...patch } }));

  const doSubmit = async () => {
    setConfirming(false);
    setSubmitting(true);
    const durationSeconds = noSave ? 0 : Math.round((Date.now() - startedAt.current) / 1000);
    const graded = gradeAttempt(session, responses);
    if (!noSave) {
      try {
        await saveAttempt(session, graded, responses, durationSeconds, !!user);
      } catch (e) {
        console.warn("Saving the attempt failed:", e);
      }
    }
    setResult({ graded, durationSeconds });
    setSubmitting(false);
  };

  /* ============================= RESULTS VIEW ============================= */
  if (result) {
    const g = result.graded;
    const pct = g.maxScore ? Math.round((Math.max(g.score, 0) / g.maxScore) * 100) : 0;
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-10 space-y-6">
          <button
            onClick={() => navigate("/mock-hub")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} /> Back to Mock Hub
          </button>

          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 text-center">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
              <Trophy size={28} className="text-primary-foreground" />
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold mb-1">{session.title}</h1>
            <p className="text-muted-foreground mb-6">Test submitted {review ? "(review)" : "successfully"}.</p>
            <div className="flex items-end justify-center gap-2 mb-2">
              <span className="text-5xl font-display font-bold text-primary">{g.score}</span>
              <span className="text-xl text-muted-foreground mb-1">/ {g.maxScore} marks</span>
            </div>
            <p className="text-sm text-muted-foreground mb-6">{pct}% score</p>
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
              <div className="rounded-2xl border border-success/30 bg-success/10 p-4">
                <CheckCircle2 size={20} className="text-success mx-auto mb-1" />
                <div className="text-2xl font-display font-bold text-success">{g.correct}</div>
                <div className="text-xs text-muted-foreground">Correct · +{MCQ_MARKS}</div>
              </div>
              <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
                <XCircle size={20} className="text-destructive mx-auto mb-1" />
                <div className="text-2xl font-display font-bold text-destructive">{g.wrong}</div>
                <div className="text-xs text-muted-foreground">Incorrect</div>
              </div>
              <div className="rounded-2xl border border-border bg-secondary/30 p-4">
                <MinusCircle size={20} className="text-muted-foreground mx-auto mb-1" />
                <div className="text-2xl font-display font-bold">{g.unattempted}</div>
                <div className="text-xs text-muted-foreground">Unattempted</div>
              </div>
            </div>
          </motion.div>

          {g.perSubject.length > 0 && (
            <div className="glass-card p-6">
              <h2 className="font-display font-bold mb-4 flex items-center gap-2"><ListChecks size={18} /> Subject-wise Performance</h2>
              <div className="space-y-4">
                {g.perSubject.map((s) => (
                  <div key={s.subject}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-semibold">{s.subject}</span>
                      <span className="text-muted-foreground">{s.score} / {s.max}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full rounded-full gradient-primary" style={{ width: `${s.max ? Math.max(0, (s.score / s.max) * 100) : 0}%` }} />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">{s.correct} correct · {s.wrong} incorrect · {s.unattempted} unattempted</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="glass-card p-6">
            <h2 className="font-display font-bold mb-4 flex items-center gap-2"><Target size={18} /> Question-wise Review & Solutions</h2>
            <div className="space-y-5">
              {questions.map((qq, i) => {
                const entry = responses[qq.id];
                const answered = qq.type === "mcq"
                  ? entry?.selected !== null && entry?.selected !== undefined
                  : !!entry && entry.integer !== null && entry.integer !== "";
                const ok = qq.type === "mcq"
                  ? entry?.selected === qq.correctOption
                  : answered && Number(entry?.integer) === Number(qq.correctAnswer);
                const status = !answered ? "unattempted" : ok ? "correct" : "wrong";
                return (
                  <div key={qq.id} className="rounded-2xl border border-border p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <span className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                        status === "correct" ? "bg-success/15 text-success" : status === "wrong" ? "bg-destructive/15 text-destructive" : "bg-secondary text-muted-foreground"
                      }`}>{i + 1}</span>
                      <div className="flex-1">
                        <p className="font-semibold leading-snug">{qq.question}</p>
                        <p className="text-[11px] text-muted-foreground mt-1">{qq.subject} · {qq.chapter} · {qq.difficulty} · {qq.type === "mcq" ? "MCQ" : "Integer"}{qq.aiGenerated ? " · AI Generated Practice" : ""}</p>
                      </div>
                    </div>
                    {qq.options && (
                      <div className="grid sm:grid-cols-2 gap-2">
                        {qq.options.map((opt, oi) => (
                          <div key={oi} className={`rounded-xl border px-3 py-2 text-sm ${
                            oi === qq.correctOption
                              ? "border-success/50 bg-success/10 text-success font-semibold"
                              : oi === entry?.selected
                              ? "border-destructive/50 bg-destructive/10 text-destructive"
                              : "border-border bg-secondary/30 text-muted-foreground"
                          }`}>
                            <span className="font-bold mr-1.5">{optionLetter(oi)}.</span>{opt}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="text-sm space-y-1">
                      <p>
                        <span className="text-muted-foreground">Your answer: </span>
                        <span className={status === "correct" ? "text-success font-semibold" : status === "wrong" ? "text-destructive font-semibold" : "font-semibold"}>
                          {qq.type === "mcq"
                            ? entry?.selected !== null && entry?.selected !== undefined ? `${optionLetter(entry.selected)}. ${qq.options?.[entry.selected]}` : "Not attempted"
                            : entry?.integer || "Not attempted"}
                        </span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Correct answer: </span>
                        <span className="text-success font-semibold">
                          {qq.type === "mcq" ? `${optionLetter(qq.correctOption ?? 0)}. ${qq.options?.[qq.correctOption ?? 0]}` : qq.correctAnswer}
                        </span>
                      </p>
                      {qq.solution && (
                        <p className="rounded-xl bg-secondary/40 border border-border px-3 py-2 text-muted-foreground leading-relaxed">
                          <span className="font-semibold text-foreground">Solution: </span>{qq.solution}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-center pb-8">
            <button
              onClick={() => navigate("/mock-hub")}
              className="rounded-2xl gradient-primary text-primary-foreground font-display font-bold px-8 py-3 shadow-lg shadow-primary/30 hover:opacity-90 transition-opacity"
            >
              BACK TO MOCK HUB
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ============================= TEST VIEW ============================= */
  const entry = responses[q.id];
  const answered = (entry?.selected !== null && entry?.selected !== undefined) || (!!entry?.integer && entry.integer !== "");
  const low = timeLeft <= 300;

  const keypad = (d: string) => {
    if (d === "C") return setEntry({ integer: null });
    if (d === "⌫") return setEntry({ integer: (entry?.integer || "").slice(0, -1) || null });
    if ((entry?.integer || "").length >= 5) return;
    setEntry({ integer: (entry?.integer || "") + d });
  };

  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-background">
      {/* Top bar */}
      <header className="h-14 px-3 sm:px-4 flex items-center gap-3 border-b border-border/60 bg-card/90 backdrop-blur-xl shrink-0">
        <button
          onClick={() => navigate("/mock-hub")}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"
          title="Leave the test"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-display font-semibold truncate">{session.title}</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground hidden sm:block">
            JEE MASTER CBT {session.source === "pyq" ? "· Verified PYQs" : session.source === "ai" ? "· AI Generated Practice" : ""}
          </div>
        </div>
        <div className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 font-mono text-sm font-bold ${
          low ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-border bg-secondary/50"
        }`}>
          <Clock size={15} className={low ? "animate-pulse" : ""} /> {fmtTime(timeLeft)}
        </div>
        <button
          onClick={() => setShowPalette((s) => !s)}
          className="lg:hidden p-2 rounded-lg bg-secondary text-sm font-semibold"
        >
          {questions.length} Q
        </button>
        <button
          onClick={() => setConfirming(true)}
          className="rounded-xl gradient-primary text-primary-foreground text-sm font-bold px-4 py-2 shadow-md shadow-primary/25 hover:opacity-90"
        >
          Submit
        </button>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* Question area */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Question {idx + 1} of {questions.length}</span>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-secondary/70 border border-border">{q.subject}</span>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-secondary/70 border border-border">{q.chapter}</span>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-secondary/70 border border-border">{q.type === "mcq" ? "MCQ · +4 / −1" : "Integer · +4 / 0"}</span>
              {q.aiGenerated && <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">AI Practice</span>}
            </div>

            <div className="glass-card p-5 sm:p-7">
              <p className="text-base sm:text-lg leading-relaxed whitespace-pre-wrap">{q.question}</p>
            </div>

            {q.type === "mcq" ? (
              <div className="space-y-2.5">
                {(q.options ?? []).map((opt, oi) => (
                  <button
                    key={oi}
                    onClick={() => setEntry({ selected: oi })}
                    className={`w-full text-left flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition-all duration-200 ${
                      entry?.selected === oi
                        ? "gradient-primary text-primary-foreground border-primary/40 shadow-md shadow-primary/20"
                        : "bg-secondary/40 border-border hover:border-primary/40 hover:bg-secondary/60"
                    }`}
                  >
                    <span className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center font-bold text-sm ${
                      entry?.selected === oi ? "bg-primary-foreground/20" : "bg-secondary/70"
                    }`}>{optionLetter(oi)}</span>
                    <span className="text-sm sm:text-base leading-snug">{opt}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="glass-card p-5 space-y-4">
                <p className="text-xs text-muted-foreground">Type your answer (non-negative whole number). If the exact value is decimal, enter the nearest integer.</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-14 rounded-2xl border border-border bg-secondary/40 flex items-center justify-center font-mono text-2xl font-bold tracking-widest">
                    {entry?.integer || <span className="text-muted-foreground font-normal text-base">—</span>}
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-2 max-w-sm">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "⌫"].map((d) => (
                    <button
                      key={d}
                      onClick={() => keypad(d)}
                      className="h-12 rounded-xl border border-border bg-secondary/50 font-mono text-lg font-bold hover:border-primary/40 hover:bg-secondary active:scale-95 transition-all"
                    >
                      {d === "⌫" ? <Delete size={16} className="mx-auto" /> : d === "C" ? <Eraser size={16} className="mx-auto" /> : d}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2.5 pb-8">
              <button
                onClick={() => goto(Math.max(0, idx - 1))}
                disabled={idx === 0}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary/60 px-4 py-2.5 text-sm font-semibold hover:border-primary/40 disabled:opacity-40"
              >
                <ChevronLeft size={15} /> Previous
              </button>
              <button
                onClick={() => setEntry({ selected: null, integer: null })}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary/60 px-4 py-2.5 text-sm font-semibold hover:border-primary/40"
              >
                <Eraser size={15} /> Clear Response
              </button>
              <button
                onClick={() => goto(Math.min(questions.length - 1, idx + 1))}
                className="inline-flex items-center gap-1.5 rounded-xl gradient-primary text-primary-foreground px-5 py-2.5 text-sm font-bold shadow-md shadow-primary/25 hover:opacity-90"
              >
                <Save size={15} /> Save & Next <ChevronRight size={15} />
              </button>
              <button
                onClick={() => {
                  setEntry({ marked: !entry?.marked });
                  if (!entry?.marked) goto(Math.min(questions.length - 1, idx + 1));
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 text-primary px-4 py-2.5 text-sm font-semibold hover:bg-primary/20"
              >
                <Flag size={15} /> Mark for Review & Next
              </button>
            </div>
          </div>
        </main>

        {/* Palette */}
        <aside className={`${
          showPalette ? "fixed inset-y-0 right-0 z-40 w-72" : "hidden"
        } lg:relative lg:block lg:w-72 shrink-0 border-l border-border/60 bg-card/95 backdrop-blur-xl overflow-y-auto`}>
          {showPalette && (
            <button onClick={() => setShowPalette(false)} className="lg:hidden absolute top-3 right-3 p-2 rounded-lg bg-secondary text-sm font-bold">✕</button>
          )}
          <div className="p-4 space-y-4">
            <h3 className="font-display font-bold text-sm flex items-center gap-2"><ListChecks size={15} /> Question Palette</h3>
            <div className="grid grid-cols-6 gap-2">
              {questions.map((qq, i) => (
                <button
                  key={qq.id}
                  onClick={() => goto(i)}
                  className={`h-9 rounded-lg border text-xs font-bold transition-all ${paletteChip(statusOf(responses[qq.id], visited.has(i)))} ${
                    i === idx ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <div className="space-y-1.5 text-[11px] text-muted-foreground border-t border-border/60 pt-3">
              <p className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded border bg-success/20 border-success/40" /> Answered</p>
              <p className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded border bg-destructive/20 border-destructive/40" /> Not answered</p>
              <p className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded border bg-primary/20 border-primary/40" /> Marked for review</p>
              <p className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded border bg-secondary/60 border-border" /> Not visited</p>
            </div>
            <div className="rounded-xl bg-secondary/40 border border-border p-3 text-xs space-y-1">
              <p className="flex items-center gap-2"><Timer size={13} /> {session.durationMinutes} minutes total</p>
              <p className="flex items-center gap-2"><Target size={13} /> Marking: MCQ +4/−1 · Integer +4/0</p>
            </div>
            <button
              onClick={() => setConfirming(true)}
              className="w-full rounded-xl gradient-primary text-primary-foreground text-sm font-bold py-2.5 shadow-md shadow-primary/25 hover:opacity-90"
            >
              SUBMIT TEST
            </button>
          </div>
        </aside>
      </div>

      {/* Submit confirmation */}
      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-7 max-w-sm w-full text-center space-y-4">
            <h3 className="font-display font-bold text-xl">Submit the test?</h3>
            <p className="text-sm text-muted-foreground">
              {answeredCount(responses, questions)} of {questions.length} questions answered. You can review every question and solution after submitting.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setConfirming(false)} className="rounded-xl border border-border bg-secondary px-5 py-2.5 text-sm font-semibold">Keep solving</button>
              <button onClick={doSubmit} disabled={submitting} className="rounded-xl gradient-primary text-primary-foreground px-5 py-2.5 text-sm font-bold shadow-md shadow-primary/25 disabled:opacity-60">
                {submitting ? "Submitting…" : "Submit now"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const answeredCount = (responses: AttemptResponses, questions: TestSession["questions"]) =>
  questions.filter((q) => {
    const e = responses[q.id];
    return q.type === "mcq" ? e?.selected !== null && e?.selected !== undefined : !!e && e.integer !== null && e.integer !== "";
  }).length;

export default TestPlayerPage;
