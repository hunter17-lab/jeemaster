import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Share, X } from "lucide-react";
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
              <div className="text-6xl mb-4">✅</div>
              <h1 className="text-2xl font-display font-bold mb-2">App Installed!</h1>
              <p className="text-muted-foreground">You can now use JEE Master Hub from your home screen.</p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-6 animate-float">📱</div>
              <h1 className="text-2xl font-display font-bold mb-3">Install JEE Master Hub</h1>
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
