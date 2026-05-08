import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import Layout from "@/components/Layout";
import AdminItemsList from "@/components/AdminItemsList";
import { coachingMaterials } from "@/data/chapters";

const CoachingPage = () => (
  <Layout>
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold mb-2">🏫 Coaching Material</h1>
        <p className="text-muted-foreground mb-8">Modules, DPPs & Tests from top coaching institutes</p>
      </motion.div>

      <AdminItemsList type="coaching" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {coachingMaterials.map((coaching, i) => (
          <motion.div
            key={coaching.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6"
          >
            <h3 className="font-display font-bold text-xl mb-4">{coaching.name}</h3>
            <div className="space-y-3">
              {coaching.items.map((item) => (
                <a
                  key={item.type}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="chapter-item"
                >
                  <span className="text-sm font-medium">{item.type}</span>
                  <ExternalLink size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">📱 Opens in Telegram</p>
          </motion.div>
        ))}
      </div>
    </div>
  </Layout>
);

export default CoachingPage;
