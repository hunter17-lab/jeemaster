import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const MAX_QUESTIONS = 75;
const MAX_CHAPTERS = 40;
const SUBJECTS = new Set(["Physics", "Chemistry", "Mathematics"]);
const EXAMS = new Set(["JEE Main", "JEE Advanced"]);
const SCOPES = new Set(["11", "12", "full"]);
const DIFFICULTIES = new Set(["easy", "moderate", "hard", "very_hard"]);
const TYPES = new Set(["mcq", "integer", "both"]);

type Chapter = { subject: string; chapter: string; topics?: string[] };

function validate(body: any): string | null {
  if (!body || typeof body !== "object") return "Invalid request.";
  if (!EXAMS.has(body.exam)) return "Please choose JEE Main or JEE Advanced.";
  if (!SCOPES.has(body.classScope)) return "Invalid syllabus scope.";
  if (!DIFFICULTIES.has(body.difficulty)) return "Invalid difficulty.";
  if (!TYPES.has(body.questionTypes)) return "Invalid question type.";
  const count = Number(body.questionCount);
  if (!Number.isInteger(count) || count < 5 || count > MAX_QUESTIONS) return `Question count must be between 5 and ${MAX_QUESTIONS}.`;
  if (!Array.isArray(body.chapters) || body.chapters.length < 1 || body.chapters.length > MAX_CHAPTERS) {
    return "Select at least one chapter.";
  }
  for (const c of body.chapters as Chapter[]) {
    if (!c || !SUBJECTS.has(c.subject) || typeof c.chapter !== "string" || !c.chapter.trim() || c.chapter.length > 120) {
      return "Invalid chapter selection.";
    }
    if (c.topics !== undefined && (!Array.isArray(c.topics) || c.topics.some((t) => typeof t !== "string" || t.length > 80))) {
      return "Invalid topic selection.";
    }
  }
  return null;
}

const DIFF_TEXT: Record<string, string> = {
  easy: "Easy — single-concept, direct formula or one-step application questions.",
  moderate: "Moderate — standard JEE Main level questions requiring 2-3 steps.",
  hard: "Hard — JEE Main tough / JEE Advanced entry level, multi-concept questions.",
  very_hard: "Very Hard — JEE Advanced level, deep reasoning, multi-concept linking, tricky traps.",
};

const SCOPE_TEXT: Record<string, string> = {
  "11": "Class 11 syllabus only.",
  "12": "Class 12 syllabus only.",
  full: "Complete Class 11 + Class 12 syllabus.",
};

function distribute(count: number, chapters: Chapter[]) {
  const n = chapters.length;
  const base = Math.floor(count / n);
  let rem = count % n;
  const plan = chapters.map(() => base);
  let i = 0;
  while (rem > 0) {
    plan[i % n] += 1;
    rem -= 1;
    i += 1;
  }
  return plan;
}

// Strict structured-output schema for /v1/responses
const QUESTION_ITEM = {
  type: "object",
  additionalProperties: false,
  required: ["subject", "chapter", "difficulty", "type", "question", "options", "correctOption", "correctAnswer", "solution"],
  properties: {
    subject: { type: "string", enum: ["Physics", "Chemistry", "Mathematics"] },
    chapter: { type: "string" },
    difficulty: { type: "string", enum: ["easy", "moderate", "hard", "very_hard"] },
    type: { type: "string", enum: ["mcq", "integer"] },
    question: { type: "string" },
    options: { type: ["array", "null"], items: { type: "string" } },
    correctOption: { type: ["integer", "null"], minimum: 0, maximum: 3 },
    correctAnswer: { type: ["string", "null"], pattern: "^[0-9]+$" },
    solution: { type: "string" },
  },
};

const RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["questions"],
  properties: {
    questions: { type: "array", items: QUESTION_ITEM },
  },
};

function systemPrompt(plan: { chapter: Chapter; count: number; integerCount: number }[], cfg: any) {
  const lines = plan.map(
    ({ chapter, count, integerCount }) =>
      `- ${chapter.subject} » ${chapter.chapter} → ${count} question(s)${integerCount > 0 ? `, of which exactly ${integerCount} are INTEGER type` : ""}${
        chapter.topics?.length ? ` (focus topics: ${chapter.topics.join(", ")})` : ""
      }`
  );
  const types = cfg.questionTypes === "both" ? "a mix of MCQ (single correct, 4 options) and Integer type" : cfg.questionTypes === "mcq" ? "MCQ only (single correct, 4 options)" : "Integer type only (numerical value, no options)";
  return `You are an expert JEE paper setter for JEE MAIN and JEE ADVANCED (Physics, Chemistry, Mathematics).

Write EXACTLY ${plan.reduce((s, p) => s + p.count, 0)} questions — one per line of the plan below, in that order:
${lines.join("\n")}

RULES
1. Syllabus scope: ${SCOPE_TEXT[cfg.classScope]} Questions must be strictly within the named chapters${cfg.classScope !== "full" ? " and the requested class scope" : ""}.
2. Difficulty: ${DIFF_TEXT[cfg.difficulty]} Tag every question with exactly this difficulty value: "${cfg.difficulty}".
3. Question formats: ${types}.
4. INTEGER type questions: the answer must be a NON-NEGATIVE WHOLE NUMBER. If the exact value is decimal, design the question so the nearest integer is the expected answer, and state that in the solution ("nearest integer"). Never negative, never fractional. Put the final integer as a plain digit string in correctAnswer, and set options to null and correctOption to null.
5. MCQ questions: exactly 4 options as plain strings (no "A)" prefixes), set correctOption to the 0-based index of the single correct option, correctAnswer null.
6. Accuracy is critical: verify every computation before finalising. The correct answer must be genuinely correct.
7. Every question needs a "solution": 2-5 sentences with the key concept, working and the final answer. Use plain text (no LaTeX markup).
8. Questions must be original practice questions modelled on JEE patterns — never copy a real PYQ verbatim and never invent a PYQ year/shift source.
9. "chapter" must exactly repeat the chapter name from the plan. "subject" must be exactly ${[...SUBJECTS].join(", ")}.
10. Output ONLY the structured data requested. No commentary.`;
}

async function readResponsesStream(response: Response): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Empty AI response.");
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  let fallback = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n");
    buffer = parts.pop() || "";
    for (const line of parts) {
      const l = line.trim();
      if (!l.startsWith("data:")) continue;
      const payload = l.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const ev = JSON.parse(payload);
        if (ev.type === "response.output_text.delta" && typeof ev.delta === "string") text += ev.delta;
        if (ev.type === "response.completed" && ev.response) fallback = ev.response;
      } catch {
        /* ignore keepalive / partial frames */
      }
    }
  }
  if (text.trim()) return text;
  // Fallback: pull the text out of the final completed response object
  try {
    const out = fallback?.output || [];
    for (const item of out) {
      for (const c of item.content || []) {
        if (c.type === "output_text" && c.text) return c.text;
      }
    }
  } catch {
    /* ignore */
  }
  throw new Error("The AI did not return any questions. Please try again.");
}

function isValidQuestion(q: any): boolean {
  if (!q || typeof q !== "object") return false;
  if (!SUBJECTS.has(q.subject)) return false;
  if (typeof q.question !== "string" || q.question.trim().length < 8) return false;
  if (typeof q.solution !== "string" || q.solution.trim().length < 8) return false;
  if (q.type === "mcq") {
    return (
      Array.isArray(q.options) &&
      q.options.length === 4 &&
      q.options.every((o: unknown) => typeof o === "string" && o.length > 0) &&
      Number.isInteger(q.correctOption) &&
      q.correctOption >= 0 &&
      q.correctOption <= 3
    );
  }
  if (q.type === "integer") {
    return typeof q.correctAnswer === "string" && /^[0-9]+$/.test(q.correctAnswer.trim());
  }
  return false;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Please sign in to generate an AI test." }, 401);
    const anon = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user }, error: authError } = await anon.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) return json({ error: "Your session expired. Please sign in again." }, 401);

    const body = await req.json().catch(() => null);
    const err = validate(body);
    if (err) return json({ error: err }, 400);

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Daily usage tracking (shared with the AI Tutor)
    const day = new Date().toISOString().slice(0, 10);
    const { data: usage } = await admin.from("ai_usage").select("*").eq("user_id", user.id).eq("day", day).maybeSingle();
    const { error: usageErr } = await admin.from("ai_usage").upsert(
      { user_id: user.id, day, requests: (usage?.requests ?? 0) + 1, files: usage?.files ?? 0, errors: usage?.errors ?? 0, updated_at: new Date().toISOString() },
      { onConflict: "user_id,day" },
    );
    if (usageErr) console.warn("usage tracking failed:", usageErr.message);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "AI test generation isn't configured yet. Please contact the admin." }, 503);

    const chapters: Chapter[] = body.chapters;
    const plan = distribute(Number(body.questionCount), chapters).map((count, i) => {
      const integerCount =
        body.questionTypes === "integer" ? count : body.integerMode && body.questionTypes !== "mcq" ? Math.round(count * 0.2) : 0;
      return { chapter: chapters[i], count, integerCount };
    });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        stream: true,
        store: false,
        reasoning: { effort: "medium" },
        text: { format: { type: "json_schema", name: "mock_test", strict: true, schema: RESPONSE_SCHEMA } },
        input: [
          { role: "system", content: systemPrompt(plan, body) },
          { role: "user", content: `Generate the test now. ${body.exam}, ${DIFF_TEXT[body.difficulty].split(" — ")[0]} difficulty.` },
        ],
      }),
    });

    if (!response.ok) {
      await admin.from("ai_usage").upsert(
        { user_id: user.id, day, requests: (usage?.requests ?? 0) + 1, files: usage?.files ?? 0, errors: (usage?.errors ?? 0) + 1, updated_at: new Date().toISOString() },
        { onConflict: "user_id,day" },
      );
      if (response.status === 429) return json({ error: "Too many requests right now. Please wait a moment and try again." }, 429);
      if (response.status === 402) {
        const t = await response.text();
        let msg = "AI credits are exhausted. Please ask the admin to top up.";
        try {
          msg = JSON.parse(t).message || msg;
        } catch { /* keep default */ }
        return json({ error: msg }, 402);
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return json({ error: "The AI service couldn't process that. Please try again." }, 502);
    }

    const raw = await readResponsesStream(response);
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return json({ error: "The AI returned an unreadable test. Please try again." }, 502);
    }

    const all = Array.isArray(parsed.questions) ? parsed.questions : [];
    const valid = all.filter(isValidQuestion);

    // Per-chapter integrity check: the AI must not invent chapters outside the plan.
    const allowed = new Set(plan.map((p) => `${p.chapter.subject}::${p.chapter.chapter}`));
    const kept = valid.filter((q: any) => allowed.has(`${q.subject}::${q.chapter}`));

    if (kept.length === 0) return json({ error: "The AI couldn't produce valid questions for this selection. Please try again." }, 502);

    const requested = Number(body.questionCount);
    return json({
      requested,
      returned: kept.length,
      warning: kept.length < requested ? `Only ${kept.length} of ${requested} questions passed validation. Please regenerate if you need more.` : undefined,
      questions: kept,
    });
  } catch (e) {
    console.error("generate-mock-test error:", e);
    return json({ error: "Something went wrong while generating the test. Please try again." }, 500);
  }
});
