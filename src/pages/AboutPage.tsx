import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

const AboutPage = () => (
  <Layout>
    <div className="page-container py-12 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <h1 className="text-3xl font-display font-bold text-center">About Us</h1>

        <div className="glass-card p-6 md:p-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
          <p className="text-base text-foreground font-semibold">
            📚 JEE Master Hub – Free Learning for Every Aspirant
          </p>
          <p>
            JEE Master Hub is built with a simple mission — to provide free and quality education to every IIT JEE aspirant. 🚀
          </p>
          <p>
            In this app, you will find all essential study resources in one place, including Notes, DPPs, PYQs, Books, Mind Maps, and Coaching Materials — all organized in a structured and easy-to-use format.
          </p>

          <div>
            <h2 className="text-lg font-display font-bold text-foreground mb-3">✨ Why this app?</h2>
            <ul className="space-y-2 list-none">
              <li>✅ 100% free study resources</li>
              <li>✅ Well-organized chapter-wise content</li>
              <li>✅ Designed for Class 11 & 12 (PCM)</li>
              <li>✅ Saves time by bringing everything in one place</li>
            </ul>
          </div>

          <div className="border-t border-border/50 pt-4">
            <p className="text-xs">
              ⚠️ <strong>Disclaimer:</strong> We do not own any of the external resources provided in this app. All materials belong to their respective owners and are shared only for educational purposes.
            </p>
          </div>

          <p>
            ❤️ This app is made with dedication by <strong className="text-foreground">Team Phoenix</strong> to support students and promote free education for all.
          </p>

          <div className="pt-2">
            <a
              href="https://t.me/+QEURlTuGeKA3ZTc1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 gradient-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              <ExternalLink size={16} />
              📢 Join our Telegram for updates & materials
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  </Layout>
);

export default AboutPage;
