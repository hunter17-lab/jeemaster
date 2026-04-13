import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import TopBanner from "./TopBanner";
import Navbar from "./Navbar";

const BackButton = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  if (pathname === "/") return null;

  return (
    <button
      onClick={() => navigate(-1)}
      className="fixed bottom-6 left-6 z-40 w-11 h-11 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
      aria-label="Go back"
    >
      <ArrowLeft size={20} />
    </button>
  );
};

const Layout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <TopBanner />
    <Navbar />
    <main className="flex-1">{children}</main>
    <BackButton />
    <footer className="border-t border-border/50 py-6 text-center text-sm text-muted-foreground">
      <p>© 2026 JEE MASTER · Made with ❤️ by Team Phoenix</p>
    </footer>
  </div>
);

export default Layout;
