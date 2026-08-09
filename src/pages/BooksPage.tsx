import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BookOpen, ChevronRight, ExternalLink, Search as SearchIcon, X } from "lucide-react";
import Layout from "@/components/Layout";
import { useAdminContent } from "@/hooks/useAdminContent";
import { useAllBooks } from "@/hooks/useAllBooks";
import { searchBooks } from "@/lib/bookSearch";

const CATEGORIES = [
  { slug: "physics",     key: "Physics",     label: "Physics Books",     short: "Physics",      icon: "⚡", accent: "from-blue-500/20 to-cyan-500/10" },
  { slug: "chemistry",   key: "Chemistry",   label: "Chemistry Books",   short: "Chemistry",    icon: "🧪", accent: "from-emerald-500/20 to-teal-500/10" },
  { slug: "mathematics", key: "Mathematics", label: "Maths Books",       short: "Maths",        icon: "📐", accent: "from-violet-500/20 to-fuchsia-500/10" },
  { slug: "pcm",         key: "PCM",         label: "PCM Combined",      short: "PCM Combined", icon: "📚", accent: "from-amber-500/20 to-orange-500/10" },
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

const BooksPage = () => {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [focused, setFocused] = useState(false);
  const { books, loading } = useAllBooks();

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 120);
    return () => clearTimeout(t);
  }, [query]);

  const pool = useMemo(
    () => (filter === "all" ? books : books.filter((b) => b.subjectKey === filter)),
    [books, filter],
  );

  const results = useMemo(() => searchBooks(pool, debounced), [pool, debounced]);
  const searching = debounced.trim().length > 0;
  const hasStrong = results.some((r) => !r.fuzzyOnly);

  return (
    <Layout>
      <div className="page-container">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold mb-2">📚 Books</h1>
          <p className="text-muted-foreground mb-6">Recommended books for IIT JEE preparation</p>
        </motion.div>

        {/* Search bar */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <div
            className={`relative rounded-2xl transition-all duration-300 ${
              focused ? "ring-2 ring-primary/60 shadow-lg shadow-primary/10 scale-[1.005]" : "ring-1 ring-border"
            }`}
          >
            <SearchIcon
              size={18}
              className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focused ? "text-primary" : "text-muted-foreground"}`}
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="🔍 Search books, authors, subjects, etc..."
              aria-label="Search books"
              className="w-full bg-secondary/60 backdrop-blur rounded-2xl pl-12 pr-11 py-3.5 text-sm outline-none placeholder:text-muted-foreground text-foreground [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-muted hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2 px-1">
            {focused && !query
              ? "Try searching for: Physics, Awasthi, Black Book, Maths..."
              : "Search by book name, author, subject, or keyword 📚"}
          </p>
        </motion.div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[{ key: "all", short: "All" }, ...CATEGORIES].map((c) => {
            const active = filter === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setFilter(c.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  active
                    ? "gradient-primary text-primary-foreground border-transparent shadow-md shadow-primary/20"
                    : "bg-secondary/60 border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                }`}
              >
                {c.short}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {searching ? (
            <motion.div key="results" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="mb-4">
                <h2 className="text-lg font-display font-semibold">
                  🔍 Search Results for "{debounced.trim()}"
                </h2>
                <p className="text-xs text-muted-foreground">
                  {loading ? "Loading books…" : `${results.length} ${results.length === 1 ? "book" : "books"} found`}
                </p>
              </div>

              {!loading && results.length === 0 && (
                <div className="glass-card p-8 text-center text-sm text-muted-foreground">
                  <BookOpen size={30} className="mx-auto mb-2 opacity-50" />
                  No exact match found. Try a different keyword or category.
                </div>
              )}

              {!loading && results.length > 0 && !hasStrong && (
                <div className="mb-3">
                  <p className="text-sm font-medium">No exact match found.</p>
                  <p className="text-xs text-muted-foreground">Most relevant books</p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {results.map(({ book }, i) => (
                  <motion.div
                    key={book.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.3) }}
                    className="glass-card p-5 flex flex-col gap-3 hover:scale-[1.01] transition-transform"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                        <BookOpen size={18} className="text-primary-foreground" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold leading-snug line-clamp-3">{book.title}</h3>
                        {book.author && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">by {book.author}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-medium">
                        {CATEGORIES.find((c) => c.key === book.subjectKey)?.short || book.subject}
                      </span>
                      {book.edition && (
                        <span className="px-2 py-0.5 rounded-full bg-secondary text-[11px] text-muted-foreground">
                          {book.edition}
                        </span>
                      )}
                    </div>

                    <a
                      href={book.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto inline-flex items-center justify-center gap-2 w-full py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition"
                    >
                      Open Book <ExternalLink size={14} />
                    </a>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="categories"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {CATEGORIES.filter((c) => filter === "all" || filter === c.key).map((cat) => (
                <CategoryTile key={cat.slug} cat={cat} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default BooksPage;
