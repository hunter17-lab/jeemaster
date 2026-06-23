import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, UserCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "jee-profile-reminder-shown";
const START_POPUP_KEY = "jee-popup-dismissed";

type Mode = "new-user" | "complete-profile";

const ProfileReminderPopup = () => {
  const { user, loading: authLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("new-user");

  useEffect(() => {
    if (authLoading) return;
    if (sessionStorage.getItem(SESSION_KEY)) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const waitForStartPopup = () =>
      new Promise<void>((resolve) => {
        const check = () => {
          if (cancelled) return resolve();
          if (sessionStorage.getItem(START_POPUP_KEY)) resolve();
          else setTimeout(check, 500);
        };
        check();
      });

    const decideAndShow = async () => {
      await waitForStartPopup();
      if (cancelled) return;

      let nextMode: Mode = "new-user";
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("display_name, phone, class_name, coaching_institute, state")
          .eq("user_id", user.id)
          .maybeSingle();
        const incomplete =
          !data ||
          !data.display_name ||
          !data.phone ||
          !data.class_name ||
          !data.coaching_institute ||
          !data.state;
        if (!incomplete) return; // profile complete → nothing to show
        nextMode = "complete-profile";
      }

      timer = setTimeout(() => {
        if (cancelled) return;
        setMode(nextMode);
        setOpen(true);
        sessionStorage.setItem(SESSION_KEY, "1");
      }, 5000);
    };

    decideAndShow();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [user, authLoading]);

  const close = () => setOpen(false);

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
            className="relative w-full max-w-sm rounded-3xl border border-border/50 bg-card/95 backdrop-blur-xl p-7 shadow-2xl text-center"
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

            <motion.div
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, type: "spring" }}
              className="mx-auto w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/30 mb-5 text-5xl"
            >
              {mode === "new-user" ? "👋" : "🚀"}
            </motion.div>

            <h2 className="text-2xl font-display font-bold mb-1">
              {mode === "new-user" ? "Hello User 👋" : "Almost there!"}
            </h2>
            <p className="text-xs uppercase tracking-widest text-primary/80 font-semibold mb-3 inline-flex items-center gap-1 justify-center">
              <Sparkles size={12} /> Message from Admin
            </p>

            {mode === "new-user" ? (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your account to get started and unlock bookmarks,
                  progress tracking and giveaways.
                </p>
                <div className="space-y-2.5">
                  <Link
                    to="/auth"
                    onClick={close}
                    className="flex items-center justify-center gap-2 w-full rounded-xl gradient-primary text-primary-foreground px-5 py-3 font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
                  >
                    <UserPlus size={16} /> Create Account
                  </Link>
                  <p className="text-xs text-muted-foreground pt-1">
                    Already signed up? Complete your profile to boost your
                    preparation.
                  </p>
                  <Link
                    to="/profile"
                    onClick={close}
                    className="flex items-center justify-center gap-2 w-full rounded-xl bg-secondary text-foreground px-5 py-2.5 font-semibold text-sm hover:bg-secondary/80 transition-colors"
                  >
                    <UserCheck size={16} /> Complete Profile
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  Complete your profile and boost your preparation. Add your
                  class, coaching institute and state so we can personalise
                  things for you.
                </p>
                <div className="space-y-2.5">
                  <Link
                    to="/profile"
                    onClick={close}
                    className="flex items-center justify-center gap-2 w-full rounded-xl gradient-primary text-primary-foreground px-5 py-3 font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
                  >
                    <UserCheck size={16} /> Complete Profile
                  </Link>
                  <button
                    onClick={close}
                    className="w-full rounded-xl bg-secondary text-foreground px-5 py-2.5 font-semibold text-sm hover:bg-secondary/80 transition-colors"
                  >
                    Maybe later
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProfileReminderPopup;
