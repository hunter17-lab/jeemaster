import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Brain, FileText, Target, Library, GraduationCap, Menu, X, Search, Moon, Sun, Download, Info, LogIn, LogOut, UserCircle, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";

const navItems = [
  { path: "/", label: "Home", icon: BookOpen },
  { path: "/notes", label: "Notes", icon: FileText },
  { path: "/mindmaps", label: "Mind Maps", icon: Brain },
  { path: "/dpp", label: "DPP", icon: FileText },
  { path: "/pyq", label: "PYQ", icon: Target },
  { path: "/books", label: "Books", icon: Library },
  { path: "/coaching", label: "Coaching", icon: GraduationCap },
  { path: "/about", label: "About Us", icon: Info },
];

const Navbar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return true;
  });

  const toggleDark = () => {
    document.documentElement.classList.toggle("dark");
    setDark(!dark);
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Left: hamburger (mobile) + brand */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 -ml-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <Link to="/" className="flex items-center gap-2 min-w-0">
              <img src="/icons/icon-192.png" alt="JEE MASTER" className="w-8 h-8 rounded-lg flex-shrink-0" />
              <span className="font-display font-bold text-base sm:text-lg truncate">JEE MASTER</span>
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === path ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
            <Link to="/install" className="hidden sm:inline-flex p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors" title="Install App">
              <Download size={18} />
            </Link>
            <Link to="/search" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <Search size={18} />
            </Link>
            <button onClick={toggleDark} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {isAdmin && (
              <Link to="/admin" className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors" title="Admin Panel">
                <Shield size={18} />
              </Link>
            )}
            {user ? (
              <>
                <Link to="/profile" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Profile">
                  <UserCircle size={18} />
                </Link>
                <button onClick={async () => { await signOut(); navigate("/"); }} className="hidden sm:inline-flex p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Sign Out">
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <Link to="/auth" className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors" title="Sign In">
                <LogIn size={18} />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile side drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobile}
              className="md:hidden fixed inset-0 z-50 bg-background/70 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
              className="md:hidden fixed top-0 left-0 bottom-0 z-50 w-72 max-w-[80vw] bg-card border-r border-border/60 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between h-16 px-4 border-b border-border/50">
                <Link to="/" onClick={closeMobile} className="flex items-center gap-2">
                  <img src="/icons/icon-192.png" alt="JEE MASTER" className="w-8 h-8 rounded-lg" />
                  <span className="font-display font-bold text-lg">JEE MASTER</span>
                </Link>
                <button onClick={closeMobile} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary" aria-label="Close menu">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                {navItems.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    onClick={closeMobile}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      pathname === path ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    <Icon size={18} />
                    {label}
                  </Link>
                ))}
                <div className="h-px bg-border/60 my-3" />
                <Link to="/install" onClick={closeMobile} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-primary/10">
                  <Download size={18} /> Install App
                </Link>
                {user && (
                  <button
                    onClick={async () => { closeMobile(); await signOut(); navigate("/"); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary"
                  >
                    <LogOut size={18} /> Sign Out
                  </button>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
