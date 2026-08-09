import { motion } from "framer-motion";
import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";
import Layout from "@/components/Layout";
import BookCard from "@/components/BookCard";
import { useAdminContent } from "@/hooks/useAdminContent";
import useSEO from "@/hooks/useSEO";

const META: Record<string, { key: string; label: string; icon: string; accent: string; subtitle: string }> = {
  physics:    { key: "Physics",     label: "Physics Books",      icon: "⚡", subtitle: "Physics study resources",     accent: "from-blue-500/25 via-cyan-500/10 to-transparent" },
  chemistry:  { key: "Chemistry",   label: "Chemistry Books",    icon: "🧪", subtitle: "Chemistry study resources",   accent: "from-emerald-500/25 via-teal-500/10 to-transparent" },
  mathematics:{ key: "Mathematics", label: "Maths Books",        icon: "📐", subtitle: "Mathematics study resources", accent: "from-violet-500/25 via-fuchsia-500/10 to-transparent" },
  pcm:        { key: "PCM",         label: "PCM Combined Books", icon: "📚", subtitle: "Complete PCM resources",      accent: "from-amber-500/25 via-orange-500/10 to-transparent" },
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
          className={`relative mb-6 overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br ${meta.accent} p-6 sm:p-8 shadow-lg backdrop-blur-xl`}
        >
          <div className="flex items-center gap-5">
            <span className="text-4xl sm:text-5xl drop-shadow">{meta.icon}</span>
            <div className="min-w-0">
              <h1 className="font-display text-2xl sm:text-3xl font-bold">{meta.label}</h1>
              <p className="mt-1 text-sm font-semibold text-primary">
                {loading ? "Loading…" : `${items.length} ${items.length === 1 ? "Book" : "Books"} Available`}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">{meta.subtitle}</p>
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
            <BookCard
              key={it.id}
              index={i}
              book={{
                id: it.id,
                title: it.title,
                author: it.section,
                edition: it.description,
                link: it.link,
                resource_type: (it as any).resource_type,
              }}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default BookSubjectPage;
