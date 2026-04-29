import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { AlertTriangle, Home, Radio, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0F172A] text-white p-6 font-sans">
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping opacity-75" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-red-500/10 border-2 border-red-500/30">
          <AlertTriangle className="h-12 w-12 text-red-500 animate-pulse" />
        </div>
      </div>

      <div className="text-center max-w-md">
        <h1 className="text-6xl font-black tracking-tighter mb-2 text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">
          404
        </h1>
        <h2 className="text-xl font-bold uppercase tracking-widest text-red-500 mb-4">
          Terminal Connection Lost
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed mb-10">
          The requested coordinate <code className="bg-white/5 px-2 py-0.5 rounded text-primary">{location.pathname}</code> does not exist on the ResqNet mainframe.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link 
            to="/" 
            className="flex items-center justify-center gap-2 rounded-md bg-white/5 border border-white/10 px-6 py-3 text-sm font-bold hover:bg-white/10 transition-all group"
          >
            <Home className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
            Command Center
          </Link>
          <Link 
            to="/sos" 
            className="flex items-center justify-center gap-2 rounded-md bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-glow-red hover:bg-red-500 transition-all"
          >
            <Radio className="h-4 w-4 animate-pulse" />
            Public SOS
          </Link>
        </div>

        <button 
          onClick={() => window.history.back()}
          className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-white transition-colors mx-auto"
        >
          <ArrowLeft className="h-3 w-3" />
          Return to previous terminal
        </button>
      </div>

      <div className="mt-20 text-[10px] text-gray-600 uppercase tracking-[0.2em] font-mono">
        ResqNet v1.0 • Secure Operations Interface
      </div>
    </div>
  );
};

export default NotFound;
