import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Layout from "@/components/Layout";
import { useAdminContent } from "@/hooks/useAdminContent";

const CATEGORIES = [
  { slug: "physics",     key: "Physics",     label: "Physics Books",     icon: "⚡", accent: "from-blue-500/20 to-cyan-500/10" },
  { slug: "chemistry",   key: "Chemistry",   label: "Chemistry Books",   icon: "🧪", accent: "from-emerald-500/20 to-teal-500/10" },
  { slug: "mathematics", key: "Mathematics", label: "Maths Books",       icon: "📐", accent: "from-violet-500/20 to-fuchsia-500/10" },
  { slug: "pcm",         key: "PCM",         label: "PCM Combined",      icon: "📚", accent: "from-amber-500/20 to-orange-500/10" },
] as const;

const CategoryTile = ({ cat }: { cat: typeof CATEGORIES[number] }) => {
  const { items, loading } = useAdminContent("books", cat.key);
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Link
        to={`/books/${cat.slug}`}
        className={`glass-card group flex items-center gap-4 p-5 bg-gradient-to-r ${cat.accent} hover:scale-[1.01] transition-transform`}
      >
        <span className="text-3xl">{cat.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-lg">{cat.label}</h3>
          <p className="text-xs text-muted-foreground">
            {loading ? "Loading…" : `${items.length} ${items.length === 1 ? "book" : "books"} available`}
          </p>
        </div>
        <ChevronRight size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
      </Link>
    </motion.div>
  );
};

const BooksPage = () => (
  <Layout>
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold mb-2">📚 Books</h1>
        <p className="text-muted-foreground mb-8">Recommended books for IIT JEE preparation</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CATEGORIES.map((cat) => (
          <CategoryTile key={cat.slug} cat={cat} />
        ))}
      </div>
    </div>
  </Layout>
);

export default BooksPage;
