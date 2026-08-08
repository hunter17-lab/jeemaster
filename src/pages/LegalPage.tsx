import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import useSEO from "@/hooks/useSEO";
import { FileText, Lock, ShieldAlert } from "lucide-react";

type LegalKind = "terms" | "privacy" | "dmca";

interface Block {
  kind: "p" | "list" | "heading";
  text?: string;
  items?: string[];
}

const CONTENT: Record<
  LegalKind,
  { title: string; icon: typeof FileText; seoDescription: string; blocks: Block[] }
> = {
  terms: {
    title: "Copyright & Terms",
    icon: FileText,
    seoDescription:
      "Copyright & Terms of use for JEE MASTER — an educational platform by Team Phoenix offering free JEE preparation resources.",
    blocks: [
      { kind: "p", text: "Welcome to JEE Master." },
      {
        kind: "p",
        text:
          "JEE Master is an educational platform created by Team Phoenix with the goal of providing free learning resources for IIT JEE aspirants.",
      },
      { kind: "p", text: "By using this website, you agree to the following terms:" },
      {
        kind: "list",
        items: [
          "This platform is intended only for educational purposes.",
          "Users are responsible for how they use the resources available on this platform.",
          "We do not claim ownership of third-party educational materials linked or referenced on this website.",
          "All trademarks, logos, books, coaching materials, and educational content belong to their respective owners.",
          "Unauthorized misuse, redistribution, or commercial use of any content is strictly prohibited.",
          "We reserve the right to update, modify, or remove any content or feature at any time without prior notice.",
        ],
      },
      {
        kind: "p",
        text: "By continuing to use JEE Master, you agree to these Terms and Conditions.",
      },
      { kind: "p", text: "— Team Phoenix" },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    icon: Lock,
    seoDescription:
      "Privacy Policy of JEE MASTER — what minimal data we collect, how it is used, and how to reach Team Phoenix with questions.",
    blocks: [
      { kind: "p", text: "Your privacy is important to us." },
      {
        kind: "p",
        text:
          "JEE Master collects only the minimum information required to improve user experience and maintain the platform.",
      },
      { kind: "heading", text: "Information that may be collected includes:" },
      {
        kind: "list",
        items: [
          "Login information (if you create an account)",
          "Anonymous visitor statistics",
          "Bookmarks and preferences",
          "Device and browser information for security purposes",
        ],
      },
      {
        kind: "p",
        text: "We do NOT sell or share your personal information with third parties.",
      },
      { kind: "heading", text: "Cookies or local storage may be used to:" },
      {
        kind: "list",
        items: [
          "Remember your preferences",
          "Improve website performance",
          "Enhance user experience",
        ],
      },
      { kind: "p", text: "This platform is intended for educational purposes only." },
      {
        kind: "p",
        text:
          "If you have any questions regarding our Privacy Policy, please contact Team Phoenix through our official Telegram channel.",
      },
    ],
  },
  dmca: {
    title: "DMCA Policy",
    icon: ShieldAlert,
    seoDescription:
      "DMCA Policy of JEE MASTER — how to submit a copyright complaint and how Team Phoenix handles takedown requests.",
    blocks: [
      {
        kind: "p",
        text:
          "JEE Master respects the intellectual property rights of authors, publishers, educational organizations, and copyright owners.",
      },
      {
        kind: "p",
        text:
          "Some resources available on this platform may contain links to third-party content that is publicly accessible on the internet.",
      },
      {
        kind: "heading",
        text:
          "If you believe that any content available on JEE Master infringes your copyright, please contact us with the following information:",
      },
      {
        kind: "list",
        items: [
          "Your full name",
          "Copyright ownership details",
          "The exact URL or resource involved",
          "Proof of ownership",
          "Your contact information",
        ],
      },
      {
        kind: "p",
        text:
          "After receiving a valid copyright complaint, we will review the request and remove or disable access to the reported content if necessary.",
      },
      {
        kind: "p",
        text: "Our goal is to support free education while respecting the rights of content owners.",
      },
      {
        kind: "p",
        text: "For copyright concerns, please contact us through our official Telegram.",
      },
      { kind: "p", text: "— Team Phoenix" },
    ],
  },
};

const LegalPage = ({ kind }: { kind: LegalKind }) => {
  const { title, icon: Icon, blocks, seoDescription } = CONTENT[kind];
  useSEO({ title: `${title} — JEE MASTER`, description: seoDescription });

  const showContact = kind === "privacy" || kind === "dmca";

  return (
    <Layout>
      <div className="page-container py-16 md:py-20 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <div className="flex items-center gap-4 mb-8">
            <span className="inline-flex w-14 h-14 rounded-2xl gradient-primary text-primary-foreground items-center justify-center shadow-lg shadow-primary/30 shrink-0">
              <Icon size={26} />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary mb-1.5">
                Legal
              </p>
              <h1 className="text-3xl md:text-4xl font-display font-bold leading-tight">{title}</h1>
            </div>
          </div>

          <div className="glass-card p-6 md:p-10 space-y-5">
            {blocks.map((block, i) => {
              if (block.kind === "heading") {
                return (
                  <h2
                    key={i}
                    className="text-base md:text-lg font-display font-semibold text-foreground pt-2"
                  >
                    {block.text}
                  </h2>
                );
              }
              if (block.kind === "list") {
                return (
                  <ul key={i} className="space-y-3">
                    {block.items?.map((item) => (
                      <li key={item} className="flex gap-3 text-sm md:text-base text-muted-foreground leading-relaxed">
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={i} className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {block.text}
                </p>
              );
            })}

            {showContact && (
              <div className="pt-4 border-t border-border/60 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/80">
                  Contact
                </p>
                <p className="text-sm text-muted-foreground">
                  Telegram:{" "}
                  <a
                    href="https://t.me/class11cbsescience"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline break-all"
                  >
                    https://t.me/class11cbsescience
                  </a>
                </p>
                {kind === "privacy" && (
                  <p className="text-sm text-muted-foreground">
                    E-mail:{" "}
                    <a
                      href="mailto:utkarsh15102009@gmail.com"
                      className="text-primary hover:underline break-all"
                    >
                      utkarsh15102009@gmail.com
                    </a>
                  </p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default LegalPage;
