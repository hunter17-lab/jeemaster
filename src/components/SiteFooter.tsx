import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight, Compass, Send, ShieldCheck } from "lucide-react";

const exploreLinks = [
  { label: "JEE Hub", to: "/hub" },
  { label: "Notes", to: "/notes" },
  { label: "PYQs", to: "/pyq" },
  { label: "Books", to: "/books" },
  { label: "Coaching Material", to: "/coaching" },
];

const legalLinks = [
  { label: "About Us", to: "/about" },
  { label: "Copyright & Terms", to: "/terms" },
  { label: "DMCA Policy", to: "/dmca" },
  { label: "Privacy Policy", to: "/privacy" },
];

const FooterLink = ({ to, label }: { to: string; label: string }) => (
  <li>
    <Link
      to={to}
      className="inline-flex text-sm text-muted-foreground transition-all duration-[250ms] hover:text-primary hover:translate-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
    >
      {label}
    </Link>
  </li>
);

const ColumnHeading = ({ icon: Icon, children }: { icon: typeof Compass; children: string }) => (
  <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/80 mb-5">
    <span className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
      <Icon size={14} />
    </span>
    {children}
  </h3>
);

const SiteFooter = () => (
  <footer className="relative border-t border-white/[0.06] bg-background overflow-hidden">
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 h-[420px]"
      style={{
        background:
          "radial-gradient(60% 60% at 50% 0%, hsl(var(--primary) / 0.08) 0%, transparent 70%)",
      }}
    />
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-[120px] pb-[70px]"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-20">
        {/* Column 1 — Brand + support card */}
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <img
              src="/icons/icon-192.png"
              alt="JEE MASTER logo"
              className="w-11 h-11 rounded-xl shadow-lg"
              loading="lazy"
            />
            <div>
              <p className="font-display font-bold text-lg leading-none">JEE MASTER</p>
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground mt-1.5">
                Your place for JEE preparation
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mb-7">
            Curated Notes, PYQs, Books, Coaching Material, and everything you need to crack JEE —
            all in one place.
          </p>

          <motion.a
            href="https://t.me/+_-F7r5UIv6Q3YzA9"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Support us — join our Telegram channel"
            whileHover={{ scale: 1.03, y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="group block max-w-sm rounded-[20px] bg-card/80 backdrop-blur-xl border border-border/60 p-5 shadow-lg transition-shadow duration-300 hover:border-primary/40 hover:shadow-[0_12px_40px_-12px_hsl(var(--primary)/0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
              Support ❤️
            </p>
            <div className="flex items-center gap-4">
              <span className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center text-primary shrink-0">
                <Send size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display font-semibold text-base leading-tight">
                  Our Lovely Channel
                </p>
                <p className="text-xs text-muted-foreground mt-1">Keep Your Support</p>
              </div>
              <ArrowUpRight
                size={18}
                className="text-muted-foreground shrink-0 transition-all duration-300 group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-0.5"
              />
            </div>
          </motion.a>
        </div>

        {/* Column 2 — Explore */}
        <nav aria-label="Explore">
          <ColumnHeading icon={Compass}>Explore</ColumnHeading>
          <ul className="space-y-3">
            {exploreLinks.map((l) => (
              <FooterLink key={l.to} {...l} />
            ))}
          </ul>
        </nav>

        {/* Column 3 — Legal */}
        <nav aria-label="Legal">
          <ColumnHeading icon={ShieldCheck}>Legal</ColumnHeading>
          <ul className="space-y-3">
            {legalLinks.map((l) => (
              <FooterLink key={l.to} {...l} />
            ))}
          </ul>
        </nav>
      </div>

      <div className="mt-16 pt-6 border-t border-white/[0.06] text-center text-xs text-muted-foreground">
        <p>© 2026 JEE MASTER · Made with ❤️ by Team Phoenix</p>
      </div>
    </motion.div>
  </footer>
);

export default SiteFooter;
