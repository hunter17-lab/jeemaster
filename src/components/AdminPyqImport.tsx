import { useEffect, useState } from "react";
import { toast } from "sonner";
import * as pdfjs from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { supabase } from "@/integrations/supabase/client";
import { allSubjects } from "@/data/chapters";

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
const db = supabase as any;

interface Draft { question: string; options: string[]; answer: string; chapter: string; num: number }
interface Row { id: string; exam: string; year: number; session: string | null; shift: string | null; subject: string; chapter: string; question: string; options: any; correct_answer: any; source: string; verification_status: string }

const LETTERS = ["A", "B", "C", "D"];

async function pdfText(file: File) {
  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  let out = "";
  for (let p = 1; p <= pdf.numPages; p++) {
    const c = await (await pdf.getPage(p)).getTextContent();
    let lastY: number | null = null;
    for (const it of c.items as any[]) {
      const y = it.transform?.[5];
      if (lastY !== null && Math.abs(y - lastY) > 2) out += "\n";
      out += it.str + (it.hasEOL ? "\n" : " ");
      lastY = y;
    }
    out += "\n";
  }
  return out.replace(/[ \t]+/g, " ");
}

function parse(text: string): Draft[] {
  const keyIdx = text.search(/answer\s*key|answers?\s*:|\bANSWERS\b/i);
  const body = keyIdx > 0 ? text.slice(0, keyIdx) : text;
  const keyText = keyIdx > 0 ? text.slice(keyIdx) : "";
  const key: Record<number, string> = {};
  for (const m of keyText.matchAll(/(\d{1,3})\s*[.)\-:]\s*\(?([A-Da-d1-4]|-?\d+(?:\.\d+)?)\)?/g)) {
    const n = +m[1]; if (!(n in key)) key[n] = m[2].toUpperCase();
  }
  const parts = body.split(/(?:^|\n)\s*(?:Q\.?\s*)?(\d{1,3})\s*[.)]\s+/i);
  const drafts: Draft[] = [];
  for (let i = 1; i < parts.length; i += 2) {
    const num = +parts[i]; const chunk = parts[i + 1] || "";
    const optRe = /\(\s*([A-Da-d1-4])\s*\)\s*/g;
    const marks = [...chunk.matchAll(optRe)];
    let question = chunk.trim(); let options: string[] = [];
    if (marks.length >= 4) {
      const first = marks.length - 4; const m4 = marks.slice(first);
      question = chunk.slice(0, m4[0].index).trim();
      options = m4.map((m, j) => chunk.slice(m.index! + m[0].length, j < 3 ? m4[j + 1].index : undefined).trim().replace(/\s+/g, " "));
    }
    let answer = key[num] ?? "";
    if (/^[1-4]$/.test(answer) && options.length) answer = LETTERS[+answer - 1];
    if (question.length > 5) drafts.push({ num, question: question.replace(/\s+/g, " "), options, answer, chapter: "" });
  }
  return drafts;
}

const inp = "w-full rounded-lg bg-secondary px-3 py-2 text-sm border border-border";

const AdminPyqImport = () => {
  const [meta, setMeta] = useState({ exam: "JEE Main", year: new Date().getFullYear(), session: "", shift: "", subject: "Physics", source: "" });
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [filter, setFilter] = useState<"pending" | "verified">("pending");

  const load = async () => {
    const { data, error } = await db.from("pyq_questions").select("*").eq("verification_status", filter).order("created_at", { ascending: false }).limit(500);
    if (error) toast.error(error.message); else setRows(data || []);
  };
  useEffect(() => { load(); }, [filter]);

  const chapters = allSubjects.find((s) => s.subject === meta.subject)?.sections.flatMap((s) => s.chapters.map((c) => c.name)) ?? [];
  const chaptersFor = (sub: string) => allSubjects.find((s) => s.subject === sub)?.sections.flatMap((s) => s.chapters.map((c) => c.name)) ?? [];

  const onFile = async (f?: File) => {
    if (!f) return;
    if (!meta.source.trim()) return toast.error("Enter a Source first (e.g. NTA official paper)");
    setBusy(true);
    try {
      const drafts = parse(await pdfText(f));
      if (!drafts.length) { toast.error("No questions found. The PDF may be scanned (image-only)."); return; }
      const payload = drafts.map((d) => ({
        exam: meta.exam, year: meta.year, session: meta.session || null, shift: meta.shift || null,
        subject: meta.subject, chapter: d.chapter || "Unassigned", question_type: d.options.length ? "mcq" : "numerical",
        question: d.question, options: d.options, correct_answer: d.answer || null,
        source: `${meta.source.trim()} (Q${d.num})`, verification_status: "pending",
      }));
      const { error } = await db.from("pyq_questions").insert(payload);
      if (error) throw error;
      toast.success(`Imported ${payload.length} questions for review (not verified).`);
      setFilter("pending"); load();
    } catch (e: any) { toast.error(e.message || "Import failed"); }
    finally { setBusy(false); }
  };

  const update = (id: string, patch: Partial<Row>) => setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const save = async (r: Row, verify?: boolean) => {
    if (verify && (!r.chapter || r.chapter === "Unassigned")) return toast.error("Assign a chapter before verifying");
    const { error } = await db.from("pyq_questions").update({
      question: r.question, options: r.options, correct_answer: r.correct_answer || null, chapter: r.chapter,
      ...(verify !== undefined ? { verification_status: verify ? "verified" : "pending" } : {}),
    }).eq("id", r.id);
    if (error) return toast.error(error.message);
    toast.success(verify ? "Verified" : verify === false ? "Moved back to review" : "Saved");
    if (verify !== undefined) load();
  };
  const del = async (id: string) => {
    if (!confirm("Delete this imported question?")) return;
    const { error } = await db.from("pyq_questions").delete().eq("id", id);
    if (error) toast.error(error.message); else setRows((r) => r.filter((x) => x.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-5 space-y-3">
        <h2 className="font-bold text-lg">Import PYQ questions from PDF</h2>
        <p className="text-xs text-muted-foreground">Text-based PDFs only. Imported questions are saved as NOT verified and are never used in tests until you verify them below.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <select className={inp} value={meta.exam} onChange={(e) => setMeta({ ...meta, exam: e.target.value })}>
            <option>JEE Main</option><option>JEE Advanced</option>
          </select>
          <input className={inp} type="number" value={meta.year} onChange={(e) => setMeta({ ...meta, year: +e.target.value })} placeholder="Year" />
          <select className={inp} value={meta.subject} onChange={(e) => setMeta({ ...meta, subject: e.target.value })}>
            {allSubjects.map((s) => <option key={s.subject}>{s.subject}</option>)}
          </select>
          <input className={inp} value={meta.session} onChange={(e) => setMeta({ ...meta, session: e.target.value })} placeholder="Session (e.g. January)" />
          <input className={inp} value={meta.shift} onChange={(e) => setMeta({ ...meta, shift: e.target.value })} placeholder="Shift (e.g. Shift 1)" />
          <input className={inp} value={meta.source} onChange={(e) => setMeta({ ...meta, source: e.target.value })} placeholder="Source *" />
        </div>
        <input type="file" accept="application/pdf" disabled={busy} onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} className="text-sm" />
        {busy && <p className="text-sm text-muted-foreground">Reading PDF…</p>}
        <p className="text-xs text-muted-foreground">Chapters available for {meta.subject}: {chapters.length}. Assign each question's chapter during review.</p>
      </div>

      <div className="flex gap-2">
        {(["pending", "verified"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full text-sm ${filter === f ? "gradient-primary text-primary-foreground" : "bg-secondary"}`}>
            {f === "pending" ? "Needs review" : "Verified"}
          </button>
        ))}
        <span className="text-sm text-muted-foreground self-center">{rows.length} questions</span>
      </div>

      <div className="space-y-4">
        {rows.map((r) => {
          const opts: string[] = Array.isArray(r.options) ? r.options : [];
          return (
            <div key={r.id} className="glass-card rounded-2xl p-4 space-y-2">
              <div className="text-xs text-muted-foreground">{r.exam} · {r.year} · {r.session || "-"} · {r.shift || "-"} · {r.subject} · {r.source}</div>
              <textarea className={inp} rows={3} value={r.question} onChange={(e) => update(r.id, { question: e.target.value })} />
              {opts.map((o, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="text-sm font-semibold w-5">{LETTERS[i]}</span>
                  <input className={inp} value={o} onChange={(e) => { const n = [...opts]; n[i] = e.target.value; update(r.id, { options: n }); }} />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-2">
                <input className={inp} value={typeof r.correct_answer === "string" ? r.correct_answer : r.correct_answer ?? ""} onChange={(e) => update(r.id, { correct_answer: e.target.value })} placeholder="Answer (A–D or number)" />
                <select className={inp} value={r.chapter} onChange={(e) => update(r.id, { chapter: e.target.value })}>
                  <option value="Unassigned">Select chapter…</option>
                  {chaptersFor(r.subject).map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => save(r)} className="px-3 py-1.5 rounded-lg bg-secondary text-sm">Save</button>
                {r.verification_status !== "verified"
                  ? <button onClick={() => save(r, true)} className="px-3 py-1.5 rounded-lg gradient-primary text-primary-foreground text-sm">Save & mark verified</button>
                  : <button onClick={() => save(r, false)} className="px-3 py-1.5 rounded-lg bg-secondary text-sm">Unverify</button>}
                <button onClick={() => del(r.id)} className="px-3 py-1.5 rounded-lg bg-destructive/15 text-destructive text-sm">Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminPyqImport;
