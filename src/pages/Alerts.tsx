import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle, Bell, MapPin, Clock, Loader2 } from "lucide-react";
import { useAlertsQuery } from "@/hooks/useQueries";
import { cn } from "@/lib/utils";

type Filter = "all" | "critical" | "active";

const severityConfig: Record<string, { border: string; bg: string; text: string; icon: any; label: string }> = {
  critical: { border: "border-l-primary", bg: "bg-primary/10", text: "text-primary", icon: AlertTriangle, label: "Critical" },
  warning:  { border: "border-l-warning", bg: "bg-warning/10", text: "text-warning", icon: Bell,           label: "Warning" },
  info:     { border: "border-l-success", bg: "bg-success/10", text: "text-success", icon: CheckCircle,    label: "Info" },
};

export default function Alerts() {
  const [filter, setFilter] = useState<Filter>("all");
  const [resolved, setResolved] = useState<Set<string>>(new Set());

  const { data: alerts, isLoading } = useAlertsQuery();

  const filtered = useMemo(() => {
    if (!alerts) return [];
    return alerts.filter((a) => {
      if (filter === "critical") return a.severity === "critical";
      if (filter === "active") return !resolved.has(a.id);
      return true;
    });
  }, [alerts, filter, resolved]);

  const toggleResolve = (id: string) =>
    setResolved((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Alerts &amp; Notifications</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {alerts?.filter((a) => a.severity === "critical").length || 0} critical · {(alerts?.length || 0) - resolved.size} active
        </p>
      </div>

      <div className="flex gap-2">
        {(["all", "critical", "active"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium border capitalize transition-colors",
              filter === f
                ? "bg-primary text-primary-foreground border-primary shadow-glow-red"
                : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/40"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((a) => {
            const cfg = severityConfig[a.severity] || severityConfig.info;
            const isResolved = resolved.has(a.id);
            return (
              <li
                key={a.id}
                className={cn(
                  "rounded-lg border border-border bg-card border-l-4 p-4 shadow-card transition-all hover:border-primary/40",
                  cfg.border,
                  isResolved && "opacity-50"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn("flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md", cfg.bg, cfg.text)}>
                    <cfg.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className={cn("font-semibold", isResolved && "line-through")}>{a.title}</h3>
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", cfg.bg, cfg.text)}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>
                    <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {a.location}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {a.time_ago}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleResolve(a.id)}
                    className={cn(
                      "flex-shrink-0 rounded-md px-3 py-2 text-xs font-semibold border transition-colors",
                      isResolved
                        ? "bg-background border-border text-muted-foreground hover:text-foreground"
                        : "bg-success/15 border-success/30 text-success hover:bg-success/25"
                    )}
                  >
                    {isResolved ? "Reopen" : "Mark Resolved"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
