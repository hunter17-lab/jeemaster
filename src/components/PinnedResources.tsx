import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Pin, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PinnedItem {
  id: string;
  type: string;
  subject: string;
  section: string | null;
  title: string;
  link: string;
  description: string | null;
}

const typeEmoji: Record<string, string> = {
  notes: "📝", mindmaps: "🧠", dpp: "⚡", pyq: "🎯", books: "📚", coaching: "🏫",
};

const PinnedResources = () => {
  const [items, setItems] = useState<PinnedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase
      .from("content_items")
      .select("*")
      .eq("pinned", true)
      .order("pinned_at", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (active) {
          setItems((data as any) || []);
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, []);

  if (loading || items.length === 0) return null;

  return (
    <section className="page-container pb-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-widest mb-3">
          <Pin size={14} /> Featured by Admin
        </div>
        <h2 className="text-2xl md:text-3xl font-display font-bold">📌 Pinned Resources</h2>
        <p className="text-muted-foreground text-sm mt-2">Hand-picked highlights you shouldn't miss</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((it, i) => (
          <motion.a
            key={it.id}
            href={it.link}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4 }}
            className="group glass-card p-5 hover-lift relative overflow-hidden"
          >
            <div className="absolute top-3 right-3 w-7 h-7 rounded-full gradient-primary flex items-center justify-center shadow-md">
              <Pin size={12} className="text-primary-foreground" />
            </div>
            <div className="text-3xl mb-2">{typeEmoji[it.type] || "📌"}</div>
            <h3 className="font-display font-semibold text-base mb-1 line-clamp-2 pr-8">{it.title}</h3>
            <div className="text-xs text-muted-foreground mb-3">
              {it.subject}{it.section ? ` · ${it.section}` : ""} · <span className="capitalize">{it.type}</span>
            </div>
            {it.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{it.description}</p>
            )}
            <div className="flex items-center gap-1 text-xs text-primary font-medium">
              Open <ExternalLink size={12} />
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
};

export default PinnedResources;
