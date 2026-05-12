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

        <div className="glass-card p-4 space-y-2">
          {!loading && items.length === 0 && (
            <div className="text-center py-12 text-sm text-muted-foreground">
              <BookOpen size={32} className="mx-auto mb-2 opacity-50" />
              No books uploaded yet in this category.
            </div>
          )}
          {items.map((it, i) => (
            <motion.a
              key={it.id}
              href={it.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="chapter-item group"
            >
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{it.title}</div>
                {(it.section || it.description) && (
                  <div className="text-xs text-muted-foreground truncate">
                    {it.section}{it.section && it.description ? " · " : ""}{it.description}
                  </div>
                )}
              </div>
              <ExternalLink size={14} className="text-muted-foreground group-hover:text-primary" />
            </motion.a>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default BookSubjectPage;
