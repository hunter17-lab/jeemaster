import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Send, Loader2, LogIn, BrainCircuit, Plus, Paperclip, Mic, MicOff, Sparkles,
  Maximize2, Minimize2, Trash2, FileText, Image as ImageIcon, GraduationCap, Wand2, PanelLeft,
} from "lucide-react";
import "katex/dist/katex.min.css";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AITutorMessage from "./AITutorMessage";
import {
  DEFAULT_SETTINGS, HINT_PROMPTS, MAX_FILES, STUDY_TOOLS, TUTOR_MODES,
  fileToAttachment, isImage, loadAiSettings, streamTutor,
  type AiSettings, type TutorAttachment, type TutorMessage, type TutorMode,
} from "@/lib/aiTutor";

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const GREETING: TutorMessage = {
  id: "greet",
  role: "assistant",
  content:
    "Hi! 👋 I'm your **JEE Study Tutor**. Ask a doubt, or attach a question photo, screenshot or PDF and I'll work through it with you.",
};

interface Conversation { id: string; title: string; updated_at: string }

const AITutor = () => {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [sidebar, setSidebar] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<TutorMessage[]>([GREETING]);
  const [attachments, setAttachments] = useState<TutorAttachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<TutorMode>("steps");
  const [studyMode, setStudyMode] = useState(false);
  const [settings, setSettings] = useState<AiSettings>(DEFAULT_SETTINGS);
  const [convId, setConvId] = useState<string | null>(null);
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [listening, setListening] = useState(false);
  const [greetName, setGreetName] = useState<string | null>(null);
  const [showGreet, setShowGreet] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const sendingRef = useRef(false);
  const recogRef = useRef<any>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const voiceSupported = useMemo(
    () => typeof window !== "undefined" && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition),
    [],
  );

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  useEffect(() => { loadAiSettings().then(setSettings).catch(() => setSettings(DEFAULT_SETTINGS)); }, []);

  const loadConvs = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("ai_conversations").select("id,title,updated_at")
      .order("updated_at", { ascending: false }).limit(30);
    setConvs((data as any) || []);
  }, [user]);

  useEffect(() => { if (open && user) loadConvs(); }, [open, user, loadConvs]);

  // Greeting bubble
  useEffect(() => {
    if (sessionStorage.getItem("ai-greet-dismissed")) return;
    let cancelled = false;
    (async () => {
      let name = "there";
      if (user) {
        const { data } = await supabase.from("profiles").select("display_name").eq("user_id", user.id).maybeSingle();
        const dn = (data?.display_name || user.email?.split("@")[0] || "").split(" ")[0];
        if (dn) name = dn;
      }
      if (cancelled) return;
      setGreetName(name);
      setShowGreet(true);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const dismissGreet = () => {
    setShowGreet(false);
    sessionStorage.setItem("ai-greet-dismissed", "1");
  };

  /* ------------------------------- files ------------------------------- */
  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);
    const room = MAX_FILES - attachments.length;
    const picked = Array.from(files).slice(0, Math.max(0, room));
    if (!picked.length) { setError(`You can attach up to ${MAX_FILES} files at a time.`); return; }
    const placeholders: TutorAttachment[] = picked.map((f) => ({
      id: uid(), name: f.name, type: f.type || "application/octet-stream", size: f.size, dataUrl: "", status: "processing",
    }));
    setAttachments((p) => [...p, ...placeholders]);
    const done = await Promise.all(picked.map((f) => fileToAttachment(f, settings.max_file_mb)));
    setAttachments((prev) => {
      const next = [...prev];
      placeholders.forEach((ph, i) => {
        const at = next.findIndex((a) => a.id === ph.id);
        if (at !== -1) next[at] = { ...done[i], id: ph.id };
      });
      return next;
    });
    const bad = done.filter((d) => d.status === "error");
    if (bad.length) setError(`${bad[0].name}: ${bad[0].error}`);
  };

  const removeAttachment = (id: string) => setAttachments((p) => p.filter((a) => a.id !== id));

  /* ---------------------------- persistence ---------------------------- */
  const persist = async (conversationId: string, msgs: TutorMessage[]) => {
    if (!user) return;
    const rows = msgs.map((m) => ({
      conversation_id: conversationId,
      user_id: user.id,
      role: m.role,
      content: m.content,
      attachments: (m.attachments || []).map((a) => ({ name: a.name, type: a.type })),
    }));
    if (rows.length) await supabase.from("ai_messages").insert(rows as any);
    await supabase.from("ai_conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId);
  };

  const ensureConversation = async (firstText: string) => {
    if (convId) return convId;
    if (!user) return null;
    const title = (firstText.trim().slice(0, 60) || "Attached study material");
    const { data } = await supabase
      .from("ai_conversations").insert({ user_id: user.id, title } as any).select("id").maybeSingle();
    const id = (data as any)?.id || null;
    if (id) { setConvId(id); loadConvs(); }
    return id;
  };

  const openConversation = async (id: string) => {
    const { data } = await supabase
      .from("ai_messages").select("*").eq("conversation_id", id).order("created_at", { ascending: true });
    const loaded: TutorMessage[] = ((data as any[]) || []).map((r) => ({
      id: r.id, role: r.role, content: r.content,
      attachments: (r.attachments || []) as any,
      feedback: r.feedback || undefined,
    }));
    setMessages(loaded.length ? loaded : [GREETING]);
    setConvId(id);
    setAttachments([]);
    setError(null);
    setSidebar(false);
  };

  const newChat = () => {
    setMessages([GREETING]);
    setConvId(null);
    setAttachments([]);
    setInput("");
    setError(null);
    setSidebar(false);
  };

  const deleteConversation = async (id: string) => {
    await supabase.from("ai_conversations").delete().eq("id", id);
    if (convId === id) newChat();
    loadConvs();
  };

  /* ------------------------------ sending ------------------------------ */
  const run = async (history: TutorMessage[], toSend: TutorMessage[], convo: string | null) => {
    setLoading(true);
    setError(null);
    const assistantId = uid();
    let acc = "";
    try {
      await streamTutor({
        mode,
        studyMode,
        messages: [...history, ...toSend]
          .filter((m) => m.id !== "greet")
          .map((m) => ({
            role: m.role,
            content: m.content,
            attachments: (m.attachments || [])
              .filter((a) => a.dataUrl)
              .map((a) => ({ name: a.name, type: a.type, dataUrl: a.dataUrl as string })),
          })),
        onDelta: (chunk) => {
          acc += chunk;
          setMessages((prev) => {
            const i = prev.findIndex((m) => m.id === assistantId);
            if (i === -1) return [...prev, { id: assistantId, role: "assistant", content: acc }];
            return prev.map((m, k) => (k === i ? { ...m, content: acc } : m));
          });
        },
      });
      if (convo) await persist(convo, [...toSend, { id: assistantId, role: "assistant", content: acc }]);
    } catch (e: any) {
      setError(e?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      sendingRef.current = false;
    }
  };

  const send = async (overrideText?: string) => {
    if (sendingRef.current || loading) return;
    const text = (overrideText ?? input).trim();
    const ready = attachments.filter((a) => a.status === "ready");
    if (!text && !ready.length) return;
    if (attachments.some((a) => a.status === "processing")) { setError("Your files are still being prepared."); return; }
    sendingRef.current = true;

    const userMsg: TutorMessage = {
      id: uid(), role: "user", content: text,
      attachments: ready.map((a) => ({ name: a.name, type: a.type, dataUrl: a.dataUrl, preview: a.preview })),
    };
    const history = messages;
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setAttachments([]);

    const convo = await ensureConversation(text || ready[0]?.name || "Study chat");
    await run(history, [userMsg], convo);
  };

  const regenerate = async () => {
    if (loading) return;
    const lastUserIdx = [...messages].reverse().findIndex((m) => m.role === "user");
    if (lastUserIdx === -1) return;
    const idx = messages.length - 1 - lastUserIdx;
    const history = messages.slice(0, idx);
    const userMsg = messages[idx];
    setMessages([...history, userMsg]);
    sendingRef.current = true;
    await run(history, [userMsg], null);
  };

  const setFeedback = async (id: string, v: "up" | "down") => {
    setMessages((p) => p.map((m) => (m.id === id ? { ...m, feedback: m.feedback === v ? undefined : v } : m)));
    if (convId) await supabase.from("ai_messages").update({ feedback: v } as any).eq("id", id);
  };

  /* ------------------------------- voice ------------------------------- */
  const toggleVoice = () => {
    if (!voiceSupported) return;
    if (listening) { recogRef.current?.stop(); setListening(false); return; }
    const Rec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new Rec();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.onresult = (ev: any) => {
      const t = ev.results?.[0]?.[0]?.transcript;
      if (t) setInput((p) => (p ? `${p} ${t}` : t));
    };
    rec.onerror = () => { setListening(false); setError("Voice input didn't work. Please type instead."); };
    rec.onend = () => setListening(false);
    recogRef.current = rec;
    rec.start();
    setListening(true);
  };

  /* ------------------------------- state ------------------------------- */
  const hasImage = attachments.some((a) => isImage(a.type)) || messages.at(-1)?.attachments?.some((a) => isImage(a.type));
  const hasDoc = attachments.some((a) => !isImage(a.type)) || messages.at(-1)?.attachments?.some((a) => !isImage(a.type));
  const hasVideo = messages.at(-1)?.attachments?.some((a) => a.type.startsWith("video/"));
  const loadingLabel = hasVideo ? "Processing lecture…" : hasDoc ? "Reading your document…" : hasImage ? "Analyzing image…" : "Thinking…";
  const disabled = !settings.enabled || settings.maintenance;
  const acceptTypes = settings.allowed_types?.length ? settings.allowed_types.join(",") : undefined;

  const panelClass = expanded
    ? "fixed inset-2 md:inset-6 z-50 flex rounded-2xl border border-border/50 bg-card shadow-2xl overflow-hidden"
    : "fixed inset-x-2 bottom-2 top-14 md:inset-auto md:bottom-24 md:right-4 md:top-auto z-50 md:w-[420px] md:max-h-[76vh] flex rounded-2xl border border-border/50 bg-card shadow-2xl overflow-hidden";

  return (
    <>
      {/* Greeting bubble */}
      <AnimatePresence>
        {showGreet && !open && greetName && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed bottom-24 right-6 z-50 max-w-[240px] rounded-2xl rounded-br-sm bg-card border border-border/60 shadow-xl px-4 py-3 pr-8"
          >
            <button onClick={dismissGreet} aria-label="Dismiss" className="absolute top-1.5 right-1.5 text-muted-foreground hover:text-foreground p-1">
              <X size={13} />
            </button>
            <p className="text-sm text-foreground leading-snug">
              Hey <span className="font-semibold text-primary">{greetName}</span>!! Want any help? Tell me 😊
            </p>
            <span className="absolute -bottom-1.5 right-5 w-3 h-3 bg-card border-r border-b border-border/60 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <motion.button
        onClick={() => { setOpen(!open); if (showGreet) dismissGreet(); }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        animate={open ? {} : { y: [0, -4, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl gradient-primary text-primary-foreground shadow-xl shadow-primary/40 flex items-center justify-center overflow-visible"
        aria-label="AI Tutor"
      >
        {open ? <X size={22} /> : (
          <>
            <motion.span
              animate={{ scale: [1, 1.35, 1], opacity: [0.55, 0, 0.55] }}
              transition={{ duration: 2.2, repeat: Infinity }}
              className="absolute inset-0 rounded-2xl bg-primary/40 blur-md"
            />
            <motion.span
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 flex items-center justify-center"
            >
              <span className="block" style={{ transform: "rotate(90deg)" }}>
                <BrainCircuit size={26} strokeWidth={2.2} />
              </span>
            </motion.span>
          </>
        )}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            className={panelClass}
          >
            {/* Sidebar */}
            <aside
              className={`${sidebar ? "flex" : "hidden"} ${expanded ? "md:flex" : ""} absolute md:relative inset-y-0 left-0 z-20 w-60 flex-col gap-2 border-r border-border/50 bg-card p-3 overflow-y-auto`}
            >
              <button
                onClick={newChat}
                className="flex items-center gap-2 rounded-xl gradient-primary px-3 py-2 text-sm font-medium text-primary-foreground"
              >
                <Plus size={15} /> New Chat
              </button>

              <p className="mt-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Chat History</p>
              <div className="flex flex-col gap-1">
                {!user && <p className="px-1 text-xs text-muted-foreground">Sign in to save chats.</p>}
                {user && !convs.length && <p className="px-1 text-xs text-muted-foreground">No chats yet.</p>}
                {convs.map((c) => (
                  <div key={c.id} className={`group flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs ${convId === c.id ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60"}`}>
                    <button onClick={() => openConversation(c.id)} className="flex-1 truncate text-left">{c.title}</button>
                    <button onClick={() => deleteConversation(c.id)} aria-label="Delete chat" className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>

              <p className="mt-3 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Study Tools</p>
              <div className="flex flex-wrap gap-1.5">
                {STUDY_TOOLS.map((t) => (
                  <button
                    key={t.label}
                    onClick={() => { setSidebar(false); send(t.prompt); }}
                    disabled={loading || disabled}
                    className="rounded-lg border border-border/60 px-2 py-1 text-[11px] text-muted-foreground hover:border-primary/50 hover:text-foreground disabled:opacity-50"
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <p className="mt-3 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Uploaded Files</p>
              <div className="flex flex-col gap-1 pb-2">
                {!attachments.length && <p className="px-1 text-xs text-muted-foreground">Nothing attached.</p>}
                {attachments.map((a) => (
                  <span key={a.id} className="flex items-center gap-1.5 truncate px-1 text-xs text-muted-foreground">
                    {isImage(a.type) ? <ImageIcon size={11} /> : <FileText size={11} />}
                    <span className="truncate">{a.name}</span>
                  </span>
                ))}
              </div>
            </aside>

            {/* Main column */}
            <div className="flex flex-1 flex-col min-w-0">
              {/* Header */}
              <div className="gradient-primary flex items-center gap-2 px-3 py-2.5 text-primary-foreground">
                <button onClick={() => setSidebar((s) => !s)} className={`p-1 rounded-md hover:bg-white/15 ${expanded ? "md:hidden" : ""}`} aria-label="Menu">
                  <PanelLeft size={16} />
                </button>
                <Sparkles size={16} />
                <span className="font-display text-sm font-bold">JEE AI Study Tutor</span>
                <div className="ml-auto flex items-center gap-1">
                  <button onClick={newChat} className="p-1.5 rounded-md hover:bg-white/15" aria-label="New chat"><Plus size={15} /></button>
                  <button onClick={() => setExpanded((e) => !e)} className="hidden md:block p-1.5 rounded-md hover:bg-white/15" aria-label="Expand">
                    {expanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                  </button>
                  <button onClick={() => setOpen(false)} className="p-1.5 rounded-md hover:bg-white/15" aria-label="Close"><X size={15} /></button>
                </div>
              </div>

              {/* Controls */}
              {user && (
                <div className="flex items-center gap-2 border-b border-border/50 px-3 py-2 overflow-x-auto">
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as TutorMode)}
                    className="rounded-lg bg-secondary px-2 py-1 text-xs text-foreground outline-none"
                  >
                    {TUTOR_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                  <button
                    onClick={() => setStudyMode((s) => !s)}
                    className={`flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs transition-colors ${studyMode ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
                  >
                    <GraduationCap size={13} /> Study Mode
                  </button>
                  <div className="ml-auto hidden md:flex shrink-0 items-center gap-1">
                    {HINT_PROMPTS.map((h) => (
                      <button
                        key={h.label}
                        onClick={() => send(h.prompt)}
                        disabled={loading || disabled}
                        className="rounded-lg border border-border/60 px-2 py-1 text-[11px] text-muted-foreground hover:border-primary/50 hover:text-foreground disabled:opacity-50"
                      >
                        {h.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Body */}
              {!user ? (
                <div className="flex flex-1 flex-col items-center justify-center p-6 text-center min-h-[220px]">
                  <LogIn size={32} className="mb-3 text-muted-foreground" />
                  <p className="mb-1 text-sm font-medium text-foreground">Sign in to chat</p>
                  <p className="mb-4 text-xs text-muted-foreground">Create a free account to use the AI Study Tutor</p>
                  <button onClick={() => { navigate("/auth"); setOpen(false); }} className="rounded-xl gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                    Sign In
                  </button>
                </div>
              ) : (
                <div className={`flex-1 space-y-3 overflow-y-auto p-3 ${expanded ? "" : "min-h-[220px] md:max-h-[46vh]"}`}>
                  {disabled && (
                    <div className="rounded-xl border border-border/60 bg-secondary/60 p-3 text-xs text-muted-foreground">
                      {settings.maintenance
                        ? "The AI Tutor is under maintenance right now. Please check back soon."
                        : "The AI Tutor has been switched off by the admin."}
                    </div>
                  )}
                  {messages.map((m, i) => (
                    <AITutorMessage
                      key={m.id}
                      msg={m}
                      isLast={i === messages.length - 1 && !loading}
                      onRegenerate={regenerate}
                      onFeedback={(v) => setFeedback(m.id, v)}
                    />
                  ))}
                  {loading && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Loader2 size={14} className="animate-spin" /> {loadingLabel}
                    </div>
                  )}
                  {error && (
                    <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</div>
                  )}
                  <div ref={bottomRef} />
                </div>
              )}

              {/* Attachment tray */}
              {user && !!attachments.length && (
                <div className="flex flex-wrap gap-2 border-t border-border/50 p-2">
                  {attachments.map((a) => (
                    <div key={a.id} className="relative flex items-center gap-2 rounded-xl border border-border/60 bg-secondary/60 p-1.5 pr-6 max-w-[190px]">
                      {a.preview ? (
                        <img src={a.preview} alt={a.name} className="h-9 w-9 rounded-md object-cover" />
                      ) : (
                        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-background/60"><FileText size={14} /></span>
                      )}
                      <span className="min-w-0">
                        <span className="block truncate text-[11px] text-foreground">{a.name}</span>
                        <span className={`block text-[10px] ${a.status === "error" ? "text-destructive" : "text-muted-foreground"}`}>
                          {a.status === "processing" ? "Preparing…" : a.status === "error" ? a.error : `${a.type.split("/")[1] || "file"} • ${(a.size / 1024 / 1024).toFixed(1)} MB`}
                        </span>
                      </span>
                      <button onClick={() => removeAttachment(a.id)} aria-label="Remove file" className="absolute right-1 top-1 p-0.5 text-muted-foreground hover:text-destructive">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick tools (mobile / collapsed) */}
              {user && !sidebar && (
                <div className="flex gap-1.5 overflow-x-auto border-t border-border/50 px-2 py-1.5">
                  {STUDY_TOOLS.slice(0, 6).map((t) => (
                    <button
                      key={t.label}
                      onClick={() => send(t.prompt)}
                      disabled={loading || disabled}
                      className="flex shrink-0 items-center gap-1 rounded-lg border border-border/60 px-2 py-1 text-[11px] text-muted-foreground hover:border-primary/50 hover:text-foreground disabled:opacity-50"
                    >
                      <Wand2 size={11} /> {t.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="flex items-end gap-2 border-t border-border/50 p-2">
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept={acceptTypes}
                  className="hidden"
                  onChange={(e) => { addFiles(e.target.files); e.currentTarget.value = ""; }}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={!user || loading || disabled}
                  aria-label="Attach files"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                  <Paperclip size={16} />
                </button>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  rows={1}
                  disabled={!user || disabled}
                  placeholder="Ask anything about your studies…"
                  className="max-h-28 flex-1 resize-none rounded-lg bg-secondary px-3 py-2 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-60"
                />
                {voiceSupported && (
                  <button
                    onClick={toggleVoice}
                    disabled={!user || loading || disabled}
                    aria-label="Voice input"
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg disabled:opacity-50 ${listening ? "bg-destructive text-destructive-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
                  >
                    {listening ? <MicOff size={16} /> : <Mic size={16} />}
                  </button>
                )}
                <button
                  onClick={() => send()}
                  disabled={loading || disabled || !user || (!input.trim() && !attachments.some((a) => a.status === "ready"))}
                  aria-label="Send"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg gradient-primary text-primary-foreground disabled:opacity-50"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AITutor;
