import { supabase } from "@/integrations/supabase/client";

export interface PyqQuestion {
  id: string;
  exam: string;
  year: number;
  session: string | null;
  shift: string | null;
  subject: string;
  chapter: string;
  question_type: string;
  question: string;
  options: unknown;
  source: string;
  verification_status: string;
}

export interface GeneratedTest {
  exam: string;
  questionCount: number;
  timeMode: string;
  durationMinutes: number;
  createdAt: string;
  questions: PyqQuestion[];
}

const shuffle = <T,>(arr: T[]) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/** Builds a test strictly from verified, authentic PYQs. Never invents questions. */
export async function generatePyqTest(cfg: {
  exam: string;
  chapters: { subject: string; chapter: string }[];
  questionCount: number;
  timeMode: string;
  durationMinutes: number;
}): Promise<GeneratedTest> {
  const subjects = [...new Set(cfg.chapters.map((c) => c.subject))];
  const chapterNames = [...new Set(cfg.chapters.map((c) => c.chapter))];
  const wanted = new Set(cfg.chapters.map((c) => `${c.subject}::${c.chapter}`));

  // Answers/solutions are intentionally not fetched here.
  const { data, error } = await (supabase as any)
    .from("pyq_questions")
    .select("id,exam,year,session,shift,subject,chapter,question_type,question,options,source,verification_status")
    .eq("exam", cfg.exam)
    .eq("verification_status", "verified")
    .in("subject", subjects)
    .in("chapter", chapterNames)
    .limit(5000);
  if (error) throw new Error("Could not load verified PYQs. Please try again.");

  const pool = ((data ?? []) as PyqQuestion[]).filter((q) => wanted.has(`${q.subject}::${q.chapter}`));
  if (pool.length < cfg.questionCount) {
    throw new Error(
      `Insufficient verified questions: only ${pool.length} verified ${cfg.exam} PYQs match your chapters, but ${cfg.questionCount} are needed. Select more chapters or fewer questions.`
    );
  }

  const test: GeneratedTest = {
    exam: cfg.exam,
    questionCount: cfg.questionCount,
    timeMode: cfg.timeMode,
    durationMinutes: cfg.durationMinutes,
    createdAt: new Date().toISOString(),
    questions: shuffle(pool).slice(0, cfg.questionCount),
  };
  try {
    sessionStorage.setItem("jee-mock-current-test", JSON.stringify(test));
  } catch { /* ignore */ }
  return test;
}
