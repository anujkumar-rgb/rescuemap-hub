import { Radio, Loader2 } from "lucide-react";
import { useFieldUpdatesQuery } from "@/hooks/useQueries";
import { cn } from "@/lib/utils";

const borderClass: Record<string, string> = {
  urgent: "border-l-primary",
  update: "border-l-info",
  success: "border-l-success",
};

export function FieldUpdates({ className }: { className?: string }) {
  const { data: updates, isLoading } = useFieldUpdatesQuery();

  return (
    <div className={cn("rounded-lg border border-border bg-card shadow-card flex flex-col", className)}>
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Radio className="h-4 w-4 text-primary" /> Field Updates
        </h2>
        <span className="text-[10px] uppercase tracking-widest text-success flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-success pulse-blue" /> Live
        </span>
      </div>
      <ul className="flex-1 overflow-y-auto max-h-[420px] divide-y divide-border/60">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          updates?.map((u) => (
            <li
              key={u.id}
              className={cn(
                "border-l-4 px-4 py-3 hover:bg-accent/30 transition-colors",
                borderClass[u.kind]
              )}
            >
              <div className="flex items-baseline gap-2 text-xs text-muted-foreground">
                <span className="font-mono">{u.time}</span>
                <span className="font-semibold text-foreground">{u.unit}</span>
              </div>
              <p className="mt-1 text-sm leading-snug">{u.message}</p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
