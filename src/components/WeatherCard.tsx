import { Wind, CloudRain, Eye, Waves } from "lucide-react";

export function WeatherCard() {
  const items = [
    { icon: Wind, label: "Wind", value: "18 km/h" },
    { icon: CloudRain, label: "Rain", value: "72 mm" },
    { icon: Eye, label: "Visibility", value: "2.1 km" },
  ];
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-card">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
        Current Weather — Mumbai Metro
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
        {items.map((i) => (
          <div key={i.label} className="flex items-center gap-1.5 text-muted-foreground">
            <i.icon className="h-3.5 w-3.5" />
            <span className="font-medium">{i.label}:</span>
            <span className="text-foreground">{i.value}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <Waves className="h-3.5 w-3.5 text-primary" />
          <span className="font-medium text-muted-foreground">Flood Risk:</span>
          <span className="inline-flex items-center rounded-full bg-primary/15 text-primary border border-primary/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
            HIGH
          </span>
        </div>
      </div>
    </div>
  );
}
