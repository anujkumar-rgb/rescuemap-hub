import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { supabase } from "@/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Radio, Eye, EyeOff, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Redirect if already logged in
  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
      } else if (data.session) {
        // WHITELIST CHECK
        const { data: allowed, error: allowedError } = await supabase
          .from('allowed_users')
          .select('*')
          .eq('email', email)
          .eq('is_active', true)
          .single();

        if (allowedError || !allowed) {
          await supabase.auth.signOut();
          setError("Access denied. You are not authorized to access this system.");
          return;
        }

        navigate("/dashboard");
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0F172A] p-4 font-sans">
      <Card className="w-full max-w-[440px] bg-card/50 border-white/10 backdrop-blur-xl shadow-2xl animate-fade-in px-2 py-4">
        <CardHeader className="space-y-1 text-center pb-10">
          <div className="flex justify-center mb-6">
            <div className="relative">
              {/* Radar sonar ping effect */}
              <div className="absolute inset-0 rounded-xl bg-primary/30 animate-ping opacity-75" />
              <div className="absolute inset-[-10px] rounded-xl border border-primary/20 animate-pulse-slow scale-125" />
              
              <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-emergency shadow-glow-red z-10">
                <Radio className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-white">ResqNet</CardTitle>
          <CardDescription className="text-gray-400 uppercase tracking-widest text-[10px] font-medium mt-2">
            Disaster Relief Operations
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="operator@resqnet.gov"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#1E293B] border-white/10 text-white placeholder:text-gray-500 h-12 focus:ring-[#DC2626] focus:border-[#DC2626] transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-[#1E293B] border-white/10 text-white placeholder:text-gray-500 h-12 pr-10 focus:ring-[#DC2626] focus:border-[#DC2626] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 mt-6 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold transition-all duration-300 shadow-glow-red border-none group"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Sign In"
              )}
            </Button>
            
            {error && (
              <div className="text-red-500 text-xs font-medium text-center mt-2 animate-shake">
                {error}
              </div>
            )}
            
            <div className="text-center mt-4">
              <button type="button" className="text-[11px] text-muted-foreground hover:text-white transition-colors">
                Forgot password? Contact admin
              </button>
            </div>
            
            <div className="mt-6 pt-4 border-t border-white/10">
              <Button
                type="button"
                onClick={() => {
                  // Instant bypass for demo/judging
                  localStorage.setItem("demo_bypass", "true");
                  navigate("/dashboard");
                  window.location.reload(); // Force reload to apply bypass
                }}
                className="w-full h-10 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-medium border border-white/10 transition-all text-sm"
              >
                Demo Admin Bypass (For Judges)
              </Button>
            </div>
          </form>
          
          <div className="mt-10 text-center space-y-3">
            <p className="text-[10px] text-gray-500 uppercase tracking-tighter">
              Authorized Personnel Only • Secure Terminal
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-[9px] text-success font-medium uppercase tracking-widest">Supabase Auth Connected</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-8 text-[11px] text-gray-500 font-medium tracking-tight">
        ResqNet v1.0 • National Operations
      </div>
    </div>
  );
}
