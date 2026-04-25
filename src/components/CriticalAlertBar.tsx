import { useState } from "react";
import { Link } from "react-router-dom";
import { BellOff, AlertTriangle } from "lucide-react";

export function CriticalAlertBar({ count = 2 }: { count?: number }) {
  const [muted, setMuted] = useState(false);
  if (muted) return null;
  return (
    <div className="sticky top-16 z-30 border-b border-primary/40 bg-primary/90 text-primary-foreground backdrop-blur">
      <div className="flex items-center justify-between px-4 md:px-8 py-1.5 text-xs font-medium">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>
            {count} critical alerts require attention —{" "}
            <Link to="/alerts" className="underline underline-offset-2 font-semibold hover:opacity-90">
              View Alerts
            </Link>
          </span>
        </div>
        <button
          onClick={() => setMuted(true)}
          aria-label="Mute alerts"
          className="flex items-center gap-1 rounded-md px-2 py-0.5 hover:bg-background/20 transition-colors"
        >
          <BellOff className="h-3.5 w-3.5" />
          Mute
        </button>
      </div>
    </div>
  );
}
