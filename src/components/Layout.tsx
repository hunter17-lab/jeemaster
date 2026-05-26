import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "./Navbar";
import AITutor from "./AITutor";

const BackButton = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  if (pathname === "/") return null;
  return (
    <button
      onClick={() => navigate(-1)}
      className="fixed bottom-6 left-6 z-40 w-11 h-11 rounded-full bg-surface border border-stroke text-text-primary backdrop-blur-md flex items-center justify-center hover:bg-stroke/60 transition-colors"
      aria-label="Go back"
    >
      <ArrowLeft size={18} />
    </button>
  );
};

const Layout = ({ children, fullBleed = false }: { children: ReactNode; fullBleed?: boolean }) => {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen flex flex-col bg-bg text-text-primary">
      <Navbar />
      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className={`flex-1 ${fullBleed ? "" : "pt-24 md:pt-28"}`}
      >
        {children}
      </motion.main>
      <BackButton />
      <AITutor />
      <footer className="border-t border-stroke py-8 px-6 text-center text-xs text-muted-foreground uppercase tracking-[0.25em]">
        <div className="flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          © 2026 JEE Master — Built by Team Phoenix
        </div>
      </footer>
    </div>
  );
};

export default Layout;
