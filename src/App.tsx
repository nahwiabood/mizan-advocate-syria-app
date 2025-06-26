
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Clients from "./pages/Clients";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import MobileSplashScreen from "./components/MobileSplashScreen";
import { useCapacitor } from "./hooks/use-capacitor";
import { useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: false, // No retries for offline app
    },
  },
});

const App = () => {
  const { isNative, platform } = useCapacitor();

  useEffect(() => {
    // Add platform-specific classes to body
    if (isNative) {
      document.body.classList.add('mobile-app', `platform-${platform}`);
    }

    // Handle safe area insets for mobile
    if (isNative && platform === 'ios') {
      document.documentElement.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
      document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');
    }

    // Prevent context menu on long press (mobile)
    if (isNative) {
      const preventContextMenu = (e: Event) => {
        e.preventDefault();
        return false;
      };
      
      document.addEventListener('contextmenu', preventContextMenu);
      return () => document.removeEventListener('contextmenu', preventContextMenu);
    }
  }, [isNative, platform]);

  return (
    <>
      <MobileSplashScreen />
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </>
  );
};

export default App;
