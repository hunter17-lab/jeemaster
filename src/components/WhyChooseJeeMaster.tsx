import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BookOpen, Target, Zap, RefreshCw, ArrowRight, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  {
    icon: BookOpen,
    title: "Curated Study Resources",
    desc: "Access high-quality Notes, PYQs, Formula Sheets, NCERT Resources and important study material organized chapter-wise for faster learning.",
  },
  {
    icon: Target,
    title: "Practice with Purpose",
    desc: "Solve topic-wise questions, previous year papers and mock tests designed around the latest JEE pattern.",
  },
  {
    icon: Zap,
    title: "Fast & Distraction-Free",
    desc: "Quick navigation, clean interface and organized content help students spend more time learning instead of searching.",
  },
  {
    icon: RefreshCw,
    title: "Always Improving",
    desc: "New resources, tests and learning material are added regularly so your preparation stays up-to-date.",
  },
];

const WhyChooseJeeMaster = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleStart = () => {
    if (user) {
      navigate("/notes");
      return;
    }
    document.getElementById("resources")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[120px]">
        {/* Heading */}
        <div className="relative text-center">
          <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/3 w-[520px] h-[320px] max-w-full bg-primary/15 rounded-full blur-3xl" />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="relative"
          >
            <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-5 py-2 rounded-full text-xs font-semibold tracking-[0.18em] uppercase mb-6 border border-primary/20">
              Why JEE Master
            </span>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4 tracking-tight">
              Built for Serious <span className="text-gradient">JEE Aspirants</span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Everything you need for JEE preparation in one clean platform—organized resources,
              focused practice, regular updates, and a distraction-free experience.
            </p>
          </motion.div>
        </div>

        {/* Cards */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.35, delay: i * 0.1, ease: "easeOut" }}
            >
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="group h-full bg-card/80 backdrop-blur-xl border border-border/40 rounded-xl shadow-lg p-6 transition-all duration-[350ms] hover:border-primary/40 hover:shadow-[0_18px_40px_-12px_hsl(var(--primary)/0.45)]"
              >
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center shadow-md shadow-primary/25 mb-5"
                >
                  <f.icon size={24} className="text-primary-foreground" />
                </motion.div>
                <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="mt-16 text-center"
        >
          <h3 className="text-2xl md:text-3xl font-display font-bold mb-6">Ready to Master JEE?</h3>
          <button
            onClick={handleStart}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl gradient-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
          >
            Start Learning <ArrowRight size={18} />
          </button>
          <div className="mt-5">
            <a
              href="https://t.me/+_-F7r5UIv6Q3YzA9"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary text-foreground font-semibold text-sm md:text-base border border-border hover:border-primary/40 hover:bg-secondary/80 transition-all duration-[350ms]"
            >
              <Send size={17} className="text-primary" /> Join our official TG channel
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseJeeMaster;
