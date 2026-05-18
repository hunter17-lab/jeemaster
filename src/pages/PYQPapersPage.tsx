import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, FileText } from "lucide-react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { monthEmoji } from "@/data/pyqAttempts";

const PYQPapersPage = () => {
  const { year, shift, month } = useParams<{ year: string; shift: string; month: string }>();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const shiftLabel = shift === "shift1" ? "Shift 1" : "Shift 2";
  const monthLabel = month || "";
  const section = `${shiftLabel} - ${monthLabel}`;

  useEffect(() => {
    setLoading(true);
    supabase
      .from("content_items")
      .select("*")
      .eq("type", "pyq")
      .eq("subject", year!)
      .eq("section", section)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setItems(data || []);
        setLoading(false);
      });
  }, [year, section]);

  return (
    <Layout>
      <div className="page-container">
        <Link to="/pyq" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft size={14} /> Back to PYQ
        </Link>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-widest mb-3">
            🎯 JEE Main {year}
          </div>
          <h1 className="text-3xl font-display font-bold mb-1">
            {monthEmoji[monthLabel] || "📅"} {monthLabel} Attempt — {shiftLabel}
          </h1>
          <p className="text-muted-foreground">All uploaded papers</p>
        </motion.div>

        {loading ? (
          <div className="text-muted-foreground">Loading…</div>
        ) : items.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <FileText className="mx-auto mb-3 text-muted-foreground" size={36} />
            <p className="text-muted-foreground">No papers uploaded yet for this attempt.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((it, i) => (
              <motion.a
                key={it.id}
                href={it.link}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ scale: 1.02 }}
                className="glass-card p-5 group flex flex-col gap-2 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground shrink-0">
                    <FileText size={18} />
                  </div>
                  <ExternalLink size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="font-display font-semibold leading-tight">{it.title}</h3>
                {it.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{it.description}</p>
                )}
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PYQPapersPage;
