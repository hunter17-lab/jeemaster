import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import NotesPage from "./pages/NotesPage";
import MindMapsPage from "./pages/MindMapsPage";
import DPPPage from "./pages/DPPPage";
import PYQPage from "./pages/PYQPage";
import BooksPage from "./pages/BooksPage";
import CoachingPage from "./pages/CoachingPage";
import SearchPage from "./pages/SearchPage";
import InstallPage from "./pages/InstallPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Default to dark mode
if (!document.documentElement.classList.contains("light")) {
  document.documentElement.classList.add("dark");
}

const App = () => (
  <QueryClientProvider client={queryClient}>
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
