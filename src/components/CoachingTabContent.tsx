import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { School, Lock, PlayCircle, Sigma, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MATHANGO_PAPERS, isPaperUnlocked, formatUnlockDate } from "@/data/mathangoQft";

interface Series { id: string; name: string; description: string | null; logo_path: string | null; test_count: number; logo_url: string | null }

const resolveLogo = async (path: string | null) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const { data } = await supabase.storage.from("coaching-media").createSignedUrl(path, 60 * 60 * 24);
  return data?.signedUrl || null;
};

/** Coaching Test Series tab: admin-managed series plus the Mathango 2027 QFTs. */
const CoachingTabContent = () => {
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("coaching_test_series")
        .select("id,name,description,logo_path,coaching_series_tests(count)")
        .order("sort_order")
        .order("created_at");
      const rows = await Promise.all(
        (data || []).map(async (r: any) => ({
          ...r,
          test_count: r.coaching_series_tests?.[0]?.count ?? 0,
          logo_url: await resolveLogo(r.logo_path),
        }))
      );
      setSeries(rows);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-2xl font-display font-bold mb-1">📐 Mathango 2027 QFTs</h2>
        <p className="text-sm text-muted-foreground mb-5">Full CBT papers. A new paper unlocks every Sunday.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MATHANGO_PAPERS.map((p, i) => {
            const open = isPaperUnlocked(p);
            const inner = (
              <>
                <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-gradient-to-br from-maths to-primary opacity-20 blur-2xl" />
                <div className="w-11 h-11 rounded-xl bg-maths/15 text-maths flex items-center justify-center mb-3 relative">
                  {open ? <Sigma size={20} /> : <Lock size={18} />}
                </div>
                <h3 className="font-display font-semibold text-lg relative">{p.title}</h3>
                <p className="text-xs text-muted-foreground relative flex-1">
                  {open ? "Mathango 2027 · Available now" : `Unlocks ${formatUnlockDate(p.unlockAt)}`}
                </p>
                <span className={`mt-3 inline-flex items-center gap-1 text-sm font-semibold relative ${open ? "text-primary" : "text-muted-foreground"}`}>
                  {open ? <>Start Test <ArrowRight size={14} /></> : "Locked"}
                </span>
              </>
            );
            const cls = "glass-card p-5 flex flex-col h-full relative overflow-hidden transition-all duration-300";
            return (
              <motion.div key={p.n} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                {open ? (
                  <Link to={`/mock-hub/mathango/${p.n}`} className={`${cls} hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl`}>{inner}</Link>
                ) : (
                  <div className={`${cls} opacity-60`} aria-disabled>{inner}</div>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-display font-bold mb-1">🏫 Coaching Test Series</h2>
        <p className="text-sm text-muted-foreground mb-5">Test series from top coaching institutes.</p>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => <div key={i} className="glass-card h-36 animate-pulse" />)}
          </div>
        ) : series.length === 0 ? (
          <div className="glass-card p-10 text-center text-muted-foreground">No coaching test series added yet.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {series.map((s) => (
              <Link key={s.id} to={`/coaching-series/${s.id}`} className="group glass-card p-5 flex gap-4 items-start hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl transition-all">
                <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                  {s.logo_url ? <img src={s.logo_url} alt={s.name} className="w-full h-full object-contain" /> : <School size={24} className="text-primary" />}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display font-semibold leading-tight">{s.name}</h3>
                  {s.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{s.description}</p>}
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                    <PlayCircle size={13} /> {s.test_count} test{s.test_count === 1 ? "" : "s"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default CoachingTabContent;
