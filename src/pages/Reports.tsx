import { FileBarChart, CheckCircle, Clock, Package, Loader2, X, MapPin, Navigation, Users, Shield, Zap, Info } from "lucide-react";
import { useState } from "react";
import { StatusBadge, statusVariant } from "@/components/StatusBadge";
import { useIncidentsQuery, useSuppliesQuery } from "@/hooks/useQueries";
import { cn } from "@/lib/utils";

const supplyStatusVariant = (s: string): "green" | "amber" | "red" =>
  s === "Sufficient" ? "green" : s === "Low" ? "amber" : "red";

const supplyBarColor = (s: string) =>
  s === "Sufficient" ? "bg-success" : s === "Low" ? "bg-warning" : "bg-primary";

export default function Reports() {
  const { data: incidents, isLoading: incidentsLoading } = useIncidentsQuery();
  const { data: supplies, isLoading: suppliesLoading } = useSuppliesQuery();
  const [viewingReport, setViewingReport] = useState<any>(null);
  const [isViewingDetails, setIsViewingDetails] = useState(false);

  const handleViewReport = (incident: any) => {
    setViewingReport(incident);
    setIsViewingDetails(true);
  };

  const total = incidents?.length || 0;
  const resolved = incidents?.filter((i) => i.status === "Resolved").length || 0;
  const avg = total > 0 ? Math.round(incidents!.reduce((a, b) => a + (b.response_min || 0), 0) / total) : 0;

  // Derive zone stats from incidents
  const zoneCounts: Record<string, number> = {};
  incidents?.forEach(i => {
    const zone = i.location.split(' - ')[0] || 'Unknown';
    zoneCounts[zone] = (zoneCounts[zone] || 0) + 1;
  });
  const zoneStats = Object.entries(zoneCounts).map(([zone, count]) => ({ zone, count }));
  const maxZone = Math.max(...zoneStats.map((z) => z.count), 1);

  const cards = [
    { label: "Total Incidents", value: total, icon: FileBarChart, accent: "text-primary", bg: "bg-primary/10" },
    { label: "Resolved", value: resolved, icon: CheckCircle, accent: "text-success", bg: "bg-success/10" },
    { label: "Avg Response Time", value: `${avg} min`, icon: Clock, accent: "text-info", bg: "bg-info/10" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Incident Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">Performance metrics and incident history</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-border bg-card p-5 shadow-card hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</div>
                <div className="mt-1 text-3xl font-bold">
                  {incidentsLoading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : c.value}
                </div>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${c.bg} ${c.accent}`}>
                <c.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Table */}
        <div className="lg:col-span-2 rounded-lg border border-border bg-card shadow-card">
          <div className="p-4 border-b border-border">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Detailed Reports</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left font-medium">Report ID</th>
                  <th className="px-4 py-3 text-left font-medium">Type</th>
                  <th className="px-4 py-3 text-left font-medium">Location</th>
                  <th className="px-4 py-3 text-left font-medium">Team</th>
                  <th className="px-4 py-3 text-left font-medium">Response</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {incidentsLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-20 text-center text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin inline mb-2" /><br/>
                      Loading reports...
                    </td>
                  </tr>
                ) : (
                  incidents?.map((i) => (
                    <tr key={i.id} className="border-b border-border/60 hover:bg-accent/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-primary">{i.id}</td>
                      <td className="px-4 py-3">{i.type}</td>
                      <td className="px-4 py-3 text-muted-foreground">{i.location}</td>
                      <td className="px-4 py-3 text-muted-foreground">{i.team}</td>
                      <td className="px-4 py-3 tabular-nums">{i.response_min} min</td>
                      <td className="px-4 py-3">
                        <StatusBadge variant={statusVariant(i.status)}>{i.status}</StatusBadge>
                      </td>
                      <td className="px-4 py-3">
                        <button 
                          onClick={() => handleViewReport(i)}
                          className="rounded-md border border-border bg-background px-3 py-1 text-xs font-semibold hover:border-primary/40 hover:text-primary transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bar chart */}
        <div className="rounded-lg border border-border bg-card p-5 shadow-card">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Incidents by Zone</h2>
          <p className="text-xs text-muted-foreground mt-1">Operational Heatmap</p>

          <div className="mt-6 flex items-end justify-between gap-3 h-56">
            {incidentsLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              zoneStats.map((z) => {
                const h = (z.count / maxZone) * 100;
                return (
                  <div key={z.zone} className="flex-1 flex flex-col items-center gap-2">
                    <div className="text-xs font-bold tabular-nums">{z.count}</div>
                    <div className="w-full flex-1 flex items-end">
                      <div
                        className="w-full rounded-t-md bg-gradient-emergency hover:opacity-80 transition-all cursor-pointer"
                        style={{ height: `${Math.max(h, 5)}%` }}
                        title={`${z.zone}: ${z.count}`}
                      />
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground truncate w-full text-center">{z.zone}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Supplies */}
      <div className="rounded-lg border border-border bg-card shadow-card">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" /> Resource & Supply Tracker
          </h2>
          <span className="text-xs text-muted-foreground">Live Database Status</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left font-medium">Zone</th>
                <th className="px-4 py-3 text-right font-medium">Food Packets</th>
                <th className="px-4 py-3 text-right font-medium">Water (L)</th>
                <th className="px-4 py-3 text-right font-medium">Medical Kits</th>
                <th className="px-4 py-3 text-right font-medium">Blankets</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {suppliesLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin inline mb-2" />
                  </td>
                </tr>
              ) : (
                supplies?.map((s) => (
                  <tr key={s.id} className="border-b border-border/60 hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{s.zone}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{s.food.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{s.water.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{s.medical}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{s.blankets}</td>
                    <td className="px-4 py-3">
                      <StatusBadge variant={supplyStatusVariant(s.status)}>{s.status}</StatusBadge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-5 border-t border-border">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Supply Coverage by Zone
          </h3>
          <div className="space-y-2.5">
            {suppliesLoading ? (
              <div className="py-4 flex justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div>
            ) : (
              supplies?.map((s) => (
                <div key={s.id} className="flex items-center gap-3">
                  <div className="w-40 text-xs text-muted-foreground truncate">{s.zone}</div>
                  <div className="flex-1 h-3 rounded-full bg-background border border-border overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", supplyBarColor(s.status))}
                      style={{ width: `${s.coverage}%` }}
                    />
                  </div>
                  <div className="w-12 text-right text-xs font-mono tabular-nums">{s.coverage}%</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Report Detail Modal */}
      {isViewingDetails && viewingReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in overflow-y-auto">
          <div className="w-full max-w-2xl rounded-xl border border-white/10 bg-[#0F172A] shadow-2xl overflow-hidden relative my-8">
            {/* Header with gradient */}
            <div className={`h-1.5 w-full bg-gradient-to-r ${viewingReport.status === 'Resolved' ? 'from-emerald-500 to-teal-500' : 'from-primary to-rose-500'}`} />
            
            <button 
              onClick={() => setIsViewingDetails(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white transition-all z-10"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-primary mb-2">
                    <Zap className="h-3 w-3" /> Incident Archive
                  </div>
                  <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">{viewingReport.id}</h2>
                  <div className="flex items-center gap-3 mt-3">
                    <StatusBadge variant={statusVariant(viewingReport.status)}>{viewingReport.status}</StatusBadge>
                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" /> {viewingReport.location}
                    </span>
                  </div>
                </div>
                <div className="text-right hidden md:block">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Generated Date</div>
                  <div className="text-sm font-mono text-white">{new Date().toLocaleDateString()}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-6">
                  <section>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                      <Info className="h-3 w-3 text-primary" /> Core Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between p-2.5 rounded-lg bg-white/5 border border-white/5">
                        <span className="text-muted-foreground">Incident Type</span>
                        <span className="font-bold text-white">{viewingReport.type}</span>
                      </div>
                      <div className="flex justify-between p-2.5 rounded-lg bg-white/5 border border-white/5">
                        <span className="text-muted-foreground">Responding Unit</span>
                        <span className="font-bold text-white">{viewingReport.team}</span>
                      </div>
                      <div className="flex justify-between p-2.5 rounded-lg bg-white/5 border border-white/5">
                        <span className="text-muted-foreground">Response Duration</span>
                        <span className="font-bold text-emerald-500">{viewingReport.response_min} min</span>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                      <Navigation className="h-3 w-3 text-info" /> Logistics Metrics
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 rounded-lg bg-info/10 border border-info/20 text-center">
                        <div className="text-[9px] uppercase text-info font-bold mb-1">Opt. Distance</div>
                        <div className="text-xl font-bold text-white">{viewingReport.optimized_distance || "3.2"} <span className="text-xs text-muted-foreground">km</span></div>
                      </div>
                      <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-center">
                        <div className="text-[9px] uppercase text-success font-bold mb-1">Survival Rate</div>
                        <div className="text-xl font-bold text-white">100%</div>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="space-y-6">
                  <section className="h-full">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                      <Shield className="h-3 w-3 text-warning" /> Operational Log
                    </h4>
                    <div className="h-[210px] rounded-lg bg-black/40 border border-white/5 p-4 overflow-y-auto space-y-4 custom-scrollbar">
                      {[
                        { time: 'T+0m', msg: 'Emergency signal captured via Satellite' },
                        { time: 'T+2m', msg: 'Alpha Squad dispatched from Zone A' },
                        { time: 'T+8m', msg: 'Personnel arrived at Ground Zero' },
                        { time: 'T+15m', msg: 'Primary evacuation complete' },
                        { time: 'T+22m', msg: 'Incident marked as Resolved' },
                      ].map((log, idx) => (
                        <div key={idx} className="flex gap-3 text-[11px] relative">
                          {idx !== 4 && <div className="absolute left-[13px] top-4 bottom-[-16px] w-[1px] bg-white/10" />}
                          <div className="h-7 w-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-mono text-[9px] text-primary shrink-0 z-10">
                            {log.time}
                          </div>
                          <div className="py-1">
                            <p className="text-gray-300 leading-tight">{log.msg}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>

              {/* Drone Imagery Mock */}
              <section>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                  <Zap className="h-3 w-3 text-emerald-500" /> Aerial Reconnaissance Data
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="aspect-video rounded bg-white/5 border border-white/10 relative overflow-hidden group cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                      <div className="absolute top-2 left-2 text-[8px] font-mono bg-black/60 px-1 py-0.5 rounded text-white flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" /> CAM-0{n}
                      </div>
                      <div className="absolute bottom-2 left-2 text-[8px] font-mono text-white/50 group-hover:text-white transition-colors">
                        GPS: 19.038°N, 72.853°E
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="mt-8 flex gap-3">
                <button className="flex-1 py-3 rounded-lg bg-primary font-bold text-sm text-white shadow-glow-red hover:bg-primary/90 transition-all flex items-center justify-center gap-2 uppercase tracking-widest">
                  <FileBarChart className="h-4 w-4" /> Export Detailed PDF
                </button>
                <button 
                  onClick={() => setIsViewingDetails(false)}
                  className="flex-1 py-3 rounded-lg border border-white/10 bg-white/5 font-bold text-sm text-muted-foreground hover:bg-white/10 transition-all uppercase tracking-widest"
                >
                  Close Archive
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
