import { useEffect, useState } from "react";

export function ElapsedTimer({ startMinutesAgo }: { startMinutesAgo: number }) {
  const [seconds, setSeconds] = useState(startMinutesAgo * 60);
  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return (
    <span className="font-mono tabular-nums text-foreground">
      {h}h {m.toString().padStart(2, "0")}m
    </span>
  );
}
