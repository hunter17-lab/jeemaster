import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Search as SearchIcon, X, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import GlobalSearchResults from "@/components/GlobalSearchResults";
import { useSearchIndex } from "@/hooks/useSearchIndex";
import { searchIndex } from "@/lib/globalSearch";

const EXAMPLES = ["Complex Numbers", "N Awasthi", "Allen", "2024 PYQ", "Kinematics"];
const PREVIEW_LIMIT = 8;

interface Props {
  open: boolean;
  onClose: () => void;
}

const GlobalSearchOverlay = ({ open, onClose }: Props) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const { index, loading } = useSearchIndex();

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 110);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
    document.body.style.overflow = "";
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const hits = useMemo(
    () => (debounced.trim() ? searchIndex(index, debounced, 120) : []),
    [index, debounced],
  );

  const searching = debounced.trim().length > 0;
  const preview = hits.slice(0, PREVIEW_LIMIT);

  const goAll = () => {
    const q = query.trim();
    onClose();
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) goAll();
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center p-3 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, y: -14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="relative mt-8 w-full max-w-2xl overflow-hidden rounded-3xl border border-border/60 bg-card/95 shadow-2xl shadow-primary/10 backdrop-blur-xl sm:mt-14"
          >
            <form onSubmit={onSubmit} className="relative border-b border-border/60">
              <SearchIcon size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="🔍 Search anything — books, notes, PYQs, DPPs, chapters..."
                aria-label="Search the whole app"
                className="w-full bg-transparent py-4 pl-13 pr-24 text-sm outline-none placeholder:text-muted-foreground sm:text-base [&::-webkit-search-cancel-button]:hidden"
                style={{ paddingLeft: "3.25rem" }}
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
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close search"
                  className="rounded-lg px-2 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
                >
                  ESC
                </button>
              </div>
            </form>

            <div className="max-h-[70vh] overflow-y-auto p-4 sm:p-5">
              {!searching ? (
                <div>
                  <p className="mb-3 px-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">Try</p>
                  <div className="flex flex-wrap gap-2">
                    {EXAMPLES.map((ex) => (
                      <button
                        key={ex}
                        onClick={() => setQuery(ex)}
                        className="rounded-full border border-border/60 bg-secondary/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                  <p className="mt-4 px-1 text-xs text-muted-foreground">
                    Searches every section — Notes, Mind Maps, DPP, PYQ, Books, Coaching Material & Mock Hub.
                  </p>
                </div>
              ) : preview.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm font-semibold">No results found for "{debounced.trim()}"</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Try searching for a chapter, book, topic, author, coaching or exam year.
                  </p>
                </div>
              ) : (
                <>
                  <GlobalSearchResults hits={preview} onNavigate={onClose} />
                  {hits.length > preview.length && (
                    <button
                      onClick={goAll}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary/20"
                    >
                      View all {hits.length} results <ArrowRight size={15} />
                    </button>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default GlobalSearchOverlay;
