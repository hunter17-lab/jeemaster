import { supabase } from "@/integrations/supabase/client";

export type TutorRole = "user" | "assistant";

export interface TutorAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  preview?: string;
  status: "ready" | "processing" | "error";
  error?: string;
}

export interface TutorMessage {
  id: string;
  role: TutorRole;
  content: string;
  attachments?: { name: string; type: string; dataUrl?: string; preview?: string }[];
  feedback?: "up" | "down";
}

export type TutorMode = "quick" | "steps" | "detailed" | "beginner" | "main" | "advanced" | "revision";

export const TUTOR_MODES: { value: TutorMode; label: string }[] = [
  { value: "quick", label: "Quick Answer" },
  { value: "steps", label: "Step-by-Step" },
  { value: "detailed", label: "Detailed Explanation" },
  { value: "beginner", label: "Beginner Explanation" },
  { value: "main", label: "JEE Main Level" },
  { value: "advanced", label: "JEE Advanced Level" },
  { value: "revision", label: "Revision Mode" },
];

export const STUDY_TOOLS: { label: string; prompt: string }[] = [
  { label: "Solve", prompt: "Solve this completely with clear steps and the final answer." },
  { label: "Explain", prompt: "Explain this in a way I can actually understand, with the key idea first." },
  { label: "Summarize", prompt: "Summarize this material into the most important points." },
  { label: "Make Notes", prompt: "Turn this into ultra-short revision notes I can read the night before an exam." },
  { label: "Flashcards", prompt: "Create flashcards (Q on one line, A on the next) from this material." },
  { label: "Find Formulas", prompt: "Extract every formula from this material. For each: topic, formula in LaTeX, meaning of each variable, units and important conditions." },
  { label: "Generate Questions", prompt: "Give me 10 original practice questions on this topic (mixed difficulty), labelled as AI Generated Practice Questions, with answers at the end." },
  { label: "Check My Answer", prompt: "Here is my attempt. Check it: mark the correct steps, point out the exact mistake, explain why it happened, then show the correct approach and final answer." },
  { label: "Give Hints", prompt: "Don't give the answer yet. Give me Hint 1 only." },
  { label: "Revision", prompt: "Make a one-page revision sheet for this topic: concepts, formulas, common mistakes and JEE traps." },
];

export const HINT_PROMPTS = [
  { label: "Hint 1", prompt: "Give me only Hint 1 — a small nudge, no solution." },
  { label: "Hint 2", prompt: "Give me Hint 2 — a bit more help, still no full solution." },
  { label: "Final Hint", prompt: "Give me the final hint — almost the method, but let me finish it." },
  { label: "Show Solution", prompt: "Show the full step-by-step solution now." },
];

export const MAX_FILES = 6;

export const isImage = (t: string) => t.startsWith("image/");

/** Compress/resize large images in the browser before upload. */
async function compressImage(file: File): Promise<string> {
  const dataUrl = await readAsDataUrl(file);
  if (file.size < 400 * 1024) return dataUrl;
  return await new Promise<string>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const max = 1600;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(dataUrl);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("Could not read this file"));
    r.readAsDataURL(file);
  });
}

export async function fileToAttachment(file: File, maxMb: number): Promise<TutorAttachment> {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const base: TutorAttachment = {
    id, name: file.name, type: file.type || "application/octet-stream",
    size: file.size, dataUrl: "", status: "processing",
  };
  if (file.size > maxMb * 1024 * 1024 * 1.5) {
    return { ...base, status: "error", error: `Too large (max ${maxMb} MB)` };
  }
  try {
    const dataUrl = isImage(base.type) ? await compressImage(file) : await readAsDataUrl(file);
    const bytes = (dataUrl.split(",")[1]?.length || 0) * 0.75;
    if (bytes > maxMb * 1024 * 1024) {
      return { ...base, status: "error", error: `Too large (max ${maxMb} MB)` };
    }
    return { ...base, dataUrl, preview: isImage(base.type) ? dataUrl : undefined, status: "ready" };
  } catch {
    return { ...base, status: "error", error: "Couldn't read this file" };
  }
}

export interface AiSettings {
  enabled: boolean;
  maintenance: boolean;
  model: string;
  provider: string;
  max_file_mb: number;
  allowed_types: string[];
  daily_limit: number;
  system_instructions: string;
}

export const DEFAULT_SETTINGS: AiSettings = {
  enabled: true, maintenance: false, provider: "lovable", model: "google/gemini-3.7-flash",
  max_file_mb: 15,
  allowed_types: ["image/png", "image/jpeg", "image/webp", "image/gif", "application/pdf"],
  daily_limit: 60, system_instructions: "",
};

export async function loadAiSettings(): Promise<AiSettings> {
  const { data } = await supabase.rpc("get_ai_client_settings");
  const row = Array.isArray(data) ? data[0] : data;
  return row ? ({ ...DEFAULT_SETTINGS, ...(row as any) }) : DEFAULT_SETTINGS;
}

/**
 * Provider-agnostic streaming call. The frontend never sees an API key —
 * everything goes through the secure backend function, which owns the
 * provider/model choice, file handling and error handling.
 */
export async function streamTutor(opts: {
  messages: { role: TutorRole; content: string; attachments?: { name: string; type: string; dataUrl: string }[] }[];
  mode: TutorMode;
  studyMode: boolean;
  onDelta: (chunk: string) => void;
  signal?: AbortSignal;
}): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error("Please sign in to use the AI Tutor.");

  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tutor`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ messages: opts.messages, mode: opts.mode, studyMode: opts.studyMode }),
    signal: opts.signal,
  });

  if (!resp.ok || !resp.body) {
    let msg = "The AI Tutor couldn't respond right now. Please try again.";
    try {
      const j = await resp.json();
      if (j?.error && typeof j.error === "string") msg = j.error;
    } catch { /* keep friendly default */ }
    throw new Error(msg);
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const payload = line.slice(6).trim();
      if (payload === "[DONE]") return;
      try {
        const parsed = JSON.parse(payload);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) opts.onDelta(delta);
      } catch {
        buffer = line + "\n" + buffer;
        break;
      }
    }
  }
}
