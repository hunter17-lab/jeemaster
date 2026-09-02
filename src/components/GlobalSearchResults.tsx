import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { groupHits, KIND_ICON, type SearchHit } from "@/lib/globalSearch";

const badge = "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide";

export const ResultRow = ({ hit, onNavigate }: { hit: SearchHit; onNavigate?: () => void }) => {
  const { doc } = hit;

  const inner = (
    <>
      <span className="shrink-0 text-lg leading-none">{doc.icon}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{doc.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className={`${badge} border-primary/30 bg-primary/10 text-primary`}>{doc.kind}</span>
          {doc.category && (
            <span className={`${badge} border-border bg-secondary text-muted-foreground`}>{doc.category}</span>
          )}
          {doc.meta && (
            <span className={`${badge} border-border/60 bg-muted text-muted-foreground`}>{doc.meta}</span>
          )}
        </div>
      </div>
      <span className="shrink-0 text-[11px] font-medium text-muted-foreground transition-colors group-hover:text-primary">
        Open
      </span>
      <ArrowUpRight
        size={15}
        className="shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
      />
    </>
  );

  const className =
    "group flex items-center gap-3 rounded-2xl border border-border/60 bg-gradient-to-br from-card/80 via-card/50 to-secondary/30 px-3.5 py-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg";

  if (doc.external) {
    return (
      <a href={doc.url} target="_blank" rel="noopener noreferrer" className={className} onClick={onNavigate}>
        {inner}
      </a>
    );
  }
  return (
    <Link to={doc.url} className={className} onClick={onNavigate}>
      {inner}
    </Link>
  );
};

interface Props {
  hits: SearchHit[];
  grouped?: boolean;
  onNavigate?: () => void;
}

const GlobalSearchResults = ({ hits, grouped = true, onNavigate }: Props) => {
  if (!grouped) {
    return (
      <div className="grid gap-2.5">
        {hits.map((h) => (
          <ResultRow key={h.doc.id} hit={h} onNavigate={onNavigate} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupHits(hits).map((group, gi) => (
        <motion.section
          key={group.kind}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: gi * 0.04 }}
        >
          <h3 className="mb-2 flex items-center gap-2 px-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <span>{KIND_ICON[group.kind]}</span>
            {group.kind}
            <span className="text-[10px] font-medium normal-case tracking-normal">({group.hits.length})</span>
          </h3>
          <div className="grid gap-2.5">
            {group.hits.map((h) => (
              <ResultRow key={h.doc.id} hit={h} onNavigate={onNavigate} />
            ))}
          </div>
        </motion.section>
      ))}
    </div>
  );
};

export default GlobalSearchResults;
