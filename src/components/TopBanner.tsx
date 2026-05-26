import { ExternalLink } from "lucide-react";

const TopBanner = () => (
  <div className="bg-surface border-b border-stroke text-text-primary/90 text-xs uppercase tracking-[0.2em] py-2 px-4 text-center">
    <a
      href="https://t.me/class11cbsescience"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 hover:text-text-primary"
    >
      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
      Join our Telegram for free resources
      <ExternalLink size={12} />
    </a>
  </div>
);

export default TopBanner;
