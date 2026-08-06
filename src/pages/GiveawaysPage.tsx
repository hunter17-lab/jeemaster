import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Gift, Clock, Trophy, Users, Flame } from "lucide-react";
import Layout from "@/components/Layout";
import useSEO from "@/hooks/useSEO";
import { supabase } from "@/integrations/supabase/client";
import MediaImage from "@/components/MediaImage";

interface Giveaway {
  id: string;
  title: string;
  description: string | null;
  prize: string;
  image_url: string | null;
  result_at: string;
  status: string;
  winner_entry_id: string | null;
  winner_count: number;
  entry_count?: number;
}

const Countdown = ({ to }: { to: string }) => {
  const [t, setT] = useState("");
  useEffect(() => {
    const tick = () => {
      const diff = new Date(to).getTime() - Date.now();
      if (diff <= 0) return setT("Ended");
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
  return <span className="tabular-nums">{t}</span>;
};

const GiveawayCard = ({ g }: { g: Giveaway }) => {
  const count = g.entry_count ?? 0;

  const ended = g.status === "ended" || new Date(g.result_at) < new Date();
  return (
    <Link to={`/giveaways/${g.id}`} className="group block rounded-2xl overflow-hidden border border-red-500/20 bg-gradient-to-br from-background to-red-950/10 hover:border-red-500/50 hover:shadow-[0_0_30px_-10px_rgba(220,38,38,0.5)] transition-all hover:-translate-y-1">
      <div className="relative aspect-video overflow-hidden">
        <MediaImage source={g.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform" fallback={
          <div className="w-full h-full bg-gradient-to-br from-red-900/40 via-red-600/30 to-amber-500/20 flex items-center justify-center"><Gift size={48} className="text-red-200/60" /></div>
        } />
        <div className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur text-xs font-bold">
          {ended ? (g.winner_entry_id ? <><Trophy size={10} className="text-amber-300"/> Winner</> : "Ended") : <><Flame size={10} className="text-red-400"/> <span className="text-red-200">Live</span></>}
        </div>
        {g.winner_count > 1 && (
          <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-amber-500/90 text-amber-950 text-xs font-bold">{g.winner_count}× winners</div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-display font-bold text-lg mb-1 line-clamp-1">{g.title}</h3>
        <div className="text-sm text-red-300 font-semibold mb-2">🎁 {g.prize}</div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{g.description}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Users size={12} /> {count ?? "…"} entries</span>
          <span className="inline-flex items-center gap-1"><Clock size={12} /> {ended ? "Result out" : <Countdown to={g.result_at} />}</span>
        </div>
      </div>
    </Link>
  );
};

const GiveawaysPage = () => {
  useSEO({ title: "Giveaways — JEE MASTER", description: "Participate in free JEE giveaways and win prizes." });
  const [items, setItems] = useState<Giveaway[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.from("giveaways").select("*").order("result_at", { ascending: false }).then(({ data }) => {
      setItems((data as any) || []);
      setLoading(false);
    });
  }, []);
  const active = items.filter((g) => g.status !== "ended" && new Date(g.result_at) > new Date());
  const past = items.filter((g) => !active.includes(g));
  return (
    <Layout>
      <section className="page-container">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10 relative">
          <div className="absolute inset-x-0 -top-10 h-40 bg-[radial-gradient(circle,rgba(220,38,38,0.25),transparent_60%)] pointer-events-none" />
          <div className="relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/15 border border-red-500/30 text-red-200 text-xs font-bold uppercase tracking-widest mb-4">
            <Flame size={14} /> Free Giveaways
          </div>
          <h1 className="relative text-4xl md:text-6xl font-display font-black mb-3 bg-gradient-to-r from-red-300 via-amber-200 to-red-300 bg-clip-text text-transparent">Win Free Goodies</h1>
          <p className="relative text-muted-foreground max-w-xl mx-auto">Enter active giveaways, tell us why you should win, and we'll pick lucky aspirants live.</p>
        </motion.div>

        {loading && <p className="text-center text-muted-foreground">Loading…</p>}

        {!loading && active.length > 0 && (
          <>
            <h2 className="font-display font-semibold text-xl mb-4 flex items-center gap-2"><Flame size={20} className="text-red-400" /> Active</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
              {active.map((g) => <GiveawayCard key={g.id} g={g} />)}
            </div>
          </>
        )}

        {!loading && past.length > 0 && (
          <>
            <h2 className="font-display font-semibold text-xl mb-4 flex items-center gap-2"><Trophy size={20} className="text-amber-300" /> Past Giveaways</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {past.map((g) => <GiveawayCard key={g.id} g={g} />)}
            </div>
          </>
        )}

        {!loading && items.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Gift size={48} className="mx-auto mb-3 opacity-50" />
            <p>No giveaways yet. Check back soon!</p>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default GiveawaysPage;
