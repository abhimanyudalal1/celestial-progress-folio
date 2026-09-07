import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";

// Only the landing page ships in the initial bundle. The other routes drag in markdown
// rendering, framer-motion grids and chart code that the intro should not have to parse
// before it can start animating.
const GridView = lazy(() => import("./pages/GridView"));
const About = lazy(() => import("./pages/About"));
const Blogs = lazy(() => import("./pages/Blogs"));
const NotFound = lazy(() => import("./pages/NotFound"));
const BlogPostView = lazy(() => import("./pages/BlogPostView"));
import { TransitionProvider } from "@/contexts/TransitionContext";
import { TransitionController } from "@/components/TransitionController";
import { BackgroundMusic } from "@/components/BackgroundMusic";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <TransitionProvider>
            <TransitionController />
            <BackgroundMusic />
            <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/blog/:slug" element={<BlogPostView />} />
              <Route path="/grid-view" element={<GridView />} />
              <Route path="/about" element={<About />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </TransitionProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
