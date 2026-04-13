import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FileText, Brain, Target, Library, GraduationCap, Zap, BookOpen } from "lucide-react";
import Layout from "@/components/Layout";
import StartPopup from "@/components/StartPopup";

const sections = [
  { path: "/notes", label: "Notes", desc: "Long, Short & Topper Notes", icon: FileText, gradient: "gradient-primary" },
  { path: "/mindmaps", label: "Mind Maps", desc: "Visual chapter summaries", icon: Brain, gradient: "gradient-physics" },
  { path: "/dpp", label: "DPP", desc: "Daily Practice Problems", icon: Zap, gradient: "gradient-chemistry" },
  { path: "/pyq", label: "PYQ", desc: "Previous Year Questions", icon: Target, gradient: "gradient-maths" },
  { path: "/books", label: "Books", desc: "Recommended study material", icon: Library, gradient: "gradient-primary" },
  { path: "/coaching", label: "Coaching Material", desc: "Allen, PW & more", icon: GraduationCap, gradient: "gradient-physics" },
];

const stats = [
  { value: "200+", label: "Chapters Covered" },
  { value: "25+", label: "Years of PYQs" },
  { value: "1000+", label: "Practice Problems" },
  { value: "100%", label: "Free Forever" },
];

const Index = () => (
  <Layout>
    <StartPopup />

    {/* Hero */}
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 gradient-primary opacity-5" />
      <div className="page-container relative py-16 md:py-24 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <BookOpen size={16} /> Your Complete JEE Preparation Hub
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-4 tracking-tight">
            JEE <span className="text-gradient">MASTER</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Everything you need to crack IIT JEE — Notes, Mind Maps, DPP, PYQs, Books & Coaching Material. All free, all in one place.
          </p>
        </motion.div>
      </div>
    </section>

    {/* Sections Grid — ABOVE stats */}
    <section className="page-container pb-10">
      <h2 className="text-2xl font-display font-bold mb-8 text-center">Explore Resources</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((sec, i) => (
          <motion.div
            key={sec.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link to={sec.path} className="section-card flex flex-col items-start gap-4 h-full">
              <div className={`w-12 h-12 rounded-xl ${sec.gradient} flex items-center justify-center`}>
                <sec.icon size={24} className="text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg mb-1">{sec.label}</h3>
                <p className="text-sm text-muted-foreground">{sec.desc}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>

    {/* Stats — BELOW resources */}
    <section className="page-container pb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
      >
        {stats.map((s, i) => (
          <div key={i} className="glass-card p-4 text-center">
            <div className="text-2xl font-display font-bold text-primary">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </motion.div>
    </section>
  </Layout>
);

export default Index;
