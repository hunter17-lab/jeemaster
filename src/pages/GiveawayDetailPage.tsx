import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Gift, Clock, Trophy, Users, CheckCircle2, LogIn } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import useSEO from "@/hooks/useSEO";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
  return <span className="font-mono">{t}</span>;
};

const GiveawayDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [g, setG] = useState<any>(null);
  const [count, setCount] = useState(0);
  const [myEntry, setMyEntry] = useState<any>(null);
  const [form, setForm] = useState({ name: "", email: "", reason: "" });
  const [busy, setBusy] = useState(false);
  const [autoTried, setAutoTried] = useState(false);
  useSEO({ title: g ? `${g.title} — Giveaway` : "Giveaway" });

  const reload = async () => {
    const [{ data: gv }, { data: cnt }] = await Promise.all([
      supabase.from("giveaways").select("*").eq("id", id!).maybeSingle(),
      supabase.rpc("giveaway_entry_count", { _giveaway_id: id! }),
    ]);
    setG(gv);
    setCount((cnt as number) ?? 0);
    if (user) {
      const { data: e } = await supabase.from("giveaway_entries").select("*").eq("giveaway_id", id!).eq("user_id", user.id).maybeSingle();
      setMyEntry(e);
      if (e && !form.name) setForm({ name: e.name, email: e.email, reason: e.reason });
    }
  };

  useEffect(() => { reload(); }, [id, user]);

  // Auto-pick winner if time has passed
  useEffect(() => {
    if (!g || autoTried) return;
    const ended = new Date(g.result_at) <= new Date();
    if (ended && g.auto_pick && !g.winner_entry_id) {
      setAutoTried(true);
      supabase.rpc("pick_giveaway_winner", { _giveaway_id: g.id }).then(() => reload());
    }
  }, [g, autoTried]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Sign in first"); return; }
    setBusy(true);
    const { error } = await supabase.from("giveaway_entries").insert({
      giveaway_id: id!, user_id: user.id, name: form.name.trim(), email: form.email.trim(), reason: form.reason.trim(),
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Entry submitted 🎉");
    reload();
  };

  if (!g) return <Layout><div className="page-container">Loading…</div></Layout>;

  const ended = new Date(g.result_at) <= new Date();
  const hasWinner = !!g.winner_entry_id;

  return (
    <Layout>
      <section className="page-container max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
          {g.image_url && (
            <div className="aspect-video bg-secondary overflow-hidden">
              <img src={g.image_url} alt={g.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-6 md:p-8">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ended ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>
              {ended ? (hasWinner ? "🏆 Winner picked" : "Ended") : "🎁 Live"}
            </span>
            <h1 className="text-3xl md:text-4xl font-display font-bold mt-3 mb-2">{g.title}</h1>
            <p className="text-muted-foreground whitespace-pre-wrap mb-4">{g.description}</p>
            <div className="grid sm:grid-cols-3 gap-3 mb-6">
              <div className="bg-secondary/50 rounded-lg p-3"><div className="text-xs text-muted-foreground">Prize</div><div className="font-semibold flex items-center gap-1"><Gift size={14}/> {g.prize}</div></div>
              <div className="bg-secondary/50 rounded-lg p-3"><div className="text-xs text-muted-foreground">Entries</div><div className="font-semibold flex items-center gap-1"><Users size={14}/> {count}</div></div>
              <div className="bg-secondary/50 rounded-lg p-3"><div className="text-xs text-muted-foreground">{ended ? "Ended" : "Result in"}</div><div className="font-semibold flex items-center gap-1"><Clock size={14}/> {ended ? new Date(g.result_at).toLocaleDateString() : <Countdown to={g.result_at} onEnd={reload} />}</div></div>
            </div>

            {hasWinner && (
              <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-6 text-center">
                <Trophy size={28} className="mx-auto text-primary mb-1" />
                <div className="font-display font-bold">A winner has been picked!</div>
                <div className="text-sm text-muted-foreground">We'll contact the lucky aspirant over email shortly.</div>
              </div>
            )}

            {!ended && (
              myEntry ? (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <CheckCircle2 size={32} className="mx-auto text-primary mb-2" />
                  <div className="font-display font-semibold">You're in! 🎉</div>
                  <div className="text-sm text-muted-foreground">Good luck — we'll announce the winner on {new Date(g.result_at).toLocaleString()}.</div>
                </div>
              ) : !user ? (
                <Link to="/auth" className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl gradient-primary text-primary-foreground font-semibold">
                  <LogIn size={18} /> Sign in to enter
                </Link>
              ) : (
                <form onSubmit={submit} className="space-y-3">
                  <h3 className="font-display font-semibold">Enter the giveaway</h3>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border" maxLength={100} />
                  <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email (we'll contact you here)" className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border" maxLength={255} />
                  <textarea required value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Why should you win this giveaway?" rows={4} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border" maxLength={1000} />
                  <button disabled={busy} className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold disabled:opacity-50">
                    {busy ? "Submitting…" : "Submit entry 🚀"}
                  </button>
                  <p className="text-xs text-muted-foreground text-center">Your email is private and only visible to admins.</p>
                </form>
              )
            )}
          </div>
        </motion.div>
      </section>
    </Layout>
  );
};

export default GiveawayDetailPage;
