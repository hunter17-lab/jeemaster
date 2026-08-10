import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import { useVisitorTracking } from "@/hooks/useVisitorTracking";
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
import JeeHubPage from "./pages/JeeHubPage";
import JeeHubFramePage from "./pages/JeeHubFramePage";
import GiveawaysPage from "./pages/GiveawaysPage";
import GiveawayDetailPage from "./pages/GiveawayDetailPage";
import BookSubjectPage from "./pages/BookSubjectPage";
import CoachingPage from "./pages/CoachingPage";
import CoachingDetailPage from "./pages/CoachingDetailPage";
import SearchPage from "./pages/SearchPage";
import InstallPage from "./pages/InstallPage";
import AboutPage from "./pages/AboutPage";
import AuthPage from "./pages/AuthPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import ComingSoonPage from "./pages/ComingSoonPage";
import LegalPage from "./pages/LegalPage";
import NotFound from "./pages/NotFound";


const queryClient = new QueryClient();

if (!document.documentElement.classList.contains("light")) {
  document.documentElement.classList.add("dark");
}

const App = () => {
  useVisitorTracking();
  return (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/mindmaps" element={<MindMapsPage />} />
            <Route path="/dpp" element={<DPPPage />} />
            <Route path="/pyq" element={<PYQPage />} />
            <Route path="/pyq/:year/:shift/:month" element={<PYQPapersPage />} />
            <Route path="/books" element={<BooksPage />} />
            <Route path="/books/:subject" element={<BookSubjectPage />} />
            <Route path="/hub" element={<JeeHubPage />} />
            <Route path="/hub/:slug" element={<JeeHubFramePage />} />
            <Route path="/giveaways" element={<GiveawaysPage />} />
            <Route path="/giveaways/:id" element={<GiveawayDetailPage />} />
            <Route path="/coaching" element={<CoachingPage />} />
            <Route path="/coaching/:slug" element={<CoachingDetailPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/install" element={<InstallPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/terms" element={<LegalPage kind="terms" />} />
            <Route path="/dmca" element={<LegalPage kind="dmca" />} />
            <Route path="/privacy" element={<LegalPage kind="privacy" />} />


            <Route path="/auth" element={<AuthPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
  );
};


export default App;
