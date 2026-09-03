import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search as SearchIcon, X, Loader2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import GlobalSearchResults from "@/components/GlobalSearchResults";
import { useSearchIndex } from "@/hooks/useSearchIndex";
import { searchIndex } from "@/lib/globalSearch";
import useSEO from "@/hooks/useSEO";

const EXAMPLES = ["Complex Numbers", "N Awasthi", "Allen", "2024 PYQ", "Kinematics"];

const SearchPage = () => {
  const [params, setParams] = useSearchParams();
  const initial = params.get("q") ?? "";
  const [query, setQuery] = useState(initial);
  const [debounced, setDebounced] = useState(initial);
  const [focused, setFocused] = useState(false);
  const { index, loading } = useSearchIndex();

  useSEO({
    title: "Search JEE Notes, Books, PYQs & DPPs | JEE Master",
    description:
      "Search every JEE Master resource at once — notes, mind maps, DPPs, previous year papers, books and coaching material.",
  });

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 120);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const q = debounced.trim();
    setParams(q ? { q } : {}, { replace: true });
  }, [debounced, setParams]);

  const hits = useMemo(
    () => (debounced.trim() ? searchIndex(index, debounced, 400) : []),
    [index, debounced],
  );
  const searching = debounced.trim().length > 0;

  return (
    <Layout>
      <div className="page-container">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-2 font-display text-3xl font-bold">🔍 Global Search</h1>
          <p className="mb-6 text-muted-foreground">
            One search across Notes, Mind Maps, DPP, PYQ, Books, Coaching Material & Mock Hub
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div
            className={`relative rounded-2xl transition-all duration-300 ${
              focused ? "scale-[1.005] ring-2 ring-primary/60 shadow-lg shadow-primary/10" : "ring-1 ring-border"
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
              placeholder="🔍 Search anything — books, notes, PYQs, DPPs, chapters..."
              aria-label="Search all resources"
              autoFocus
              className="w-full rounded-2xl bg-secondary/60 py-3.5 pl-12 pr-12 text-sm text-foreground outline-none backdrop-blur placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
            />
            <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
              {loading && <Loader2 size={15} className="animate-spin text-muted-foreground" />}
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="rounded-full bg-muted p-1.5 text-muted-foreground transition-colors hover:bg-primary/20 hover:text-primary"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Try:</span>
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => setQuery(ex)}
                className="rounded-full border border-border/60 bg-secondary/60 px-3 py-1 text-xs font-medium text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary"
              >
                {ex}
              </button>
            ))}
          </div>
        </motion.div>

        {searching ? (
          hits.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <p className="text-sm font-semibold">No results found for "{debounced.trim()}"</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Try searching for a chapter, book, topic, author, coaching or exam year.
              </p>
            </div>
          ) : (
            <>
              <p className="mb-4 px-1 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{hits.length}</span> results for "{debounced.trim()}"
              </p>
              <GlobalSearchResults hits={hits} />
            </>
          )
        ) : (
          <div className="glass-card p-10 text-center text-sm text-muted-foreground">
            Start typing to search every resource in JEE Master.
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SearchPage;
