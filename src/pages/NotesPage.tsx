import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles, Trophy, Search as SearchIcon, X, ArrowRight, Zap, FlaskConical, Sigma } from "lucide-react";
import Layout from "@/components/Layout";
import SubjectChapterList from "@/components/SubjectChapterList";
import AdminItemsList from "@/components/AdminItemsList";
import { allSubjects } from "@/data/chapters";
import { chemistryShortNotes, physicsShortNotes, mathsShortNotes } from "@/data/shortNotes";
import { searchBooks, type SearchableBook } from "@/lib/bookSearch";

const noteTypes = ["Short Notes", "Topper Notes"] as const;

const subjectEmojis = ["⚡ Physics", "🧪 Chemistry", "📐 Mathematics"];

const subjectMeta = {
  Physics: { icon: Zap, text: "text-physics", bg: "bg-physics/10" },
  Chemistry: { icon: FlaskConical, text: "text-chemistry", bg: "bg-chemistry/10" },
  Mathematics: { icon: Sigma, text: "text-maths", bg: "bg-maths/10" },
} as const;

interface NoteHit extends SearchableBook {
  className: string;
}

/** Flatten every short-note chapter across all subjects for global search. */
const allNotes: NoteHit[] = [physicsShortNotes, chemistryShortNotes, mathsShortNotes].flatMap((s) =>
  s.sections.flatMap((sec) =>
    sec.chapters.map((ch) => ({
      id: `${s.subject}-${sec.title}-${ch.name}`,
      title: ch.name,
      author: s.subject,
      edition: sec.title,
      subject: `${s.subject} ${sec.title}`,
      link: ch.link,
      className: sec.title,
    })),
  ),
);

const NotesPage = () => {
  const [activeType, setActiveType] = useState<string>(noteTypes[0]);
  const [activeSubject, setActiveSubject] = useState(0);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 120);
    return () => clearTimeout(t);
  }, [query]);

  const results = useMemo(() => searchBooks(allNotes, debounced), [debounced]);
  const searching = debounced.trim().length > 0;


  return (
    <Layout>
      <div className="page-container">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold mb-2">📘 Notes</h1>
          <p className="text-muted-foreground mb-6">Chapter-wise notes for Physics, Chemistry & Maths</p>
        </motion.div>

        {/* Global notes search */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
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
              placeholder="🔍 Search all notes — chapters, subjects, class..."
              aria-label="Search all notes"
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
              ? "Try: complex numbers, kinematics, organic, class 12..."
              : "Searches across Physics, Chemistry & Mathematics notes 📘"}
          </p>
        </motion.div>

        {/* Note type tabs */}
        {!searching && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {noteTypes.map((t) => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeType === t ? "gradient-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {t === "Short Notes" ? "📋 " : "🏆 "}{t}
            </button>
          ))}
        </div>
        )}

        {searching ? (
          <div>
            <h2 className="font-display font-bold text-lg mb-3">
              🔍 Search Results for "{debounced.trim()}"
              <span className="ml-2 text-xs font-normal text-muted-foreground">{results.length} found</span>
            </h2>
            {results.length === 0 ? (
              <div className="glass-card p-8 text-center text-sm text-muted-foreground">
                No notes matched your search. Try a shorter or different keyword.
              </div>
            ) : (
              <div className="grid gap-2.5">
                {results.map(({ book }) => {
                  const meta = subjectMeta[(book.author || "Physics") as keyof typeof subjectMeta] ?? subjectMeta.Physics;
                  const Icon = meta.icon;
                  return (
                    <a
                      key={book.id}
                      href={book.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-gradient-to-br from-card/80 via-card/50 to-secondary/30 px-3.5 py-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg"
                    >
                      <span className={`shrink-0 rounded-xl ${meta.bg} ${meta.text} p-2`}>
                        <Icon size={16} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold break-words">{book.title}</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {book.author} • {book.edition}
                        </p>
                      </div>
                      <span className="subject-badge bg-primary/15 text-primary shrink-0 hidden sm:inline">SHORT NOTES</span>
                      <ArrowRight size={16} className="shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        ) : activeType === "Topper Notes" ? (
          <motion.div

            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden glass-card p-10 md:p-16 text-center"
          >
            {/* Glow blobs */}
            <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-primary/30 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-accent/30 blur-3xl pointer-events-none" />

            <div className="relative flex flex-col items-center gap-5">
              <motion.div
                animate={{ rotate: [0, 8, -8, 0], y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/30"
              >
                <Trophy size={40} className="text-primary-foreground" />
              </motion.div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium uppercase tracking-widest">
                <Sparkles size={14} />
                In the works
              </div>

              <h2 className="font-display font-extrabold text-4xl md:text-6xl bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
                Coming Soon
              </h2>

              <p className="max-w-md text-muted-foreground text-sm md:text-base">
                Topper Notes are being curated from AIR holders and toppers. Stay tuned — something legendary is on the way.
              </p>

              {/* Animated dots */}
              <div className="flex items-center gap-2 mt-2">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-2.5 h-2.5 rounded-full bg-primary"
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Subject tabs */}
            <div className="flex gap-2 mb-8 flex-wrap">
              {allSubjects.map((s, i) => (
                <button
                  key={s.subject}
                  onClick={() => setActiveSubject(i)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeSubject === i ? "bg-primary/10 text-primary border border-primary/30" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {subjectEmojis[i]}
                </button>
              ))}
            </div>

            <AdminItemsList type="notes" subject={allSubjects[activeSubject].subject} />

            <div className="glass-card p-6">
              <SubjectChapterList
                data={
                  allSubjects[activeSubject].subject === "Chemistry"
                    ? chemistryShortNotes
                    : allSubjects[activeSubject].subject === "Physics"
                    ? physicsShortNotes
                    : allSubjects[activeSubject].subject === "Mathematics"
                    ? mathsShortNotes
                    : allSubjects[activeSubject]
                }
                sectionLabel={activeType}
              />
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default NotesPage;
