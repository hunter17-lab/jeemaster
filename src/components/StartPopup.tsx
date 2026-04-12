import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, ExternalLink } from "lucide-react";

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
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="glass-card max-w-md w-full p-8 text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={close} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
              <X size={20} />
            </button>

            <motion.div initial={{ y: -10 }} animate={{ y: 0 }} transition={{ delay: 0.2 }} className="text-4xl mb-4">✨</motion.div>

            <h2 className="text-xl font-display font-bold mb-2">
              Made with <Heart className="inline text-destructive fill-destructive" size={18} /> by Team Phoenix
            </h2>

            <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
              📚 Free resources for all IIT JEE students
            </p>

            <p className="text-xs text-muted-foreground mb-6">
              ⚠️ We do not own any content, all rights belong to respective owners
            </p>

            <a
              href="https://t.me/class11cbsescience"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 gradient-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              <ExternalLink size={16} />
              Join Telegram for Support & Materials
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StartPopup;
