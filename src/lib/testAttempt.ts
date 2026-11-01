import { supabase } from "@/integrations/supabase/client";

/** A single question in a generated/saved test session. */
export interface TestQuestion {
  id: string;
  subject: string;
  chapter: string;
  topic: string | null;
  difficulty: string;
  type: "mcq" | "integer";
  question: string;
  options: string[] | null;      // 4 options for MCQ, null for integer
  correctOption: number | null;  // 0-3 for MCQ
  correctAnswer: string | null;  // whole-number string for integer type
  solution: string;
  aiGenerated: boolean;
}

export interface TestConfig {
  exam: string;
  classScope: string; // "11" | "12" | "full"
  difficulty: string;
  questionTypes: "mcq" | "integer" | "both";
  integerMode: boolean;
  chapters: { subject: string; chapter: string; topics?: string[] }[];
  questionCount: number;
  timeMode: string;
}

/** The full test saved while a student is attempting it. */
export interface TestSession {
  title: string;
  source: "ai" | "pyq";
  exam: string;
  durationMinutes: number;
  createdAt: string;
  config: TestConfig | null;
  questions: TestQuestion[];
}

/** Per-question response recorded in the player. */
export interface AttemptResponseEntry {
  selected: number | null;      // chosen option index for MCQ
  integer: string | null;       // typed answer for integer
  marked: boolean;
}

export type AttemptResponses = Record<string, AttemptResponseEntry>;

export interface GradedAttempt {
  score: number;
  maxScore: number;
  correct: number;
  wrong: number;
  unattempted: number;
  perSubject: { subject: string; score: number; max: number; correct: number; wrong: number; unattempted: number }[];
}

export const MCQ_MARKS = 4;
export const MCQ_NEGATIVE = -1;
export const INTEGER_MARKS = 4;
export const INTEGER_NEGATIVE = 0;

const isIntegerAnswer = (entry?: AttemptResponseEntry | null) =>
  !!entry && entry.integer !== null && entry.integer !== "" && Number.isFinite(Number(entry.integer));

/** Grades an attempt against the session's answer key (JEE-style marking). */
export function gradeAttempt(session: TestSession, responses: AttemptResponses): GradedAttempt {
  const per = new Map<string, GradedAttempt["perSubject"][number]>();
  let score = 0;
  let maxScore = 0;
  let correct = 0;
  let wrong = 0;
  let unattempted = 0;

  for (const q of session.questions) {
    const entry = responses[q.id];
    const answered =
      q.type === "mcq" ? entry?.selected !== null && entry?.selected !== undefined : isIntegerAnswer(entry);
    const marks = q.type === "mcq" ? { plus: MCQ_MARKS, minus: MCQ_NEGATIVE } : { plus: INTEGER_MARKS, minus: INTEGER_NEGATIVE };
    maxScore += marks.plus;

    const bucket = per.get(q.subject) || { subject: q.subject, score: 0, max: 0, correct: 0, wrong: 0, unattempted: 0 };
    bucket.max += marks.plus;

    if (!answered) {
      unattempted++;
      bucket.unattempted++;
    } else {
      const ok =
        q.type === "mcq"
          ? entry.selected === q.correctOption
          : Number(entry.integer) === Number(q.correctAnswer);
      if (ok) {
        correct++;
        bucket.correct++;
        score += marks.plus;
        bucket.score += marks.plus;
      } else {
        wrong++;
        bucket.wrong++;
        score += marks.minus;
        bucket.score += marks.minus;
      }
    }
    per.set(q.subject, bucket);
  }

  return {
    score,
    maxScore,
    correct,
    wrong,
    unattempted,
    perSubject: Array.from(per.values()),
  };
}

const ATTEMPTS_KEY = "jee-mock-attempts";
const COMPLETED_KEY = "jee-mock-tests-completed";

export interface StoredAttempt {
  id: string;
  title: string;
  source: string;
  exam: string;
  score: number;
  maxScore: number;
  correct: number;
  wrong: number;
  unattempted: number;
  total: number;
  durationSeconds: number;
  createdAt: string;
  // Kept locally only (never sent to the database) so Mistake Practice can re-list questions.
  localDetail?: {
    questions: TestQuestion[];
    responses: AttemptResponses;
  };
}

function readLocalAttempts(): StoredAttempt[] {
  try {
    return JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeLocalAttempts(list: StoredAttempt[]) {
  try {
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(list.slice(-50)));
    localStorage.setItem(COMPLETED_KEY, String(list.filter((a) => !a.localDetail || true).length || list.length));
  } catch {
    /* ignore */
  }
}

/** Persists a submitted attempt: database when signed in, localStorage always. */
export async function saveAttempt(
  session: TestSession,
  graded: GradedAttempt,
  responses: AttemptResponses,
  durationSeconds: number,
  signedIn: boolean
): Promise<void> {
  const attempt: StoredAttempt = {
    id: crypto.randomUUID(),
    title: session.title,
    source: session.source,
    exam: session.exam,
    score: graded.score,
    maxScore: graded.maxScore,
    correct: graded.correct,
    wrong: graded.wrong,
    unattempted: graded.unattempted,
    total: session.questions.length,
    durationSeconds,
    createdAt: new Date().toISOString(),
  };

  const local = readLocalAttempts();
  writeLocalAttempts([...local, attempt]);

  if (!signedIn) return;
  const { error } = await (supabase as any).from("mock_attempts").insert({
    title: session.title,
    source: session.source,
    config: session.config ?? {},
    questions: session.questions,
    responses,
    score: graded.score,
    correct_count: graded.correct,
    wrong_count: graded.wrong,
    unattempted_count: graded.unattempted,
    total_questions: session.questions.length,
    duration_seconds: durationSeconds,
  });
  if (error) console.warn("Could not save attempt to the cloud:", error.message);
}

/** Attempts for the signed-in user (database first, localStorage fallback). */
export async function loadAttempts(signedIn: boolean): Promise<StoredAttempt[]> {
  if (signedIn) {
    const { data, error } = await (supabase as any)
      .from("mock_attempts")
      .select("id,title,source,score,correct_count,wrong_count,unattempted_count,total_questions,duration_seconds,created_at,questions,responses")
      .order("created_at", { ascending: false })
      .limit(50);
    if (!error && data) {
      return (data as any[]).map((r) => ({
        id: r.id,
        title: r.title,
        source: r.source,
        exam: (r.questions?.[0]?.exam as string) || "",
        score: Number(r.score),
        maxScore: Number(r.total_questions) * MCQ_MARKS,
        correct: r.correct_count,
        wrong: r.wrong_count,
        unattempted: r.unattempted_count,
        total: r.total_questions,
        durationSeconds: r.duration_seconds,
        createdAt: r.created_at,
        localDetail: { questions: r.questions || [], responses: r.responses || {} },
      }));
    }
  }
  return readLocalAttempts().reverse();
}

export const SESSION_KEY = "jee-mock-current-test";

export function storeSession(session: TestSession) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function loadSession(): TestSession | null {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}
