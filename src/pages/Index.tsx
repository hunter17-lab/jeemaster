import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import Hls from "hls.js";
import Layout from "@/components/Layout";
import LoadingScreen from "@/components/LoadingScreen";
import useSEO from "@/hooks/useSEO";

const roles = ["Toppers", "Droppers", "Class 11", "Class 12"];
const HLS_SRC = "https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8";

const sections = [
  { path: "/notes", label: "Notes", desc: "Short, long & topper notes", img: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&q=80" },
  { path: "/mindmaps", label: "Mind Maps", desc: "Visual chapter summaries", img: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=1200&q=80" },
  { path: "/pyq", label: "PYQ", desc: "25+ years of papers", img: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=1200&q=80" },
  { path: "/books", label: "Books", desc: "Curated study material", img: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&q=80" },
];

const stats = [
  { value: "25+", label: "Years of PYQs" },
  { value: "200+", label: "Chapters" },
  { value: "100%", label: "Free Forever" },
];

const useHls = (ref: React.RefObject<HTMLVideoElement>) => {
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(HLS_SRC);
      hls.attachMedia(v);
      return () => hls.destroy();
    } else if (v.canPlayType("application/vnd.apple.mpegurl")) {
      v.src = HLS_SRC;
    }
  }, [ref]);
};

const Index = () => {
  useSEO({
    title: "JEE MASTER — Free IIT JEE Notes, Mind Maps, DPP, PYQs & Books",
    description: "Free IIT JEE preparation: notes, mind maps, DPPs, 25+ years PYQs, books and coaching material for Class 11, 12 & droppers.",
  });

  const [loading, setLoading] = useState(true);
  const [roleIdx, setRoleIdx] = useState(0);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const footerVideoRef = useRef<HTMLVideoElement>(null);
  useHls(heroVideoRef);
  useHls(footerVideoRef);

  useEffect(() => {
    if (loading) return;
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(".name-reveal", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.2, delay: 0.1 });
    tl.fromTo(".blur-in", { opacity: 0, filter: "blur(10px)", y: 20 }, { opacity: 1, filter: "blur(0px)", y: 0, duration: 1, stagger: 0.1 }, "-=0.8");
  }, [loading]);

  useEffect(() => {
    const i = setInterval(() => setRoleIdx((r) => (r + 1) % roles.length), 2000);
    return () => clearInterval(i);
  }, []);

  if (loading) return <LoadingScreen onComplete={() => setLoading(false)} />;

  return (
    <Layout fullBleed>
      {/* HERO */}
      <section className="relative h-screen min-h-[640px] w-full overflow-hidden bg-bg">
        <div className="absolute inset-0">
          <video
            ref={heroVideoRef}
            autoPlay
            muted
            loop
            playsInline
            className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto object-cover -translate-x-1/2 -translate-y-1/2"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-bg to-transparent" />
        </div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <div className="blur-in eyebrow mb-6">Edition '26 · IIT JEE</div>
          <h1 className="name-reveal text-6xl md:text-8xl lg:text-[8.5rem] font-display italic leading-[0.9] tracking-tight text-text-primary mb-6">
            JEE Master
          </h1>
          <p className="blur-in text-base md:text-xl text-text-primary/85 mb-4">
            Built for{" "}
            <span
              key={roleIdx}
              className="font-display italic text-text-primary animate-role-fade-in inline-block"
            >
              {roles[roleIdx]}
            </span>
            . Free. Forever.
          </p>
          <p className="blur-in text-sm md:text-base text-muted-foreground max-w-md mb-10">
            Chapter-wise notes, mind maps, DPPs, 25+ years of PYQs and full coaching material — all in one calm, focused place.
          </p>
          <div className="blur-in inline-flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/notes"
              className="gradient-ring rounded-full"
            >
              <span className="inline-flex items-center gap-2 bg-text-primary text-bg rounded-full text-sm px-7 py-3.5 hover:bg-bg hover:text-text-primary transition-colors">
                Start Learning
              </span>
            </Link>
            <Link
              to="/pyq"
              className="gradient-ring rounded-full"
            >
              <span className="inline-flex items-center gap-2 border-2 border-stroke bg-bg text-text-primary rounded-full text-sm px-7 py-3.5 hover:border-transparent transition-colors">
                Solve PYQs ↗
              </span>
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3">
          <span className="text-xs text-muted-foreground uppercase tracking-[0.2em]">Scroll</span>
          <div className="relative w-px h-10 bg-stroke overflow-hidden">
            <span className="absolute inset-x-0 top-0 h-1/2 accent-gradient animate-scroll-down" />
          </div>
        </div>
      </section>

      {/* SELECTED RESOURCES */}
      <section className="bg-bg py-16 md:py-24">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-px bg-stroke" />
                <span className="eyebrow">Curated Resources</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-display text-text-primary leading-tight">
                Everything you need to <span className="italic">crack JEE</span>
              </h2>
              <p className="text-muted-foreground mt-4 max-w-md text-sm md:text-base">
                A complete library of notes, problems and previous year papers — organised the way you actually study.
              </p>
            </div>
            <Link
              to="/notes"
              className="hidden md:inline-flex gradient-ring rounded-full"
            >
              <span className="inline-flex items-center gap-2 bg-surface text-text-primary rounded-full text-sm px-5 py-2.5 border border-stroke">
                Browse all ↗
              </span>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
            {sections.map((s, i) => {
              const spans = ["md:col-span-7", "md:col-span-5", "md:col-span-5", "md:col-span-7"];
              return (
                <motion.div
                  key={s.path}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.8, delay: i * 0.05 }}
                  className={spans[i]}
                >
                  <Link
                    to={s.path}
                    className="group relative block bg-surface border border-stroke rounded-3xl overflow-hidden aspect-[4/3] md:aspect-[16/10]"
                  >
                    <img
                      src={s.img}
                      alt={s.label}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div
                      className="absolute inset-0 opacity-20 mix-blend-multiply pointer-events-none"
                      style={{
                        backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
                        backgroundSize: "4px 4px",
                      }}
                    />
                    <div className="absolute inset-0 bg-bg/70 opacity-0 group-hover:opacity-100 backdrop-blur-lg transition-opacity duration-500 flex items-center justify-center">
                      <span className="gradient-ring rounded-full">
                        <span className="inline-flex items-center gap-2 bg-text-primary text-bg rounded-full text-sm px-5 py-2.5">
                          View — <span className="font-display italic">{s.label}</span>
                        </span>
                      </span>
                    </div>
                    <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black/70 to-transparent">
                      <h3 className="text-xl md:text-2xl font-display italic text-text-primary">{s.label}</h3>
                      <p className="text-xs text-text-primary/70 mt-1">{s.desc}</p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-bg py-16 md:py-24 border-t border-stroke">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16 grid grid-cols-1 md:grid-cols-3 gap-10">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              className="border-l border-stroke pl-6"
            >
              <div className="text-5xl md:text-7xl font-display italic text-text-primary mb-3">{s.value}</div>
              <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CONTACT / FOOTER VIDEO */}
      <section className="relative bg-bg pt-16 md:pt-24 pb-12 overflow-hidden border-t border-stroke">
        <div className="absolute inset-0 -z-0">
          <video
            ref={footerVideoRef}
            autoPlay muted loop playsInline
            className="absolute top-1/2 left-1/2 min-w-full min-h-full object-cover -translate-x-1/2 -translate-y-1/2 scale-y-[-1] opacity-60"
          />
          <div className="absolute inset-0 bg-black/70" />
        </div>

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-10 text-center">
          <div className="eyebrow mb-6">Ready when you are</div>
          <h2 className="text-5xl md:text-7xl font-display italic text-text-primary leading-[0.95] mb-8">
            Begin your <br className="md:hidden" /> JEE journey.
          </h2>
          <Link to="/auth" className="gradient-ring rounded-full inline-block">
            <span className="inline-flex items-center gap-2 bg-text-primary text-bg rounded-full text-sm px-7 py-3.5 hover:bg-bg hover:text-text-primary transition-colors">
              Get Started ↗
            </span>
          </Link>
        </div>

        <div className="relative z-10 mt-16 overflow-hidden">
          <div className="whitespace-nowrap text-text-primary/10 font-display italic text-7xl md:text-9xl select-none animate-[scroll-x_40s_linear_infinite]">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="mx-8">JEE MASTER · MASTER JEE ·</span>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @keyframes scroll-x {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </Layout>
  );
};

export default Index;
