import { supabase } from "@/integrations/supabase/client";
import type { TestConfig, TestQuestion, TestSession } from "@/lib/testAttempt";
import { storeSession } from "@/lib/testAttempt";

export interface AiTestOptions {
  exam: string;
  classScope: string; // "11" | "12" | "full"
  difficulty: string; // easy | moderate | hard | very_hard
  questionTypes: "mcq" | "integer" | "both";
  integerMode: boolean;
  chapters: { subject: string; chapter: string; topics?: string[] }[];
  questionCount: number;
  timeMode: string;
  durationMinutes: number;
}

interface RawQuestion {
  subject: string;
  chapter: string;
  difficulty: string;
  type: "mcq" | "integer";
  question: string;
  options: string[] | null;
  correctOption: number | null;
  correctAnswer: string | null;
  solution: string;
}

const DIFF_LABEL: Record<string, string> = {
  easy: "Easy",
  moderate: "Moderate",
  hard: "Hard",
  very_hard: "Very Hard",
};

/** Generates a fully custom AI practice test through the generate-mock-test edge function. */
export async function generateAiTest(cfg: AiTestOptions): Promise<TestSession> {
  const { data, error } = await (supabase as any).functions.invoke("generate-mock-test", {
    body: {
      exam: cfg.exam,
      classScope: cfg.classScope,
      difficulty: cfg.difficulty,
      questionTypes: cfg.questionTypes,
      integerMode: cfg.integerMode,
      chapters: cfg.chapters,
      questionCount: cfg.questionCount,
    },
  });
  if (error) {
    const msg = (error as any)?.message || "Could not generate the test.";
    try {
      const ctx = JSON.parse((error as any).context);
      if (ctx?.error) throw new Error(ctx.error);
    } catch (e) {
      if (e instanceof Error && e.message !== msg) throw e;
    }
    throw new Error(msg);
  }
  if (!data || data.error) throw new Error(data?.error || "Could not generate the test.");

  const questions: TestQuestion[] = (data.questions as RawQuestion[]).map((q, i) => ({
    id: `ai-${Date.now()}-${i}`,
    subject: q.subject,
    chapter: q.chapter,
    topic: null,
    difficulty: DIFF_LABEL[q.difficulty] || "Moderate",
    type: q.type === "integer" ? "integer" : "mcq",
    question: q.question,
    options: q.type === "integer" ? null : (q.options as string[]),
    correctOption: q.type === "integer" ? null : (q.correctOption as number),
    correctAnswer: q.correctAnswer,
    solution: q.solution,
    aiGenerated: true,
  }));

  const config: TestConfig = {
    exam: cfg.exam,
    classScope: cfg.classScope,
    difficulty: DIFF_LABEL[cfg.difficulty] || "Moderate",
    questionTypes: cfg.questionTypes,
    integerMode: cfg.integerMode,
    chapters: cfg.chapters,
    questionCount: cfg.questionCount,
    timeMode: cfg.timeMode,
  };

  const session: TestSession = {
    title: `${cfg.exam} · AI Practice · ${questions.length}Q`,
    source: "ai",
    exam: cfg.exam,
    durationMinutes: cfg.durationMinutes,
    createdAt: new Date().toISOString(),
    config,
    questions,
  };
  storeSession(session);
  if (data.warning) session.warning = data.warning;
  return session;
}
