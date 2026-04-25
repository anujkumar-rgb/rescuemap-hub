import { X, Siren } from "lucide-react";

export function SosBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="sos-blink text-primary-foreground">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 md:px-8 py-2 text-sm font-semibold">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <Siren className="h-4 w-4 flex-shrink-0" />
          <span>
            🚨 ACTIVE SOS — <strong>Alpha Squad</strong> | Zone A (Dharavi) | Triggered 2 min ago
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-md bg-background/20 hover:bg-background/30 px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors">
            Dispatch Team
          </button>
          <button
            onClick={onDismiss}
            aria-label="Dismiss SOS"
            className="rounded-md p-1 hover:bg-background/20 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
