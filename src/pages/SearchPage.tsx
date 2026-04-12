import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search as SearchIcon, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { allSubjects } from "@/data/chapters";

const SearchPage = () => {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    const matches: { subject: string; section: string; chapter: string; link: string }[] = [];
    allSubjects.forEach((subj) => {
      subj.sections.forEach((sec) => {
        sec.chapters.forEach((ch) => {
          if (ch.name.toLowerCase().includes(q)) {
            matches.push({ subject: subj.subject, section: sec.title, chapter: ch.name, link: ch.link });
          }
        });
      });
    });
    return matches;
  }, [query]);

  return (
    <Layout>
      <div className="page-container">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold mb-6">🔍 Search</h1>
        </motion.div>

        <div className="relative mb-8">
          <SearchIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search chapters, topics..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-foreground placeholder:text-muted-foreground transition-colors"
            autoFocus
          />
        </div>

        {results.length > 0 && (
          <div className="glass-card p-4 space-y-1">
            {results.map((r, i) => (
              <a key={i} href={r.link} className="chapter-item">
                <div>
                  <span className="text-sm font-medium">{r.chapter}</span>
                  <span className="text-xs text-muted-foreground ml-2">{r.subject} · {r.section}</span>
                </div>
                <ChevronRight size={14} className="text-muted-foreground" />
              </a>
            ))}
          </div>
        )}

        {query.length >= 2 && results.length === 0 && (
          <p className="text-center text-muted-foreground">No results found for "{query}"</p>
        )}
      </div>
    </Layout>
  );
};

export default SearchPage;
