import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Share, X, MonitorSmartphone, PartyPopper, Sparkles, Check } from "lucide-react";
import Layout from "@/components/Layout";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
  });
}

const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as any).standalone === true;

const InstallPage = () => {
  const [installed, setInstalled] = useState(isStandalone);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setInstalled(true);
      deferredPrompt = null;
    }
  };

  return (
    <Layout>
      <div className="page-container flex flex-col items-center justify-center min-h-[60vh] text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md">
          {installed ? (
            <>
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 220, damping: 12 }}
                className="relative mx-auto mb-6 w-24 h-24 rounded-3xl gradient-primary flex items-center justify-center shadow-2xl shadow-primary/50"
              >
                {/* burst rings */}
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0.6, opacity: 0.7 }}
                    animate={{ scale: 1.8, opacity: 0 }}
                    transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.5 }}
                    className="absolute inset-0 rounded-3xl border-2 border-primary/70"
                  />
                ))}
                {/* check with pop */}
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.3, 1] }}
                  transition={{ delay: 0.25, duration: 0.6, times: [0, 0.6, 1], ease: "easeOut" }}
                  className="relative z-10 flex items-center justify-center"
                >
                  <Check size={52} className="text-primary-foreground" strokeWidth={3.5} />
                </motion.span>
                {/* confetti icon */}
                <motion.span
                  animate={{ rotate: [0, -15, 15, 0], y: [0, -3, 0] }}
                  transition={{ duration: 2.4, repeat: Infinity }}
                  className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-accent flex items-center justify-center shadow-lg"
                >
                  <PartyPopper size={18} className="text-accent-foreground" />
                </motion.span>
              </motion.div>
              <h1 className="text-2xl font-display font-bold mb-2">App Installed!</h1>
              <p className="text-muted-foreground">You can now use JEE MASTER from your home screen.</p>
            </>
          ) : (
            <>
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 160, damping: 14 }}
                className="relative mx-auto mb-6 w-24 h-24 rounded-3xl gradient-primary flex items-center justify-center shadow-2xl shadow-primary/40"
              >
                {/* pulsing glow */}
                <motion.span
                  animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                  className="absolute inset-0 rounded-3xl bg-primary/40 blur-lg"
                />
                {/* floating device icon */}
                <motion.span
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10 flex items-center justify-center"
                >
                  <MonitorSmartphone size={50} className="text-primary-foreground" strokeWidth={2} />
                </motion.span>
                {/* spinning sparkle badge */}
                <motion.span
                  animate={{ rotate: 360, scale: [1, 1.15, 1] }}
                  transition={{ rotate: { duration: 6, repeat: Infinity, ease: "linear" }, scale: { duration: 1.8, repeat: Infinity } }}
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent flex items-center justify-center shadow-lg"
                >
                  <Sparkles size={16} className="text-accent-foreground" fill="currentColor" />
                </motion.span>
                {/* download bounce indicator */}
                <motion.span
                  animate={{ y: [0, 4, 0], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-background border-2 border-primary flex items-center justify-center shadow"
                >
                  <Download size={13} className="text-primary" strokeWidth={3} />
                </motion.span>
              </motion.div>
              <h1 className="text-2xl font-display font-bold mb-3">Install JEE MASTER</h1>
              <p className="text-muted-foreground mb-8">
                Install this app on your phone for the best experience — fast loading, offline access, and no browser tabs.
              </p>

              {isIOS() ? (
                <div className="glass-card p-6 text-left space-y-4">
                  <h3 className="font-semibold text-sm">How to install on iPhone:</h3>
                  <div className="flex items-start gap-3">
                    <Share size={20} className="text-primary mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground">Tap the <strong>Share</strong> button in Safari</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Download size={20} className="text-primary mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground">Scroll down and tap <strong>"Add to Home Screen"</strong></p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleInstall}
                  className="gradient-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity inline-flex items-center gap-2"
                >
                  <Download size={18} />
                  Install App
                </button>
              )}
            </>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default InstallPage;
