import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Map, Users, Bell, FileBarChart, Radio, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SosBanner } from "./SosBanner";
import { CriticalAlertBar } from "./CriticalAlertBar";
import { useAuth } from "@/hooks/useAuth";
import { LogOut } from "lucide-react";
import { Button } from "./ui/button";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/map", label: "Live Map", icon: Map },
  { to: "/teams", label: "Teams", icon: Users },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/reports", label: "Reports", icon: FileBarChart },
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const [sosActive, setSosActive] = useState(true);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
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
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-[10px] font-medium text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success pulse-blue" />
                System Online
              </div>
              <div className="text-[10px] text-muted-foreground mt-1 lowercase">{user?.email}</div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
            >
              <LogOut className="h-4 w-4" />
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
          </nav>
        )}
      </header>

      <CriticalAlertBar count={2} />

      <main className="px-4 md:px-8 py-6 animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
}
