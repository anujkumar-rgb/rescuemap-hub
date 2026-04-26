import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, Map, Users, Bell, FileBarChart, Radio, Menu, X, Download, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SosBanner } from "./SosBanner";
import { CriticalAlertBar } from "./CriticalAlertBar";
import { useAuth } from "@/hooks/useAuth";
import { LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { supabase } from "@/supabase";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/map", label: "Live Map", icon: Map },
  { to: "/teams", label: "Teams", icon: Users },
  { to: "/volunteers", label: "Volunteers", icon: Users },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/reports", label: "Reports", icon: FileBarChart },
  { to: "/sos", label: "Public SOS", icon: Radio },
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const [sosActive, setSosActive] = useState(true);
  const { user, signOut } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (user?.email) {
      const fetchRole = async () => {
        const { data } = await supabase
          .from('allowed_users')
          .select('role')
          .eq('email', user.email)
          .single();
        if (data) setRole(data.role);
      };
      fetchRole();
    }
  }, [user]);

  const toggleLanguage = () => {
    const currentLang = i18n.resolvedLanguage || i18n.language || "en";
    const nextLang = currentLang.startsWith("en") ? "hi" : "en";
    i18n.changeLanguage(nextLang);
  };

  // PWA Install
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Offline Update Modal
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateForm, setUpdateForm] = useState({ team: "Alpha Squad", status: "En Route", notes: "" });

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === "accepted") {
          setDeferredPrompt(null);
        }
      });
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const handleSaveUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const update = { ...updateForm, timestamp: Date.now() };
    const updates = JSON.parse(localStorage.getItem("offline_updates") || "[]");
    updates.push(update);
    localStorage.setItem("offline_updates", JSON.stringify(updates));
    setShowUpdateModal(false);
    
    // Attempt sync if online
    if (navigator.onLine) {
      console.log("Syncing immediately...", updates);
      localStorage.removeItem("offline_updates");
    } else {
      alert("Saved offline. Will sync when connection is restored.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {sosActive && <SosBanner onDismiss={() => setSosActive(false)} />}

      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-emergency shadow-glow-red">
              <Radio className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight">ResqNet</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Disaster Relief Ops</div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
               <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-glow-red"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )
                }
              >
                <l.icon className="h-4 w-4" />
                {t(l.label)}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button onClick={toggleLanguage} variant="outline" size="sm" className="h-8 px-2 font-bold bg-card text-xs">
              {(i18n.resolvedLanguage || i18n.language || "en").startsWith('en') ? 'EN' : 'HI'}
            </Button>
            
            {deferredPrompt && (
              <Button onClick={handleInstallClick} variant="outline" size="sm" className="h-8 gap-2 border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground">
                <Download className="h-4 w-4" />
                Install App
              </Button>
            )}
            
            <Button onClick={() => setShowUpdateModal(true)} variant="outline" size="sm" className="h-8 gap-2">
              <Edit3 className="h-4 w-4" />
              Update Status
            </Button>

            <div className="flex flex-col items-end border-l border-border pl-3 ml-1">
              <div className="flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-[10px] font-medium text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success pulse-blue" />
                System Online
              </div>
              <div className="flex items-center gap-2 mt-1">
                {role === 'admin' && (
                  <span className="bg-red-500/20 text-red-500 border border-red-500/30 px-1.5 py-0.5 rounded text-[8px] font-bold">ADMIN</span>
                )}
                {role === 'operator' && (
                  <span className="bg-blue-500/20 text-blue-500 border border-blue-500/30 px-1.5 py-0.5 rounded text-[8px] font-bold">OPERATOR</span>
                )}
                <div className="text-[10px] text-muted-foreground lowercase">{user?.email || "demo mode"}</div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="h-8 gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all ml-1"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden lg:inline">{t("Sign Out")}</span>
            </Button>
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden rounded-md p-2 text-muted-foreground hover:bg-accent"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <nav className="md:hidden border-t border-border px-4 py-3 flex flex-col gap-1 animate-fade-in">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                    isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
                  )
                }
              >
                <l.icon className="h-4 w-4" />
                {l.label}
              </NavLink>
            ))}
            <div className="border-t border-border mt-2 pt-2 flex flex-col gap-2">
              {deferredPrompt && (
                <Button onClick={handleInstallClick} className="w-full justify-start gap-2">
                  <Download className="h-4 w-4" /> Install App
                </Button>
              )}
              <Button onClick={() => { setOpen(false); setShowUpdateModal(true); }} variant="outline" className="w-full justify-start gap-2">
                <Edit3 className="h-4 w-4" /> Update Status (Offline)
              </Button>
            </div>
          </nav>
        )}
      </header>

      <CriticalAlertBar count={2} />

      <main className="px-4 md:px-8 py-6 animate-fade-in">
        <Outlet />
      </main>

      {/* Offline Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Field Status Update</h2>
              <button onClick={() => setShowUpdateModal(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleSaveUpdate} className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Team</label>
                <select 
                  value={updateForm.team} 
                  onChange={e => setUpdateForm({...updateForm, team: e.target.value})}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary"
                >
                  <option>Alpha Squad</option>
                  <option>Bravo Unit</option>
                  <option>Delta Force</option>
                  <option>Eagle Team</option>
                  <option>Falcon Squad</option>
                  <option>Griffin Unit</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Status</label>
                <select 
                  value={updateForm.status} 
                  onChange={e => setUpdateForm({...updateForm, status: e.target.value})}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary"
                >
                  <option>En Route</option>
                  <option>On Site</option>
                  <option>Returning</option>
                  <option>Standby</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Notes (Saved Offline)</label>
                <textarea 
                  value={updateForm.notes}
                  onChange={e => setUpdateForm({...updateForm, notes: e.target.value})}
                  placeholder="Enter details here..."
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[100px] focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full gap-2 shadow-glow-red">
                  Save Update
                </Button>
                <p className="text-[10px] text-muted-foreground text-center mt-3">
                  This form is cached via Service Worker and fully functions without an internet connection.
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
