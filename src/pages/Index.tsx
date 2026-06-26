import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FileText, Brain, Target, Library, GraduationCap, Zap, BookOpen, ArrowRight, Sparkles, LayoutGrid } from "lucide-react";
import Layout from "@/components/Layout";
import StartPopup from "@/components/StartPopup";
import ProfileReminderPopup from "@/components/ProfileReminderPopup";
import PinnedResources from "@/components/PinnedResources";
import useSEO from "@/hooks/useSEO";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { resolveMediaUrl } from "@/lib/giveawayMedia";

const sections = [
  { path: "/hub", label: "✨ JEE Hub", desc: "AI tutor, mocks, infinity bank & more", icon: Sparkles, gradient: "gradient-primary", emoji: "✨" },
  { path: "/notes", label: "📝 Notes", desc: "Long, Short & Topper Notes", icon: FileText, gradient: "gradient-primary", emoji: "📝" },
  { path: "/mindmaps", label: "🧠 Mind Maps", desc: "Visual chapter summaries", icon: Brain, gradient: "gradient-physics", emoji: "🧠" },
  { path: "/dpp", label: "⚡ DPP", desc: "Daily Practice Problems", icon: Zap, gradient: "gradient-chemistry", emoji: "⚡" },
  { path: "/pyq", label: "🎯 PYQ", desc: "Previous Year Questions", icon: Target, gradient: "gradient-maths", emoji: "🎯" },
  { path: "/books", label: "📚 Books", desc: "Recommended study material", icon: Library, gradient: "gradient-primary", emoji: "📚" },
  { path: "/coaching", label: "🏫 Coaching Material", desc: "Allen, PW & more", icon: GraduationCap, gradient: "gradient-physics", emoji: "🏫" },
];

const stats = [
  { value: "200+", label: "Chapters Covered", emoji: "📖" },
  { value: "25+", label: "Years of PYQs", emoji: "📅" },
  { value: "1000+", label: "Practice Problems", emoji: "✏️" },
  { value: "100%", label: "Free Forever", emoji: "💯" },
];

const Index = () => {
  useSEO({
    title: "JEE MASTER — Free IIT JEE Notes, Mind Maps, DPP, PYQs & Books",
    description: "Free IIT JEE preparation hub: chapter-wise short notes, mind maps, DPPs, 25+ years PYQs, books and Allen/PW coaching material for Class 11, 12 & droppers.",
  });
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ display_name: string | null; avatar_url: string | null } | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setProfile(null); setAvatarUrl(null); return; }
    supabase.from("profiles").select("display_name, avatar_url").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => {
        setProfile(data ?? null);
        resolveMediaUrl(data?.avatar_url).then(setAvatarUrl);
      });
  }, [user]);

  const firstName = (profile?.display_name || user?.email?.split("@")[0] || "").split(" ")[0];
  const initials = (profile?.display_name || user?.email || "U")
    .split(/[\s@]/).filter(Boolean).map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
  <Layout>
    <StartPopup />
    <ProfileReminderPopup />

    {/* Hero */}
    <section className="relative overflow-hidden gradient-mesh">
      <div className="absolute inset-0 gradient-primary opacity-[0.05]" />
      <motion.div animate={{ x: [0, 30, 0], y: [0, -20, 0] }} transition={{ duration: 12, repeat: Infinity }} className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
      <motion.div animate={{ x: [0, -25, 0], y: [0, 25, 0] }} transition={{ duration: 14, repeat: Infinity }} className="absolute bottom-10 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      <div className="page-container relative py-20 md:py-28 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-primary/10 text-primary px-5 py-2 rounded-full text-sm font-semibold mb-8 border border-primary/20"
          >
            <Sparkles size={16} className="animate-pulse" /> Your Complete JEE Preparation Hub
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 tracking-tight leading-tight">
            Crack IIT JEE with{" "}
            <span className="text-gradient">JEE MASTER</span> 🚀
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Everything you need — Notes, Mind Maps, DPP, PYQs, Books & Coaching Material. 
            <span className="text-foreground font-medium"> All free, all in one place.</span>
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/notes"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl gradient-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
            >
              Start Learning <ArrowRight size={18} />
            </Link>
            <Link
              to="/pyq"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-secondary text-foreground font-semibold text-base hover:bg-secondary/80 transition-colors border border-border"
            >
              🎯 Solve PYQs
            </Link>
          </div>
        </motion.div>
      </div>
    </section>

    <PinnedResources />

    {/* Sections Grid */}
    <section className="page-container pb-6">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl md:text-3xl font-display font-bold mb-2 text-center"
      >
        📂 Explore Resources
      </motion.h2>
      <p className="text-muted-foreground text-center mb-10">Pick a section and start your preparation</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {sections.map((sec, i) => (
          <motion.div
            key={sec.path}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link
              to={sec.path}
              className="group section-card flex items-center gap-4 h-full hover-lift"
            >
              <motion.div whileHover={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 0.5 }} className={`w-14 h-14 rounded-2xl ${sec.gradient} flex items-center justify-center shrink-0 shadow-md`}>
                <sec.icon size={26} className="text-primary-foreground" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-semibold text-lg mb-0.5">{sec.label}</h3>
                <p className="text-sm text-muted-foreground">{sec.desc}</p>
              </div>
              <ArrowRight size={18} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </Link>
          </motion.div>
        ))}
      </div>
    </section>

    {/* Stats */}
    <section className="page-container pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
      >
        {stats.map((s, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            className="glass-card p-5 text-center group cursor-default"
          >
            <div className="text-2xl mb-1">{s.emoji}</div>
            <div className="text-2xl md:text-3xl font-display font-bold text-primary">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  </Layout>
  );
};

export default Index;
