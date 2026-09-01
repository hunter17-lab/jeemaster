import { motion } from "framer-motion";
import { Target, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import useSEO from "@/hooks/useSEO";

const MockHubPage = () => {
  useSEO({
    title: "Mock Hub — JEE MASTER",
    description: "Your dedicated JEE test and mock-practice hub. Coming soon with full-length mocks, subject tests, and analytics.",
  });

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden gradient-mesh">
        <div className="absolute inset-0 gradient-primary opacity-[0.05]" />
        <motion.div
          animate={{ x: [0, 25, 0], y: [0, -15, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-16 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-10 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
        />
        <div className="page-container relative py-20 md:py-28 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-primary/10 text-primary px-5 py-2 rounded-full text-sm font-semibold mb-8 border border-primary/20"
            >
              <Target size={16} className="animate-pulse" /> Mock Tests & Practice
            </motion.div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 tracking-tight leading-tight">
              🎯 <span className="text-gradient">Mock Hub</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Your dedicated JEE test and mock-practice hub. Full-length mocks, subject tests, and detailed analytics — all coming soon.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl gradient-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
              >
                Back Home <ArrowRight size={18} />
              </Link>
              <Link
                to="/notes"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-secondary text-foreground font-semibold text-base hover:bg-secondary/80 transition-colors border border-border"
              >
                Start Studying
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Intentionally empty section reserved for future mock test features */}
      <section className="page-container py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="glass-card p-10 md:p-16 text-center max-w-3xl mx-auto"
        >
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/25">
            <Target size={32} className="text-primary-foreground" />
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">Coming Soon</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Mock Hub is under construction. Soon you&apos;ll be able to attempt timed JEE mocks, track your progress, and analyze your performance.
          </p>
        </motion.div>
      </section>
    </Layout>
  );
};

export default MockHubPage;
