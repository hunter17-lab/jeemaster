import { BookOpen, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { resolveResourceType, resourceTypeStyles } from "@/lib/resourceType";

export interface BookCardData {
  id: string;
  title: string;
  author?: string | null;
  edition?: string | null;
  link: string;
  resource_type?: string | null;
}

interface Props {
  book: BookCardData;
  index?: number;
}

const BookCard = ({ book, index = 0 }: Props) => {
  const tag = resolveResourceType({
    resource_type: book.resource_type,
    title: book.title,
    section: book.author,
    description: book.edition,
  });

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.35) }}
      className="group relative flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/70 p-5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl gradient-primary shadow-md shadow-primary/20">
          <BookOpen size={19} className="text-primary-foreground" />
        </div>
        <div className="min-w-0">
          <h3 className="line-clamp-3 text-sm font-semibold leading-snug">{book.title}</h3>
          {book.author && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">by {book.author}</p>
          )}
        </div>
      </div>

      {(tag || book.edition) && (
        <div className="flex flex-wrap gap-1.5">
          {tag && (
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${resourceTypeStyles[tag]}`}
            >
              {tag}
            </span>
          )}
          {book.edition && (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
              {book.edition}
            </span>
          )}
        </div>
      )}

      <a
        href={book.link}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl gradient-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:opacity-90 hover:shadow-lg hover:shadow-primary/25"
      >
        Open Book <ExternalLink size={14} />
      </a>
    </motion.article>
  );
};

export default BookCard;
