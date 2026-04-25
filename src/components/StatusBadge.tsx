import { cn } from "@/lib/utils";

type Variant = "red" | "blue" | "green" | "amber" | "muted";

const variants: Record<Variant, string> = {
  red: "bg-primary/15 text-primary border-primary/30",
  blue: "bg-info/15 text-info border-info/30",
  green: "bg-success/15 text-success border-success/30",
  amber: "bg-warning/15 text-warning border-warning/30",
  muted: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({
  children,
  variant = "muted",
  dot = true,
  className,
}: {
  children: React.ReactNode;
  variant?: Variant;
  dot?: boolean;
  className?: string;
}) {
  const dotColor: Record<Variant, string> = {
    red: "bg-primary",
    blue: "bg-info",
    green: "bg-success",
    amber: "bg-warning",
    muted: "bg-muted-foreground",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dotColor[variant])} />}
      {children}
    </span>
  );
}

export function statusVariant(status: string): Variant {
  switch (status) {
    case "On Site":
    case "Open":
    case "Active":
    case "Maintenance":
      return "red";
    case "En Route":
    case "In Progress":
      return "blue";
    case "Returning":
    case "Resolved":
      return "green";
    case "Standby":
    case "Idle":
      return "amber";
    default:
      return "muted";
  }
}
