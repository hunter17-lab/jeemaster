import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, School, FileText, PlayCircle, Users, ImageIcon } from "lucide-react";
import Layout from "@/components/Layout";
import useSEO from "@/hooks/useSEO";
import { supabase } from "@/integrations/supabase/client";

interface Series { id: string; name: string; description: string | null; logo_path: string | null }
interface SeriesTest { id: string; series_id: string; name: string; url: string; sort_order: number }

const resolveLogo = async (path: string | null): Promise<string | null> => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const { data } = await supabase.storage.from("coaching-media").createSignedUrl(path, 60 * 60 * 24 * 365);
  return data?.signedUrl || null;
};

/** Landing page for one coaching test series: lists its embedded tests. */
const CoachingSeriesPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [series, setSeries] = useState<Series | null>(null);
  const [tests, setTests] = useState<SeriesTest[]>([]);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useSEO({
    title: series ? `${series.name} — Coaching Test Series — JEE MASTER` : "Coaching Test Series",
    description: series?.description || "Attempt coaching test series papers on JEE MASTER.",
  });

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: s } = await supabase.from("coaching_test_series").select("*").eq("id", id).maybeSingle();
      if (!active) return;
      if (!s) { setNotFound(true); setLoading(false); return; }
      setSeries(s as Series);
      resolveLogo((s as Series).logo_path).then((u) => active && setLogoUrl(u));
      const { data: ts } = await supabase.from("coaching_series_tests").select("*").eq("series_id", id).order("sort_order");
      if (active) setTests((ts as SeriesTest[]) || []);
      if (active) setLoading(false);
    })();
    return () => { active = false; };
  }, [id]);

  if (notFound) {
    return (
      <Layout>
        <div className="page-container py-20 text-center space-y-4">
          <h1 className="text-2xl font-display font-bold">Test series not found</h1>
          <button onClick={() => navigate("/mock-hub")} className="rounded-2xl gradient-primary text-primary-foreground font-display font-bold px-6 py-3">Back to Mock Hub</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-container py-10 md:py-14">
        <button
          onClick={() => navigate("/mock-hub")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={16} /> Back to Mock Hub
        </button>

        {loading ? (
          <div className="space-y-4 max-w-4xl">
            <div className="h-40 rounded-3xl bg-secondary/50 animate-pulse" />
            {[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-secondary/40 animate-pulse" />)}
          </div>
        ) : (
          series && (
            <div className="max-w-4xl space-y-8">
              {/* Series header card */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {logoUrl ? (
                  <img src={logoUrl} alt={series.name} className="w-20 h-20 rounded-2xl object-cover border border-border shadow-lg" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/25 shrink-0">
                    <School size={34} className="text-primary-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-semibold uppercase tracking-widest mb-2">
                    <School size={12} /> Coaching Test Series
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-display font-bold">{series.name}</h1>
                  {series.description && <p className="text-muted-foreground mt-1 max-w-xl">{series.description}</p>}
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5"><FileText size={13} /> {tests.length} test{tests.length === 1 ? "" : "s"} available</p>
                </div>
              </motion.div>

              {/* Test cards */}
              {tests.length === 0 ? (
                <div className="glass-card p-10 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-secondary/60 flex items-center justify-center mx-auto mb-4">
                    <ImageIcon size={24} className="text-muted-foreground" />
                  </div>
                  <h2 className="font-display font-bold text-lg mb-1">No tests published yet</h2>
                  <p className="text-sm text-muted-foreground">Tests for this series will appear here once the admin publishes them.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {tests.map((t, i) => (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Link
                        to={`/coaching-series/${series.id}/${t.id}`}
                        className="group block glass-card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/40 active:scale-[0.99]"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white shadow-lg shrink-0">
                            <PlayCircle size={20} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-display font-semibold text-lg leading-tight">{t.name}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><Users size={12} /> Full CBT paper · attempt online</p>
                          </div>
                        </div>
                        <div className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                          Start Test <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )
        )}
      </div>
    </Layout>
  );
};

export default CoachingSeriesPage;
