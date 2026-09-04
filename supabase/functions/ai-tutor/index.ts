import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const MAX_MESSAGES = 30;
const MAX_MESSAGE_LENGTH = 8000;
const MAX_ATTACHMENTS = 6;
const ALLOWED_ROLES = new Set(["user", "assistant"]);

type Attachment = { name: string; type: string; dataUrl: string };
type Msg = { role: string; content: string; attachments?: Attachment[] };

const MODE_PROMPTS: Record<string, string> = {
  quick: "Answer concisely — final answer plus the one key idea. No long derivations unless asked.",
  steps: "Answer in clear numbered steps: given values, what to find, concept/formula, substitution, calculation, units check, final answer. Keep it proportional to the difficulty of the question.",
  detailed: "Give a thorough explanation with reasoning, derivation, alternative approaches and common mistakes.",
  beginner: "Explain very simply, from scratch, using plain language and a everyday analogy before the formal method.",
  main: "Target JEE Main level: exam-focused, fast methods, shortcuts, standard patterns.",
  advanced: "Target JEE Advanced level: deeper reasoning, multi-concept linking, tricky traps, rigorous steps.",
  revision: "Answer in compact revision format: key points, formulas, traps — bullet style, minimal prose.",
};

function baseSystem(extra: string, mode: string, studyMode: boolean, hasFiles: boolean) {
  return `You are the JEE MASTER AI Study Tutor — an advanced academic assistant for JEE Main, JEE Advanced, Class 11/12 PCM and CBSE Physics, Chemistry and Mathematics.

CORE BEHAVIOUR
- Work out what kind of help is needed (concept, numerical, MCQ, revision, planning, answer checking) and respond accordingly.
- Detect the subject and, when reasonably confident, the class, topic, exam level and difficulty. Start solutions with a compact metadata line like: **Physics • Projectile Motion • JEE Main • Medium**. If unsure, omit rather than guess.
- Numericals: list given values, state what is to be found, choose the concept/formula, substitute, compute carefully, check units, state the final answer clearly, then note common mistakes.
- MCQs: identify the correct option and, when useful, why the others fail. Integer type: show the final integer. Multiple-correct: evaluate every option.
- Conceptual: intuition, formal statement, example, exceptions, JEE-focused tips.
- Use markdown. Use LaTeX for all mathematics: $...$ inline and $$...$$ for display. Use tables where they help.
- Practice questions you create must be labelled "AI Generated Practice Question". Never invent a PYQ year, shift, question number or source. If it is not verifiably a past paper question, call it a Practice Question.
- Never claim to have read a file, image or video that was not actually provided. If an image is unclear, say exactly which part is unreadable and ask for a clearer upload. If a video link is given but no video content was provided, say so and ask the student to upload the video file or paste the relevant text/screenshot.
- Scope: education. For clearly harmful, illegal, explicit or malicious requests reply briefly: "I'm your study tutor, so I can help with academic and educational topics. Ask me a Physics, Chemistry, Maths, JEE, or study-related question." Never refuse legitimate academic questions just because a topic sounds sensitive.
- Remember the session context: current topic, chapter, difficulty preference, the student's earlier attempts and mistakes, and any uploaded material, so follow-ups like "I don't get step 3" make sense.

RESPONSE MODE
${MODE_PROMPTS[mode] || MODE_PROMPTS.steps}

${studyMode
  ? `STUDY MODE IS ON: teach, don't dump. Give one guiding hint or question at a time, ask what the student thinks applies, check their attempt, point out mistakes kindly, and only reveal the full solution if they ask for it (or say they are stuck twice).`
  : `STUDY MODE IS OFF: solve directly, but still explain the reasoning.`}

${hasFiles
  ? `UPLOADED MATERIAL: the student attached files. Treat the attached material as the primary source. Do not invent content that is not in it. When you answer from an attachment, say "Based on uploaded material" and name the file; mention a page/section only if it is actually visible in the material — never fabricate page numbers.`
  : ``}
${extra ? `\nADMIN INSTRUCTIONS\n${extra}` : ``}`;
}

function validate(messages: unknown): string | null {
  if (!Array.isArray(messages)) return "messages must be an array";
  if (messages.length === 0 || messages.length > MAX_MESSAGES) return `messages must contain 1-${MAX_MESSAGES} items`;
  for (const m of messages as Msg[]) {
    if (!m || typeof m !== "object") return "Each message must be an object";
    if (!ALLOWED_ROLES.has(m.role)) return "Invalid message role";
    if (typeof m.content !== "string" || m.content.length > MAX_MESSAGE_LENGTH) {
      return `Message content must be at most ${MAX_MESSAGE_LENGTH} characters`;
    }
    if (m.attachments !== undefined) {
      if (!Array.isArray(m.attachments) || m.attachments.length > MAX_ATTACHMENTS) return "Too many attachments";
      for (const a of m.attachments) {
        if (!a || typeof a.dataUrl !== "string" || !a.dataUrl.startsWith("data:") || typeof a.type !== "string") {
          return "Invalid attachment";
        }
      }
    }
    if (!m.content.trim() && !(m.attachments && m.attachments.length)) return "Message cannot be empty";
  }
  return null;
}

function toBlocks(m: Msg) {
  const atts = m.attachments || [];
  if (!atts.length) return m.content;
  const blocks: unknown[] = [];
  if (m.content.trim()) blocks.push({ type: "text", text: m.content });
  for (const a of atts) {
    if (a.type.startsWith("image/")) {
      blocks.push({ type: "image_url", image_url: { url: a.dataUrl } });
    } else if (a.type.startsWith("video/")) {
      blocks.push({ type: "video_url", video_url: { url: a.dataUrl } });
    } else if (a.type.startsWith("audio/")) {
      const [, b64] = a.dataUrl.split(",");
      const fmt = (a.type.split("/")[1] || "webm").replace("mpeg", "mp3");
      blocks.push({ type: "input_audio", input_audio: { data: b64, format: fmt } });
    } else {
      blocks.push({ type: "file", file: { filename: a.name || "file", file_data: a.dataUrl } });
    }
  }
  return blocks;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Please sign in to use the AI Tutor." }, 401);

    const anon = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user }, error: authError } = await anon.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) return json({ error: "Your session expired. Please sign in again." }, 401);

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: settings } = await admin.from("ai_settings").select("*").eq("id", 1).maybeSingle();
    const enabled = settings?.enabled ?? true;
    const maintenance = settings?.maintenance ?? false;
    if (!enabled) return json({ error: "The AI Tutor is currently switched off." }, 503);
    if (maintenance) return json({ error: "The AI Tutor is under maintenance. Please try again shortly." }, 503);

    const body = await req.json().catch(() => null);
    if (!body) return json({ error: "Invalid request." }, 400);
    const messages: Msg[] = body.messages;
    const mode: string = typeof body.mode === "string" ? body.mode : "steps";
    const studyMode = !!body.studyMode;
    const err = validate(messages);
    if (err) return json({ error: err }, 400);

    // File limits
    const maxBytes = (settings?.max_file_mb ?? 15) * 1024 * 1024;
    const allowed: string[] = settings?.allowed_types ?? [];
    let fileCount = 0;
    for (const m of messages) {
      for (const a of m.attachments || []) {
        fileCount++;
        if (allowed.length && !allowed.includes(a.type)) {
          return json({ error: `Files of type ${a.type || "unknown"} aren't supported.` }, 400);
        }
        const b64 = a.dataUrl.split(",")[1] || "";
        if (b64.length * 0.75 > maxBytes) {
          return json({ error: `"${a.name}" is too large. Maximum size is ${settings?.max_file_mb ?? 15} MB.` }, 400);
        }
      }
    }

    // Daily usage limit
    const day = new Date().toISOString().slice(0, 10);
    const limit = settings?.daily_limit ?? 0;
    const { data: usage } = await admin
      .from("ai_usage").select("*").eq("user_id", user.id).eq("day", day).maybeSingle();
    const used = usage?.requests ?? 0;
    if (limit > 0 && used >= limit) {
      return json({ error: `You've reached your daily limit of ${limit} AI questions. Please come back tomorrow.` }, 429);
    }
    await admin.from("ai_usage").upsert(
      { user_id: user.id, day, requests: used + 1, files: (usage?.files ?? 0) + fileCount, errors: usage?.errors ?? 0, updated_at: new Date().toISOString() },
      { onConflict: "user_id,day" },
    );

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return json({ error: "The AI Tutor isn't configured yet. Please contact the admin." }, 503);
    }

    const hasFiles = fileCount > 0;
    const model = settings?.model || "google/gemini-3.7-flash";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: baseSystem(settings?.system_instructions || "", mode, studyMode, hasFiles) },
          ...messages.map((m) => ({ role: m.role, content: toBlocks(m) })),
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const bump = async () => {
        await admin.from("ai_usage").upsert(
          { user_id: user.id, day, requests: used + 1, files: (usage?.files ?? 0) + fileCount, errors: (usage?.errors ?? 0) + 1, updated_at: new Date().toISOString() },
          { onConflict: "user_id,day" },
        );
      };
      await bump();
      if (response.status === 429) return json({ error: "Too many requests right now. Please wait a moment and try again." }, 429);
      if (response.status === 402) return json({ error: "AI credits are exhausted. Please ask the admin to top up." }, 402);
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return json({ error: "The AI service couldn't process that. Try a smaller file or rephrase your question." }, 502);
    }

    return new Response(response.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
  } catch (e) {
    console.error("ai-tutor error:", e);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
});
