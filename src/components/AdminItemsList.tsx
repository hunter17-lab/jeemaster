import { motion } from "framer-motion";
import { ExternalLink, Plus } from "lucide-react";
import { useAdminContent, type ContentType } from "@/hooks/useAdminContent";

interface Props {
  type: ContentType;
  subject?: string;
  title?: string;
}

const AdminItemsList = ({ type, subject, title = "📌 Recently Added by Admin" }: Props) => {
  const { items, loading } = useAdminContent(type, subject);
  if (loading || items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 mb-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
          <Plus size={16} className="text-primary-foreground" />
        </div>
        <h3 className="font-display font-semibold">{title}</h3>
      </div>
      <div className="grid gap-2">
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
              <div className="text-xs text-muted-foreground truncate">
                {it.subject}{it.section ? ` · ${it.section}` : ""}
              </div>
            </div>
            <ExternalLink size={14} className="text-muted-foreground group-hover:text-primary" />
          </motion.a>
        ))}
      </div>
    </motion.div>
  );
};

export default AdminItemsList;
