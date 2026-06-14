import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Gift, Clock, Trophy, Users } from "lucide-react";
import Layout from "@/components/Layout";
import useSEO from "@/hooks/useSEO";
import { supabase } from "@/integrations/supabase/client";

interface Giveaway {
  id: string;
  title: string;
  description: string | null;
  prize: string;
  image_url: string | null;
  result_at: string;
  status: string;
  winner_entry_id: string | null;
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
  return <span>{t}</span>;
};

const GiveawayCard = ({ g }: { g: Giveaway }) => {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    supabase.rpc("giveaway_entry_count", { _giveaway_id: g.id }).then(({ data }) => setCount(data as number));
  }, [g.id]);
  const ended = g.status === "ended" || new Date(g.result_at) < new Date();
  return (
    <Link to={`/giveaways/${g.id}`} className="glass-card overflow-hidden hover-lift group block">
      {g.image_url && (
        <div className="aspect-video bg-secondary overflow-hidden">
          <img src={g.image_url} alt={g.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ended ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>
            {ended ? (g.winner_entry_id ? "🏆 Winner picked" : "Ended") : "🎁 Live"}
          </span>
        </div>
        <h3 className="font-display font-bold text-lg mb-1">{g.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{g.description}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Users size={12} /> {count ?? "…"} entries</span>
          <span className="inline-flex items-center gap-1">
            <Clock size={12} /> {ended ? "Result out" : <Countdown to={g.result_at} />}
          </span>
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
  const active = items.filter((g) => g.status === "active" && new Date(g.result_at) > new Date());
  const past = items.filter((g) => !active.includes(g));
  return (
    <Layout>
      <section className="page-container">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-widest mb-4">
            <Gift size={14} /> Free Giveaways
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-3">Win Free Goodies 🎁</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">Enter active giveaways, tell us why you should win, and we'll pick a lucky aspirant.</p>
        </motion.div>

        {loading && <p className="text-center text-muted-foreground">Loading…</p>}

        {!loading && active.length > 0 && (
          <>
            <h2 className="font-display font-semibold text-xl mb-4 flex items-center gap-2"><Gift size={20} className="text-primary" /> Active</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
              {active.map((g) => <GiveawayCard key={g.id} g={g} />)}
            </div>
          </>
        )}

        {!loading && past.length > 0 && (
          <>
            <h2 className="font-display font-semibold text-xl mb-4 flex items-center gap-2"><Trophy size={20} /> Past Giveaways</h2>
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
