import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Layout1 from "./pages/Layout1";
import Layout2 from "./pages/Layout2";
import Layout3 from "./pages/Layout3";
import Layout4 from "./pages/Layout4";
import Layout5 from "./pages/Layout5";
import Layout6 from "./pages/Layout6";
import Layout7 from "./pages/Layout7";
import Layout8 from "./pages/Layout8";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/layout-1" element={<Layout1 />} />
          <Route path="/layout-2" element={<Layout2 />} />
          <Route path="/layout-3" element={<Layout3 />} />
          <Route path="/layout-4" element={<Layout4 />} />
          <Route path="/layout-5" element={<Layout5 />} />
          <Route path="/layout-6" element={<Layout6 />} />
          <Route path="/layout-7" element={<Layout7 />} />
          <Route path="/layout-8" element={<Layout8 />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
