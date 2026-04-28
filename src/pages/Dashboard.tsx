import { Users, Truck, AlertTriangle, MapPin, Loader2, X, Clock, Navigation, Activity } from "lucide-react";
import { IndiaMap } from "@/components/IndiaMap";
import { StatusBadge, statusVariant } from "@/components/StatusBadge";
import { SeverityBadge, severityFromStatus } from "@/components/SeverityBadge";
import { Sparkline } from "@/components/Sparkline";
import { WeatherCard } from "@/components/WeatherCard";
import { FieldUpdates } from "@/components/FieldUpdates";
import { ElapsedTimer } from "@/components/ElapsedTimer";
import { incidentElapsedStart } from "@/data/mock";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTeamsQuery, useIncidentsQuery, useVehiclesQuery } from "@/hooks/useQueries";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/supabase";

const stats = [
  {
    label: "Active Teams",
    value: 12,
    icon: Users,
    accent: "text-primary",
    bg: "bg-primary/10",
    trend: [4, 5, 6, 8, 9, 11, 12],
    trendColor: "text-primary",
  },
  {
    label: "Vehicles Deployed",
    value: 28,
    icon: Truck,
    accent: "text-info",
    bg: "bg-info/10",
    trend: [27, 28, 28, 27, 28, 29, 28],
    trendColor: "text-info",
  },
  {
    label: "Incidents Open",
    value: 7,
    icon: AlertTriangle,
    accent: "text-warning",
    bg: "bg-warning/10",
    trend: [14, 13, 12, 11, 10, 8, 7],
    trendColor: "text-success",
  },
  {
    label: "Areas Covered",
    value: 5,
    icon: MapPin,
    accent: "text-success",
    bg: "bg-success/10",
    trend: [2, 2, 3, 3, 4, 5, 5],
    trendColor: "text-success",
  },
];

export default function Dashboard() {
  const [selected, setSelected] = useState<string | null>(null);
  const [viewingIncident, setViewingIncident] = useState<any>(null);
  const [isLoadingIncident, setIsLoadingIncident] = useState(false);
  const navigate = useNavigate();

  const { data: teams, isLoading: teamsLoading } = useTeamsQuery();
  const { data: incidents, isLoading: incidentsLoading } = useIncidentsQuery();
  const { data: vehicles } = useVehiclesQuery();
  const { session } = useAuth();

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  const handleViewIncident = async (incident: any) => {
    setViewingIncident(incident);
    
    // If in demo mode, don't try to fetch from Supabase to avoid 404s
    const isDemo = localStorage.getItem("demo_bypass") === "true";
    if (isDemo) {
      // Find the vehicle assigned to this incident in mock data
      const assignedVehicle = vehicles?.find(v => v.assignedIncidentId === incident.id);
      const distance = assignedVehicle ? calculateDistance(incident.lat, incident.lng, assignedVehicle.lat, assignedVehicle.lng) : null;
      setViewingIncident({ ...incident, distance, vehicleId: assignedVehicle?.id });
      return;
    }

    setIsLoadingIncident(true);
    try {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .eq('id', incident.id)
        .single();
      
      if (data) {
        // Find assigned vehicle from Supabase (or fallback)
        const { data: vehicleData } = await supabase
          .from('vehicles')
          .select('*')
          .eq('assigned_incident_id', incident.id)
          .single();
        
        const distance = vehicleData ? calculateDistance(data.latitude, data.longitude, vehicleData.latitude, vehicleData.longitude) : null;
        setViewingIncident({ ...incident, ...data, distance, vehicleId: vehicleData?.id });
      }
    } catch (err) {
      console.warn("Using fallback data for incident details");
    } finally {
      setIsLoadingIncident(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-white">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Operations Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time overview of all active rescue operations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-border bg-card p-4 hover:border-primary/40 transition-colors shadow-card"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
                <div className="mt-1 text-3xl font-bold">{s.value}</div>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${s.bg} ${s.accent}`}>
                <s.icon className="h-5 w-5" />
              </div>
            </div>
            <Sparkline points={s.trend} className={`mt-3 ${s.trendColor}`} width={120} height={28} />
          </div>
        ))}
      </div>

      {/* Map + Live Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="mb-2 flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Live Field Map</h2>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-success pulse-blue" />
                Updated 3s ago
              </div>
            </div>
            <WeatherCard />
          </div>
          <IndiaMap height="420px" />
        </div>

        <div className="rounded-lg border border-border bg-card p-4 shadow-card">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Live Team Status</h2>
          {teamsLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ul className="space-y-2">
              {teams?.map((team) => (
                <li
                  key={team.id}
                  onClick={() => setSelected(team.id)}
                  className="flex items-center justify-between rounded-md border border-border bg-background/40 p-3 cursor-pointer hover:border-primary/40 hover:bg-accent/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${
                        team.color === "red" ? "bg-primary" : team.color === "blue" ? "bg-info" : "bg-success"
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{team.name}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{team.zone}</div>
                    </div>
                  </div>
                  <StatusBadge variant={statusVariant(team.status)} dot={false}>
                    {team.status}
                  </StatusBadge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Recent Incidents + Field Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-lg border border-border bg-card shadow-card">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recent Incidents</h2>
            <span className="text-xs text-muted-foreground">Last 24 hours</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left font-medium">Incident ID</th>
                  <th className="px-4 py-3 text-left font-medium">Location</th>
                  <th className="px-4 py-3 text-left font-medium">Type</th>
                  <th className="px-4 py-3 text-left font-medium">Assigned Team</th>
                  <th className="px-4 py-3 text-left font-medium">Severity</th>
                  <th className="px-4 py-3 text-left font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                {incidentsLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center">
                      <Loader2 className="h-5 w-5 animate-spin inline mr-2 text-muted-foreground" />
                      Loading incidents...
                    </td>
                  </tr>
                ) : (
                  incidents?.map((i) => (
                    <tr key={i.id} className="border-b border-border/60 hover:bg-accent/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-primary">{i.id}</td>
                      <td className="px-4 py-3">{i.location}</td>
                      <td className="px-4 py-3 text-muted-foreground">{i.type}</td>
                      <td className="px-4 py-3">{i.team}</td>
                      <td className="px-4 py-3">
                        <SeverityBadge severity={severityFromStatus(i.status)} />
                      </td>
                      <td className="px-4 py-3">
                        <button 
                          onClick={() => handleViewIncident(i)}
                          className="text-xs font-bold text-primary hover:underline"
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

        <FieldUpdates />
      </div>

      {/* Incident Details Modal */}
      {viewingIncident && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-xl rounded-xl border border-border bg-[#1E293B] shadow-2xl overflow-hidden relative">
            <div className="h-1.5 w-full bg-primary" />
            
            <button 
              onClick={() => setViewingIncident(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white transition-all z-10"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-xs font-mono uppercase tracking-widest text-primary mb-1">{viewingIncident.id}</div>
                  <h2 className="text-2xl font-bold">{viewingIncident.type} Emergency</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <SeverityBadge severity={severityFromStatus(viewingIncident.status)} />
                    <span className="text-sm text-muted-foreground">{viewingIncident.location}</span>
                  </div>
                </div>
              </div>

              {isLoadingIncident ? (
                <div className="py-20 flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Fetching incident report...</span>
                </div>
              ) : (
                <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-2">
                        <Navigation className="h-3 w-3" /> Exact Location
                      </div>
                      <div className="font-semibold">{viewingIncident.location}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-2">
                        <Users className="h-3 w-3" /> Assigned Team
                      </div>
                      <div className="font-semibold">{viewingIncident.team}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-2">
                        <Clock className="h-3 w-3" /> Reported At
                      </div>
                      <div className="font-semibold">28 mins ago</div>
                    </div>
                    <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-2">
                        <Truck className="h-3 w-3" /> Vehicle Distance
                      </div>
                      <div className="font-semibold text-primary">
                        {viewingIncident.distance ? `${viewingIncident.distance} km away` : "Calculating..."}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-1">
                        Vehicle: {viewingIncident.vehicleId || "Assigning..."}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-2">
                        <Activity className="h-3 w-3" /> Current Status
                      </div>
                      <div className="font-semibold">{viewingIncident.status}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                      Description
                    </h4>
                    <p className="text-sm text-gray-300 leading-relaxed bg-background/30 p-3 rounded border border-border/30">
                      {viewingIncident.description || "Heavy rainfall causing localized flooding. Multiple residents requesting assistance for evacuation from ground floor premises. No casualties reported so far."}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                      Actions Taken
                    </h4>
                    <div className="space-y-3">
                      {[
                        { t: "12 mins ago", m: "Assigned team Alpha Squad reached the site" },
                        { t: "25 mins ago", m: "SOS request verified by AI Command" },
                        { t: "28 mins ago", m: "Initial incident report logged" }
                      ].map((log, i) => (
                        <div key={i} className="flex gap-3 text-sm">
                          <span className="text-primary font-mono whitespace-nowrap">{log.t}</span>
                          <span className="text-gray-400">{log.m}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={() => navigate('/map', { state: { incidentId: viewingIncident.id, vehicleId: viewingIncident.vehicleId } })}
                      className="flex-1 flex items-center justify-center gap-2 rounded-md bg-secondary py-3 text-sm font-bold text-white shadow-lg hover:bg-secondary/90 transition-colors"
                    >
                      <Navigation className="h-4 w-4" /> View Optimized Route
                    </button>
                    <button className="flex-1 rounded-md border border-border bg-background py-3 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                      Mark as Resolved
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

