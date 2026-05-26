import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Search, Download, LogIn, LogOut, UserCircle, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";

const navItems = [
  { path: "/", label: "Home" },
  { path: "/notes", label: "Notes" },
  { path: "/mindmaps", label: "Mind Maps" },
  { path: "/dpp", label: "DPP" },
  { path: "/pyq", label: "PYQ" },
  { path: "/books", label: "Books" },
  { path: "/coaching", label: "Coaching" },
  { path: "/about", label: "About" },
];

const Navbar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-3 md:pt-5 px-3">
      <div
        className={`inline-flex items-center rounded-full backdrop-blur-md border border-white/10 bg-surface/80 px-2 py-2 transition-shadow ${
          scrolled ? "shadow-lg shadow-black/30" : ""
        }`}
      >
        {/* Logo */}
        <Link
          to="/"
          className="group relative w-9 h-9 rounded-full p-[2px] accent-gradient flex-shrink-0"
          aria-label="Home"
        >
          <span className="flex items-center justify-center w-full h-full rounded-full bg-bg font-display italic text-[13px] text-text-primary transition-transform group-hover:scale-110">
            JM
          </span>
        </Link>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden ml-1 p-2 rounded-full text-muted-foreground hover:text-text-primary hover:bg-stroke/50 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>

        <div className="hidden md:flex items-center">
          <div className="w-px h-5 bg-stroke mx-2" />
          {navItems.slice(0, 6).map(({ path, label }) => {
            const active = pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`text-xs sm:text-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 transition-colors ${
                  active
                    ? "text-text-primary bg-stroke/60"
                    : "text-muted-foreground hover:text-text-primary hover:bg-stroke/50"
                }`}
              >
                {label}
              </Link>
            );
          })}
          <div className="w-px h-5 bg-stroke mx-2" />
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-0.5">
          <Link to="/search" className="p-2 rounded-full text-muted-foreground hover:text-text-primary hover:bg-stroke/50 transition-colors" aria-label="Search">
            <Search size={16} />
          </Link>
          <Link to="/install" className="hidden sm:inline-flex p-2 rounded-full text-muted-foreground hover:text-text-primary hover:bg-stroke/50 transition-colors" aria-label="Install">
            <Download size={16} />
          </Link>
          {isAdmin && (
            <Link to="/admin" className="p-2 rounded-full text-muted-foreground hover:text-text-primary hover:bg-stroke/50 transition-colors" aria-label="Admin">
              <Shield size={16} />
            </Link>
          )}
          {user ? (
            <>
              <Link to="/profile" className="p-2 rounded-full text-muted-foreground hover:text-text-primary hover:bg-stroke/50 transition-colors" aria-label="Profile">
                <UserCircle size={16} />
              </Link>
              <button onClick={async () => { await signOut(); navigate("/"); }} className="hidden sm:inline-flex p-2 rounded-full text-muted-foreground hover:text-text-primary hover:bg-stroke/50 transition-colors" aria-label="Sign out">
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="gradient-ring ml-1 text-xs sm:text-sm rounded-full"
            >
              <span className="inline-flex items-center gap-1 bg-surface rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-text-primary">
                Sign in <span className="text-[10px]">↗</span>
              </span>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      {typeof document !== "undefined" && createPortal(
        <div className={`md:hidden fixed inset-0 z-[9999] ${mobileOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className={`absolute inset-0 bg-bg/80 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen ? "opacity-100" : "opacity-0"}`}
          />
          <aside
            className={`absolute inset-y-0 left-0 w-72 max-w-[82vw] bg-surface border-r border-stroke flex flex-col transition-transform duration-300 ease-out ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
          >
            <div className="flex items-center justify-between h-16 px-5 border-b border-stroke">
              <span className="font-display italic text-xl text-text-primary">JEE Master</span>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-full text-muted-foreground hover:text-text-primary hover:bg-stroke/50" aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {navItems.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-3 rounded-2xl text-sm transition-colors ${
                    pathname === path ? "bg-stroke/60 text-text-primary" : "text-muted-foreground hover:bg-stroke/40 hover:text-text-primary"
                  }`}
                >
                  {label}
                </Link>
              ))}
              <div className="h-px bg-stroke my-3" />
              <Link to="/install" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-2xl text-sm text-muted-foreground hover:bg-stroke/40 hover:text-text-primary">Install App</Link>
              {user && (
                <button
                  onClick={async () => { setMobileOpen(false); await signOut(); navigate("/"); }}
                  className="w-full text-left px-4 py-3 rounded-2xl text-sm text-muted-foreground hover:bg-stroke/40 hover:text-text-primary"
                >
                  Sign Out
                </button>
              )}
            </div>
          </aside>
        </div>,
        document.body
      )}
    </nav>
  );
};

export default Navbar;
