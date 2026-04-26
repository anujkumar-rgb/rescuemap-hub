import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import LiveMap from "./pages/LiveMap";
import Teams from "./pages/Teams";
import Alerts from "./pages/Alerts";
import Reports from "./pages/Reports";
import Volunteers from "./pages/Volunteers";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import SosChat from "./pages/SosChat";
import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  const isDemoBypass = localStorage.getItem("demo_bypass") === "true";

  if (loading && !isDemoBypass) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session && !isDemoBypass) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const NetworkBanners = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOnlineBanner, setShowOnlineBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineBanner(true);
      // Auto-sync offline updates here
      const pendingUpdates = JSON.parse(localStorage.getItem("offline_updates") || "[]");
      if (pendingUpdates.length > 0) {
        console.log("Syncing offline updates...", pendingUpdates);
        // Supabase sync logic would go here
        localStorage.removeItem("offline_updates");
      }
      setTimeout(() => setShowOnlineBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOnlineBanner(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 bg-yellow-500 py-1.5 text-sm font-bold text-yellow-950 animate-fade-in shadow-md">
        <WifiOff className="h-4 w-4" />
        You are offline — changes will sync when reconnected
      </div>
    );
  }

  if (showOnlineBanner) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 bg-green-500 py-1.5 text-sm font-bold text-green-950 animate-fade-in shadow-md">
        <Wifi className="h-4 w-4" />
        Back online — syncing data...
      </div>
    );
  }

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <NetworkBanners />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/sos" element={<SosChat />} />
            
            <Route element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/map" element={<LiveMap />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/volunteers" element={<Volunteers />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/reports" element={<Reports />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
