import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ExternalLink, BookOpen } from "lucide-react";
import Layout from "@/components/Layout";
import { useAdminContent } from "@/hooks/useAdminContent";

const CATEGORIES = [
  { key: "Physics", label: "Physics Books", icon: "⚡", accent: "from-blue-500/20 to-cyan-500/10" },
  { key: "Chemistry", label: "Chemistry Books", icon: "🧪", accent: "from-emerald-500/20 to-teal-500/10" },
  { key: "Mathematics", label: "Maths Books", icon: "📐", accent: "from-violet-500/20 to-fuchsia-500/10" },
  { key: "PCM", label: "PCM Combined", icon: "📚", accent: "from-amber-500/20 to-orange-500/10" },
] as const;

const CategoryCard = ({ cat, openKey, setOpenKey }: any) => {
  const { items, loading } = useAdminContent("books", cat.key);
  const isOpen = openKey === cat.key;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden"
    >
      <button
        onClick={() => setOpenKey(isOpen ? null : cat.key)}
        className={`w-full flex items-center gap-4 p-5 text-left bg-gradient-to-r ${cat.accent} hover:opacity-90 transition`}
      >
        <span className="text-3xl">{cat.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-lg">{cat.label}</h3>
          <p className="text-xs text-muted-foreground">
            {loading ? "Loading…" : `${items.length} ${items.length === 1 ? "book" : "books"} available`}
          </p>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={20} className="text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-2 border-t border-border/40">
              {items.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  <BookOpen size={28} className="mx-auto mb-2 opacity-50" />
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const BooksPage = () => {
  const [openKey, setOpenKey] = useState<string | null>("Physics");

  return (
    <Layout>
      <div className="page-container">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold mb-2">📚 Books</h1>
          <p className="text-muted-foreground mb-8">Recommended books for IIT JEE preparation</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4">
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat.key} cat={cat} openKey={openKey} setOpenKey={setOpenKey} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default BooksPage;
