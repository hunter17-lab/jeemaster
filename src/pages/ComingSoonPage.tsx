import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";
import Layout from "@/components/Layout";
import useSEO from "@/hooks/useSEO";

interface ComingSoonPageProps {
  title: string;
  description?: string;
}

const ComingSoonPage = ({ title, description }: ComingSoonPageProps) => {
  useSEO({
    title: `${title} — JEE MASTER`,
    description: description || `${title} page for JEE MASTER. Currently under development.`,
  });

  return (
    <Layout>
      <div className="page-container py-24 max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="glass-card p-10 md:p-14"
        >
          <motion.span
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="inline-flex w-16 h-16 rounded-2xl gradient-primary text-primary-foreground items-center justify-center shadow-lg shadow-primary/30 mb-6"
          >
            <Clock size={28} />
          </motion.span>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-3">{title}</p>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">Coming Soon</h1>
          <p className="text-muted-foreground leading-relaxed mb-8">
            This page is currently under development. It will be available soon.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary text-foreground font-semibold text-sm border border-border hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft size={16} /> Return Home
          </Link>
        </motion.div>
      </div>
    </Layout>
  );
};

export default ComingSoonPage;
