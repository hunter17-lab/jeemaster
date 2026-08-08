import { motion } from "framer-motion";
import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, BookOpen } from "lucide-react";
import Layout from "@/components/Layout";
import { useAdminContent } from "@/hooks/useAdminContent";
import useSEO from "@/hooks/useSEO";

const META: Record<string, { key: string; label: string; icon: string; accent: string }> = {
  physics:    { key: "Physics",     label: "Physics Books",     icon: "⚡", accent: "from-blue-500/20 to-cyan-500/10" },
  chemistry:  { key: "Chemistry",   label: "Chemistry Books",   icon: "🧪", accent: "from-emerald-500/20 to-teal-500/10" },
  mathematics:{ key: "Mathematics", label: "Maths Books",       icon: "📐", accent: "from-violet-500/20 to-fuchsia-500/10" },
  pcm:        { key: "PCM",         label: "PCM Combined Books",icon: "📚", accent: "from-amber-500/20 to-orange-500/10" },
};

const BookSubjectPage = () => {
  const { subject } = useParams<{ subject: string }>();
  const meta = subject ? META[subject.toLowerCase()] : undefined;
  if (!meta) return <Navigate to="/books" replace />;

  const { items, loading } = useAdminContent("books", meta.key);
  useSEO({
    title: `${meta.label} for JEE | JEE Master`,
    description: `Curated ${meta.label.toLowerCase()} for IIT JEE preparation. Free access to recommended titles.`,
  });

  return (
    <Layout>
      <div className="page-container">
        <Link to="/books" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4">
          <ArrowLeft size={16} /> All Books
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`glass-card p-6 mb-6 bg-gradient-to-r ${meta.accent}`}
        >
          <div className="flex items-center gap-4">
            <span className="text-4xl">{meta.icon}</span>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold">{meta.label}</h1>
              <p className="text-sm text-muted-foreground">
                {loading ? "Loading…" : `${items.length} ${items.length === 1 ? "book" : "books"} available`}
              </p>
            </div>
          </div>
        </motion.div>

        {!loading && items.length === 0 && (
          <div className="glass-card p-4 text-center py-12 text-sm text-muted-foreground">
            <BookOpen size={32} className="mx-auto mb-2 opacity-50" />
            No books uploaded yet in this category.
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <motion.div
              key={it.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.4) }}
              className="glass-card p-5 flex flex-col gap-3 hover:scale-[1.01] transition-transform"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                  <BookOpen size={18} className="text-primary-foreground" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold leading-snug line-clamp-3">{it.title}</h2>
                  {it.section && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">by {it.section}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-medium">
                  {meta.label.replace(" Books", "")}
                </span>
                {it.description && (
                  <span className="px-2 py-0.5 rounded-full bg-secondary text-[11px] text-muted-foreground">
                    {it.description}
                  </span>
                )}
              </div>

              <a
                href={it.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex items-center justify-center gap-2 w-full py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition"
              >
                Open Book <ExternalLink size={14} />
              </a>
            </motion.div>
          ))}
        </div>

      </div>
    </Layout>
  );
};

export default BookSubjectPage;
