import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, ExternalLink, AlertTriangle, Sparkles, Rocket } from "lucide-react";

const StartPopup = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("jee-popup-dismissed");
    if (!dismissed) setOpen(true);
  }, []);

  const close = () => {
    setOpen(false);
    sessionStorage.setItem("jee-popup-dismissed", "1");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4"
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-sm rounded-3xl border border-border/50 bg-card/95 backdrop-blur-xl p-7 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundImage:
                "radial-gradient(circle at top right, hsl(var(--primary) / 0.15), transparent 60%), radial-gradient(circle at bottom left, hsl(var(--accent) / 0.12), transparent 60%)",
            }}
          >
            <button
              onClick={close}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Icon badge */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, type: "spring" }}
              className="mx-auto w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/30 mb-5"
            >
              <Sparkles size={28} className="text-primary-foreground" />
            </motion.div>

            {/* Title */}
            <h2 className="text-center text-xl font-display font-bold mb-1.5 flex items-center justify-center gap-2 flex-wrap">
              <span>✨</span>
              <span>Made with</span>
              <Heart className="text-destructive fill-destructive" size={18} />
              <span>by Team Phoenix</span>
            </h2>

            {/* Subtitle */}
            <p className="text-center text-sm text-muted-foreground mb-5 flex items-center justify-center gap-1.5">
              <span>📚</span> Free resources for all IIT JEE students
            </p>

            {/* Disclaimer card */}
            <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-muted/40 p-3 mb-5">
              <AlertTriangle size={16} className="text-warning shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                We do not own any content, all rights belong to respective owners
              </p>
            </div>

            {/* CTAs */}
            <div className="space-y-2.5">
              <a
                href="https://t.me/+_-F7r5UIv6Q3YzA9"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary/90 hover:bg-primary text-primary-foreground px-5 py-3 font-semibold text-sm transition-colors shadow-lg shadow-primary/20"
              >
                <span>👉</span>
                Join Telegram for support &amp; materials
                <ExternalLink size={14} />
              </a>

              <button
                onClick={close}
                className="flex items-center justify-center gap-2 w-full rounded-xl gradient-primary text-primary-foreground px-5 py-3 font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
              >
                Let's Start Learning <Rocket size={16} />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StartPopup;
