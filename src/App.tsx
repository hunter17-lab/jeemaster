import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import ScrollToTop from "@/components/ScrollToTop";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotesPage from "./pages/NotesPage";
import MindMapsPage from "./pages/MindMapsPage";
import DPPPage from "./pages/DPPPage";
import PYQPage from "./pages/PYQPage";
import PYQPapersPage from "./pages/PYQPapersPage";
import BooksPage from "./pages/BooksPage";
import BookSubjectPage from "./pages/BookSubjectPage";
import CoachingPage from "./pages/CoachingPage";
import SearchPage from "./pages/SearchPage";
import InstallPage from "./pages/InstallPage";
import AboutPage from "./pages/AboutPage";
import AuthPage from "./pages/AuthPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Force dark theme always
document.documentElement.classList.add("dark");
document.documentElement.classList.remove("light");

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/mindmaps" element={<MindMapsPage />} />
        <Route path="/dpp" element={<DPPPage />} />
        <Route path="/pyq" element={<PYQPage />} />
        <Route path="/pyq/:year/:shift/:month" element={<PYQPapersPage />} />
        <Route path="/books" element={<BooksPage />} />
        <Route path="/books/:subject" element={<BookSubjectPage />} />
        <Route path="/coaching" element={<CoachingPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/install" element={<InstallPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <AnimatedRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
