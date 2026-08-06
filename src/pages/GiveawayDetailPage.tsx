import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Gift, Clock, Trophy, Users, CheckCircle2, LogIn, Edit3, Trash2, Upload, ShieldCheck, Flame, Sparkles } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import useSEO from "@/hooks/useSEO";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { uploadGiveawayMedia } from "@/lib/giveawayMedia";
import MediaImage from "@/components/MediaImage";
import WinnerCard from "@/components/WinnerCard";

const Countdown = ({ to, onEnd }: { to: string; onEnd?: () => void }) => {
  const [t, setT] = useState("");
  useEffect(() => {
    const tick = () => {
      const diff = new Date(to).getTime() - Date.now();
      if (diff <= 0) { setT("Ended"); onEnd?.(); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setT(`${d}d ${h}h ${m}m ${s}s`);
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, [to]);
  return <span className="font-mono tabular-nums">{t}</span>;
};

const fireCelebration = () => {
  const end = Date.now() + 1500;
  const colors = ["#dc2626", "#f59e0b", "#fde68a", "#ffffff"];
  (function frame() {
    confetti({ particleCount: 4, angle: 60, spread: 70, origin: { x: 0 }, colors });
    confetti({ particleCount: 4, angle: 120, spread: 70, origin: { x: 1 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
};

const GiveawayDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [g, setG] = useState<any>(null);
  const [count, setCount] = useState(0);
  const [myEntry, setMyEntry] = useState<any>(null);
  const [winners, setWinners] = useState<any[]>([]);
  const [myWins, setMyWins] = useState<string[]>([]);
  const [proofs, setProofs] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", email: "", reason: "" });
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [autoTried, setAutoTried] = useState(false);
  const [reveal, setReveal] = useState(false);
  const celebrated = useRef(false);
  useSEO({ title: g ? `${g.title} — Giveaway` : "Giveaway" });

  const reload = async () => {
    const [{ data: gv }, { data: w }, { data: p }] = await Promise.all([
      supabase.from("giveaways").select("*").eq("id", id!).maybeSingle(),
      supabase.from("giveaway_public_winners").select("giveaway_id, winner_name, win_position").eq("giveaway_id", id!).order("win_position"),
      supabase.from("giveaway_proofs").select("*").eq("giveaway_id", id!).eq("status", "approved"),
    ]);
    setG(gv);
    setCount((gv as any)?.entry_count ?? 0);
    setWinners((w as any[]) || []);
    setProofs((p as any[])?.filter((x) => !x.visible_until || new Date(x.visible_until) > new Date()) || []);
    if (user) {
      const { data: e } = await supabase.from("giveaway_entries").select("*").eq("giveaway_id", id!).eq("user_id", user.id).maybeSingle();
      setMyEntry(e);
      if (e && !editing) setForm({ name: e.name, email: e.email, reason: e.reason });
      const { data: mine } = await supabase.from("giveaway_winners").select("entry_id").eq("giveaway_id", id!);
      setMyWins(((mine as any[]) || []).map((x) => x.entry_id));
    } else {
      setMyWins([]);
    }
  };

  useEffect(() => { reload(); }, [id, user]);

  // Auto-pick winners
  useEffect(() => {
    if (!g || autoTried) return;
    const ended = new Date(g.result_at) <= new Date();
    if (ended && g.auto_pick && winners.length === 0) {
      setAutoTried(true);
      supabase.rpc("pick_giveaway_winners", { _giveaway_id: g.id }).then(() => reload());
    }
  }, [g, autoTried, winners.length]);

  // Celebration once winners are revealed
  useEffect(() => {
    if (winners.length > 0 && !celebrated.current) {
      celebrated.current = true;
      setTimeout(() => { setReveal(true); fireCelebration(); }, 400);
    }
  }, [winners.length]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Sign in first"); return; }
    setBusy(true);
    let error;
    if (myEntry) {
      ({ error } = await supabase.from("giveaway_entries").update({
        name: form.name.trim(), email: form.email.trim(), reason: form.reason.trim(),
      }).eq("id", myEntry.id));
    } else {
      ({ error } = await supabase.from("giveaway_entries").insert({
        giveaway_id: id!, user_id: user.id, name: form.name.trim(), email: form.email.trim(), reason: form.reason.trim(),
      }));
    }
    setBusy(false);
    if (error) {
      if (error.message.includes("duplicate") || error.code === "23505") return toast.error("You or this email has already entered this giveaway.");
      return toast.error(error.message);
    }
    toast.success(myEntry ? "Entry updated ✏️" : "Entry submitted 🎉");
    setEditing(false);
    reload();
  };

  const cancelEntry = async () => {
    if (!myEntry || !confirm("Cancel your participation?")) return;
    const { error } = await supabase.from("giveaway_entries").delete().eq("id", myEntry.id);
    if (error) return toast.error(error.message);
    toast.success("Entry cancelled");
    setMyEntry(null);
    setForm({ name: "", email: "", reason: "" });
    reload();
  };

  if (!g) return <Layout><div className="page-container">Loading…</div></Layout>;

  const ended = new Date(g.result_at) <= new Date();
  const hasWinners = winners.length > 0;
  const isWinner = !!user && !!myEntry && myWins.includes(myEntry.id);

  return (
    <Layout>
      <section className="page-container max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden border border-red-500/30 shadow-2xl"
          style={{ background: "linear-gradient(135deg, rgba(127,29,29,0.25), rgba(15,23,42,0.6) 50%, rgba(245,158,11,0.15))" }}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,0.25),transparent_60%)] pointer-events-none" />

          <MediaImage source={g.image_url} className="w-full aspect-[16/7] object-cover" fallback={
            <div className="w-full aspect-[16/7] bg-gradient-to-br from-red-900/40 via-red-600/30 to-amber-500/20 flex items-center justify-center">
              <Gift size={64} className="text-red-200/60" />
            </div>
          } />

          <div className="relative p-6 md:p-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-200 text-xs font-bold uppercase tracking-widest mb-3">
              <Flame size={12} /> {ended ? (hasWinners ? "Winners announced" : "Drawing winners…") : "Live giveaway"}
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-black mb-2 bg-gradient-to-r from-red-300 via-amber-200 to-red-300 bg-clip-text text-transparent">{g.title}</h1>
            <p className="text-muted-foreground whitespace-pre-wrap mb-6 max-w-2xl">{g.description}</p>

            <div className="grid sm:grid-cols-4 gap-3 mb-6">
              <Stat label="Prize" value={g.prize} icon={<Gift size={14}/>} />
              <Stat label="Winners" value={`${winners.length}/${g.winner_count}`} icon={<Trophy size={14}/>} />
              <Stat label="Entries" value={String(count)} icon={<Users size={14}/>} />
              <Stat label={ended ? "Ended" : "Result in"} value={ended ? new Date(g.result_at).toLocaleDateString() : <Countdown to={g.result_at} onEnd={reload} />} icon={<Clock size={14}/>} />
            </div>

            {/* WINNERS REVEAL */}
            <AnimatePresence>
              {hasWinners && reveal && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 p-6 rounded-2xl border border-red-500/40 bg-gradient-to-br from-red-950/60 to-amber-950/40">
                  <div className="text-center mb-4">
                    <Trophy size={40} className="mx-auto text-amber-300 mb-2 animate-bounce" />
                    <div className="font-display font-black text-2xl md:text-3xl bg-gradient-to-r from-amber-200 to-red-300 bg-clip-text text-transparent">
                      {winners.length === 1 ? "The Winner!" : `${winners.length} Winners!`} 🎉
                    </div>
                  </div>
                  <div className="space-y-3">
                    {winners.map((w, i) => (
                      <motion.div key={w.entry_id} initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.15 }}>
                        <WinnerCard giveawayTitle={g.title} prize={g.prize} winnerName={w.winner_name} position={w.win_position} />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* APPROVED PROOFS (public) */}
            {proofs.length > 0 && (
              <div className="mb-6">
                <h3 className="font-display font-semibold mb-3 flex items-center gap-2"><ShieldCheck size={16} className="text-green-400"/> Winner moments</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {proofs.map((p) => <ProofTile key={p.id} proof={p} />)}
                </div>
              </div>
            )}

            {/* WINNER PROOF UPLOAD (only if I'm a winner) */}
            {isWinner && <WinnerProofForm giveawayId={g.id} entryId={myEntry.id} userId={user!.id} onDone={reload} />}

            {/* ENTRY FORM */}
            {!ended && (
              !user ? (
                <Link to="/auth" className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold">
                  <LogIn size={18} /> Sign in to enter
                </Link>
              ) : myEntry && !editing ? (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-1"><CheckCircle2 size={20} className="text-red-300" /><span className="font-display font-semibold">You're in! 🎉</span></div>
                  <p className="text-sm text-muted-foreground mb-3">Result on {new Date(g.result_at).toLocaleString()}. You can update your reason or cancel until then.</p>
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(true)} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-secondary text-sm font-semibold"><Edit3 size={14}/> Edit entry</button>
                    <button onClick={cancelEntry} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-destructive/20 text-destructive text-sm font-semibold"><Trash2 size={14}/> Cancel</button>
                  </div>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-3 bg-background/40 p-5 rounded-xl border border-red-500/20">
                  <h3 className="font-display font-bold text-lg">{myEntry ? "Edit your entry" : "🔥 Enter the giveaway"}</h3>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border" maxLength={100} />
                  <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email (we'll contact you here)" className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border" maxLength={255} />
                  <textarea required value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Why should you win?" rows={4} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border" maxLength={1000} />
                  <div className="flex gap-2">
                    <button disabled={busy} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 text-white font-bold disabled:opacity-50">
                      {busy ? "Saving…" : myEntry ? "Save changes" : "Submit entry 🚀"}
                    </button>
                    {editing && <button type="button" onClick={() => { setEditing(false); setForm({ name: myEntry.name, email: myEntry.email, reason: myEntry.reason }); }} className="px-4 rounded-xl bg-secondary">Cancel</button>}
                  </div>
                  <p className="text-xs text-muted-foreground">One entry per user/email. Your email is private and only visible to admins.</p>
                </form>
              )
            )}
          </div>
        </motion.div>
      </section>
    </Layout>
  );
};

const Stat = ({ label, value, icon }: { label: string; value: React.ReactNode; icon: React.ReactNode }) => (
  <div className="bg-background/40 border border-red-500/10 rounded-xl p-3">
    <div className="text-xs text-muted-foreground flex items-center gap-1">{icon} {label}</div>
    <div className="font-display font-bold mt-0.5 truncate">{value}</div>
  </div>
);

const ProofTile = ({ proof }: { proof: any }) => (
  <div className="rounded-xl overflow-hidden border border-border bg-background/60">
    <MediaImage source={proof.image_url} className="w-full aspect-video object-cover" />
    {proof.caption && <div className="p-2 text-xs text-muted-foreground">"{proof.caption}"</div>}
  </div>
);

const WinnerProofForm = ({ giveawayId, entryId, userId, onDone }: { giveawayId: string; entryId: string; userId: string; onDone: () => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error("Pick an image");
    setBusy(true);
    try {
      const path = await uploadGiveawayMedia(file, userId, "proofs");
      const { error } = await supabase.from("giveaway_proofs").insert({
        giveaway_id: giveawayId, winner_entry_id: entryId, user_id: userId, image_url: path, caption: caption.trim() || null,
      });
      if (error) throw error;
      toast.success("Proof submitted — admin will review shortly.");
      setFile(null); setCaption("");
      onDone();
    } catch (e: any) { toast.error(e.message); }
    setBusy(false);
  };
  return (
    <form onSubmit={submit} className="mb-6 p-5 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3">
      <h3 className="font-display font-bold flex items-center gap-2"><Sparkles size={16} className="text-amber-300"/> Share your win 🎉</h3>
      <p className="text-xs text-muted-foreground">Upload a proof photo. After admin approval it shows publicly here for a limited time.</p>
      <label className="flex items-center justify-center gap-2 w-full px-3 py-3 rounded-lg bg-secondary border border-dashed border-border cursor-pointer hover:border-amber-400 text-sm">
        {file ? `📎 ${file.name}` : (<><Upload size={14}/> Choose image</>)}
        <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      </label>
      <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption (optional)" maxLength={200} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border" />
      <button disabled={busy} className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold disabled:opacity-50">
        {busy ? "Uploading…" : "Submit proof"}
      </button>
    </form>
  );
};

export default GiveawayDetailPage;
