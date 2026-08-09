import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BookOpen, ArrowRight, Search as SearchIcon, X } from "lucide-react";
import Layout from "@/components/Layout";
import BookCard from "@/components/BookCard";
import { useAllBooks } from "@/hooks/useAllBooks";
import { searchBooks } from "@/lib/bookSearch";

const CATEGORIES = [
  { slug: "physics",     key: "Physics",     label: "Physics Books",   short: "Physics",      subtitle: "Physics study resources",   icon: "⚡", accent: "from-blue-500/25 via-cyan-500/10 to-transparent" },
  { slug: "chemistry",   key: "Chemistry",   label: "Chemistry Books", short: "Chemistry",    subtitle: "Chemistry study resources", icon: "🧪", accent: "from-emerald-500/25 via-teal-500/10 to-transparent" },
  { slug: "mathematics", key: "Mathematics", label: "Maths Books",     short: "Maths",        subtitle: "Mathematics study resources", icon: "📐", accent: "from-violet-500/25 via-fuchsia-500/10 to-transparent" },
  { slug: "pcm",         key: "PCM",         label: "PCM Combined",    short: "PCM Combined", subtitle: "Complete PCM resources",    icon: "📚", accent: "from-amber-500/25 via-orange-500/10 to-transparent" },
] as const;

const CategoryCard = ({
  cat,
  count,
  loading,
  index,
}: {
  cat: typeof CATEGORIES[number];
  count: number;
  loading: boolean;
  index: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.06 }}
  >
    <Link
      to={`/books/${cat.slug}`}
      className={`group relative flex h-full items-center gap-5 overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br ${cat.accent} p-6 sm:p-8 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.01] hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/15 active:scale-[0.99]`}
    >
      <div className="absolute inset-0 bg-card/60 -z-10" />
      <span className="text-4xl sm:text-5xl drop-shadow transition-transform duration-300 group-hover:scale-110">
        {cat.icon}
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="font-display text-xl sm:text-2xl font-bold leading-tight">{cat.label}</h2>
        <p className="mt-1 text-sm font-semibold text-primary">
          {loading ? "Loading…" : `${count} ${count === 1 ? "Book" : "Books"} Available`}
        </p>
        <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">{cat.subtitle}</p>
      </div>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background/50 text-muted-foreground transition-all duration-300 group-hover:border-primary/50 group-hover:bg-primary/15 group-hover:text-primary">
        <ArrowRight size={20} className="transition-transform duration-300 group-hover:translate-x-0.5" />
      </span>
    </Link>
  </motion.div>
);

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

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    books.forEach((b) => { map[b.subjectKey] = (map[b.subjectKey] || 0) + 1; });
    return map;
  }, [books]);

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
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-6 overflow-hidden rounded-3xl border border-border/60 gradient-mesh p-6 sm:p-8"
        >
          <h1 className="font-display text-3xl sm:text-4xl font-bold">📚 JEE Book Library</h1>
          <p className="mt-2 max-w-2xl text-sm sm:text-base text-muted-foreground">
            Explore carefully organized books and study resources for IIT JEE preparation.
          </p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-primary">
            Physics • Chemistry • Mathematics • PCM Combined
          </p>
        </motion.section>

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
                  <BookCard
                    key={book.id}
                    index={i}
                    book={{
                      id: book.id,
                      title: book.title,
                      author: book.author,
                      edition: book.edition,
                      link: book.link,
                      resource_type: (book as any).resource_type,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="categories"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              {CATEGORIES.filter((c) => filter === "all" || filter === c.key).map((cat, i) => (
                <CategoryCard key={cat.slug} cat={cat} count={counts[cat.key] || 0} loading={loading} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default BooksPage;
