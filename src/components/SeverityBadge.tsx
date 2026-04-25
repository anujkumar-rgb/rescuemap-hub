import { AlertOctagon, Activity, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Sev = "Critical" | "Active" | "Resolved";

export function severityFromStatus(status: string): Sev {
  if (status === "Open") return "Critical";
  if (status === "Resolved") return "Resolved";
  return "Active";
}

const map: Record<Sev, { cls: string; Icon: any }> = {
  Critical: { cls: "bg-primary/15 text-primary border-primary/30", Icon: AlertOctagon },
  Active: { cls: "bg-warning/15 text-warning border-warning/30", Icon: Activity },
  Resolved: { cls: "bg-success/15 text-success border-success/30", Icon: CheckCircle2 },
};

export function SeverityBadge({ severity }: { severity: Sev }) {
  const { cls, Icon } = map[severity];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        cls
      )}
    >
      <Icon className="h-3 w-3" />
      {severity}
    </span>
  );
}
