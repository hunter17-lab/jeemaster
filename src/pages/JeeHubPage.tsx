import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight, Sparkles } from "lucide-react";
import Layout from "@/components/Layout";
import { hubTools } from "@/data/jeeHub";

const JeeHubPage = () => {
  return (
    <Layout>
      <div className="page-container">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-widest mb-3">
            <Sparkles size={14} /> JEE Hub
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2">
            🚀 The JEE Hub
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            One place for adaptive practice, full mock series, year-wise PYQs and a
            24/7 AI teacher. Built into JEE MASTER — pick a tool and start grinding.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {hubTools.map((t, i) => {
            const Icon = t.icon;
            return (
              <motion.div
                key={t.slug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  to={`/hub/${t.slug}`}
                  className="group glass-card p-5 flex flex-col h-full hover:border-primary/40 transition-colors relative overflow-hidden"
                >
                  <div
                    className={`absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br ${t.accent} opacity-20 blur-2xl group-hover:opacity-40 transition-opacity`}
                  />
                  <div className="flex items-start justify-between gap-3 mb-3 relative">
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${t.accent} flex items-center justify-center text-white shadow-lg`}
                    >
                      <Icon size={20} />
                    </div>
                    {t.badge && (
                      <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {t.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display font-semibold text-lg leading-tight mb-1 relative">
                    {t.title}
                  </h3>
                  <p className="text-xs font-medium text-primary/80 mb-2 relative">{t.tagline}</p>
                  <p className="text-sm text-muted-foreground flex-1 relative">{t.description}</p>
                  <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary relative">
                    Launch <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
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

export default JeeHubPage;
