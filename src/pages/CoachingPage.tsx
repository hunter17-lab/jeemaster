import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import { COACHINGS } from "@/lib/coaching";
import { supabase } from "@/integrations/supabase/client";

const CoachingPage = () => {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    let active = true;
    supabase
      .from("content_items")
      .select("subject")
      .eq("type", "coaching")
      .then(({ data }) => {
        if (!active) return;
        const map: Record<string, number> = {};
        (data || []).forEach((r: any) => {
          const slug = String(r.subject || "").toLowerCase();
          map[slug] = (map[slug] || 0) + 1;
        });
        setCounts(map);
      });
    return () => { active = false; };
  }, []);

  return (
    <Layout>
      <div className="page-container">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/15 via-secondary/40 to-transparent p-7 sm:p-10 mb-8">
          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-3">🏫 Coaching Material</h1>
          <p className="text-muted-foreground max-w-2xl">
            Access organized study material from leading JEE coaching institutes.
          </p>
          <p className="mt-3 text-xs sm:text-sm font-semibold uppercase tracking-widest text-primary">
            Modules • DPPs • Tests • Study Material
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {COACHINGS.map((c, i) => {
            const Icon = c.icon;
            const count = counts[c.slug] || 0;
            return (
              <motion.div
                key={c.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to={`/coaching/${c.slug}`}
                  className={`group block h-full rounded-2xl border ${c.ring} bg-gradient-to-br ${c.gradient} p-6 sm:p-7 shadow-lg shadow-background/40 transition-all duration-300 hover:shadow-xl`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`shrink-0 w-14 h-14 rounded-2xl bg-background/60 border border-border/60 flex items-center justify-center ${c.accent}`}>
                      <Icon size={26} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="font-display font-bold text-xl sm:text-2xl truncate">{c.name}</h2>
                      <p className="text-sm text-muted-foreground mt-0.5">{c.desc}</p>
                      <p className={`mt-3 text-sm font-semibold ${c.accent}`}>
                        {count} {count === 1 ? "Resource" : "Resources"}
                      </p>
                    </div>
                    <ArrowRight size={20} className="shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default CoachingPage;
