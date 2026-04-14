import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotesPage from "./pages/NotesPage";
import MindMapsPage from "./pages/MindMapsPage";
import DPPPage from "./pages/DPPPage";
import PYQPage from "./pages/PYQPage";
import BooksPage from "./pages/BooksPage";
import CoachingPage from "./pages/CoachingPage";
import SearchPage from "./pages/SearchPage";
import InstallPage from "./pages/InstallPage";
import AboutPage from "./pages/AboutPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

if (!document.documentElement.classList.contains("light")) {
  document.documentElement.classList.add("dark");
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/mindmaps" element={<MindMapsPage />} />
            <Route path="/dpp" element={<DPPPage />} />
            <Route path="/pyq" element={<PYQPage />} />
            <Route path="/books" element={<BooksPage />} />
            <Route path="/coaching" element={<CoachingPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/install" element={<InstallPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
