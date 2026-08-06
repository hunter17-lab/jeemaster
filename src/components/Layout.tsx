import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import TopBanner from "./TopBanner";
import Navbar from "./Navbar";
import AITutor from "./AITutor";
import SiteFooter from "./SiteFooter";


const BackButton = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  if (pathname === "/") return null;

  const handleBack = () => {
    // Fallback to home if there's no in-app history (direct load / new tab)
    const hasHistory =
      typeof window !== "undefined" &&
      window.history.length > 1 &&
      document.referrer &&
      document.referrer.includes(window.location.host);
    if (hasHistory || (typeof window !== "undefined" && window.history.length > 2)) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <button
      onClick={handleBack}
      className="fixed bottom-6 left-6 z-40 w-11 h-11 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity active:scale-95"
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
    <AITutor />
    <SiteFooter />
  </div>
);


export default Layout;
