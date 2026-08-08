import { ExternalLink } from "lucide-react";

const TopBanner = () => (
  <div className="gradient-primary py-2 px-4 text-center text-primary-foreground text-sm font-medium">
    <a
      href="https://t.me/+_-F7r5UIv6Q3YzA9"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 hover:underline"
    >
      📢 Join our Telegram for more resources & support
      <ExternalLink size={14} />
    </a>
  </div>
);

export default TopBanner;
