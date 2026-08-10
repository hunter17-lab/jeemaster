import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { getCoaching, coachingMaterialType, materialTypeStyles, COACHING_MATERIAL_TYPES } from "@/lib/coaching";

const CoachingDetailPage = () => {
  const { slug } = useParams();
  const coaching = getCoaching(slug);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!coaching) return;
    let active = true;
    setLoading(true);
    supabase
      .from("content_items")
      .select("*")
      .eq("type", "coaching")
      .eq("subject", coaching.slug)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!active) return;
        setItems(data || []);
        setLoading(false);
      });
    return () => { active = false; };
  }, [coaching?.slug]);

  if (!coaching) {
    return (
      <Layout>
        <div className="page-container text-center">
          <h1 className="text-2xl font-display font-bold mb-2">Coaching not found</h1>
          <Link to="/coaching" className="text-primary hover:underline">Back to Coaching Material</Link>
        </div>
      </Layout>
    );
  }

  const Icon = coaching.icon;
  const groups = COACHING_MATERIAL_TYPES.map((t) => ({
    type: t,
    label: t === "OTHER" ? "Other Material" : t === "DPP" ? "DPPs" : t === "TEST" ? "Tests" : t === "MODULE" ? "Modules" : "Notes",
    list: items.filter((it) => coachingMaterialType(it.resource_type) === t),
  })).filter((g) => g.list.length > 0);

  return (
    <Layout>
      <div className="page-container">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={`relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br ${coaching.gradient} p-7 sm:p-9 mb-8`}>
          <Link to="/coaching" className="text-xs text-muted-foreground hover:text-primary">← Coaching Material</Link>
          <div className="flex items-center gap-4 mt-3">
            <div className={`w-14 h-14 rounded-2xl bg-background/60 border border-border/60 flex items-center justify-center ${coaching.accent}`}>
              <Icon size={26} />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-display font-bold truncate">{coaching.name}</h1>
              <p className="text-sm text-muted-foreground">
                {items.length} {items.length === 1 ? "resource" : "resources"} • {coaching.desc}
              </p>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : items.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="font-display font-semibold text-lg mb-1">No material yet</p>
            <p className="text-sm text-muted-foreground">New {coaching.short} resources will appear here soon.</p>
          </div>
        ) : (
          <div className="space-y-9">
            {groups.map((g) => (
              <section key={g.type}>
                <h2 className="font-display font-bold text-lg mb-3">{g.label} <span className="text-muted-foreground text-sm font-normal">({g.list.length})</span></h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {g.list.map((it, i) => {
                    const t = coachingMaterialType(it.resource_type);
                    return (
                      <motion.div
                        key={it.id}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(i * 0.04, 0.3) }}
                        whileHover={{ y: -4 }}
                        className="glass-card p-5 flex flex-col gap-3 transition-shadow hover:shadow-xl"
                      >
                        <div className="flex items-start gap-3">
                          <h3 className="font-semibold leading-snug break-words flex-1">{it.title}</h3>
                          <span className={`shrink-0 px-2 py-0.5 rounded-full border text-[10px] font-bold tracking-wide ${materialTypeStyles[t]}`}>
                            {t}
                          </span>
                        </div>
                        {it.description && (
                          <p className="text-sm text-muted-foreground break-words">{it.description}</p>
                        )}
                        <a
                          href={it.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-auto inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold"
                        >
                          Open Material <ExternalLink size={14} />
                        </a>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CoachingDetailPage;
