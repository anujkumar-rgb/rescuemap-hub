import { Users, Truck, AlertTriangle, MapPin, Loader2, X, Clock, Navigation, Activity, Zap, Shield, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
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
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Zap className="h-8 w-8 text-primary animate-pulse" />
            Operations Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time overview of all active rescue operations</p>
        </div>
        
        {/* Mission Pulse Ticker */}
        <div className="flex items-center gap-6 px-6 py-3 rounded-xl bg-background/40 border border-white/5 backdrop-blur-md">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">System Health</span>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-sm font-bold text-white uppercase italic">Optimal</span>
            </div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Personnel</span>
            <span className="text-sm font-bold text-white tracking-tighter">142 <span className="text-[10px] text-muted-foreground">Units</span></span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Alert Level</span>
            <span className="text-sm font-bold text-rose-500 tracking-tighter">LEVEL 3</span>
          </div>
        </div>
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
                  onClick={() => navigate('/teams', { state: { teamId: team.id } })}
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

      {/* Advanced Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-lg border border-border bg-card p-6 shadow-card overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp className="h-24 w-24 text-primary" />
          </div>
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" /> Incidents by Zone
              </h2>
              <p className="text-[11px] text-muted-foreground mt-1 italic">Operational density across metropolitan sectors</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-primary" /> High Priority
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-info" /> Standby
              </div>
            </div>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={
                [
                  { zone: "Dharavi", count: 4, severity: "High" },
                  { zone: "Andheri", count: 7, severity: "Critical" },
                  { zone: "Kurla", count: 5, severity: "Medium" },
                  { zone: "Thane", count: 3, severity: "Low" },
                  { zone: "Borivali", count: 6, severity: "High" },
                  { zone: "Bandra", count: 2, severity: "Low" },
                ]
              }>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="zone" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 border border-white/10 p-3 rounded-lg shadow-2xl backdrop-blur-md">
                          <p className="text-xs font-bold text-white mb-1 uppercase tracking-wider">{payload[0].payload.zone}</p>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                            <p className="text-sm font-black text-primary">{payload[0].value} <span className="text-[10px] text-muted-foreground font-normal">Active Incidents</span></p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="count" 
                  radius={[6, 6, 0, 0]} 
                  barSize={40}
                  onClick={(data) => setSelectedZone(data.zone)}
                  className="cursor-pointer"
                >
                  {
                    [4, 7, 5, 3, 6, 2].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#DC2626' : '#2563EB'} fillOpacity={0.8} className="hover:fill-opacity-100 transition-all" />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-card flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-6">Asset Health</h2>
            <div className="space-y-6">
              {[
                { label: "Connectivity", value: 98, color: "bg-emerald-500" },
                { label: "Fleet Readiness", value: 84, color: "bg-primary" },
                { label: "Battery Avg (Drones)", value: 72, color: "bg-amber-500" },
              ].map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="text-white">{item.value}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${item.color} transition-all duration-1000`} 
                      style={{ width: `${item.value}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-8 p-4 rounded-xl bg-gradient-to-br from-primary/20 to-transparent border border-primary/20">
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Commander's Insight</p>
            <p className="text-xs text-muted-foreground leading-relaxed italic">
              "Deployment density is currently peaking in **Andheri**. Recommend shifting standby units from Bandra."
            </p>
          </div>
        </div>
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
                  {/* Live Feed Simulation */}
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-border bg-black group">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526666923127-b2970f64b422?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center opacity-60 mix-blend-luminosity grayscale group-hover:grayscale-0 transition-all duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                    
                    {/* Camera UI Overlay */}
                    <div className="absolute top-4 left-4 flex flex-col gap-1">
                      <div className="flex items-center gap-2 bg-red-600 px-2 py-0.5 rounded text-[10px] font-bold animate-pulse">
                        <span className="h-1.5 w-1.5 rounded-full bg-white" /> LIVE FEED
                      </div>
                      <div className="text-[10px] font-mono text-white/70">DRONE-04 / 4K ULTRA HD</div>
                    </div>
                    
                    <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
                      <div className="text-[10px] font-mono text-emerald-500">ALT: 120m</div>
                      <div className="text-[10px] font-mono text-emerald-500">SPD: 14km/h</div>
                      <div className="text-[10px] font-mono text-emerald-500">BAT: 84%</div>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                      <div className="text-[10px] font-mono text-white/50">{viewingIncident.location} Sector 4</div>
                      <div className="flex gap-2">
                        <div className="h-10 w-10 rounded border border-white/20 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                          <Activity className="h-4 w-4 text-white" />
                        </div>
                        <div className="h-10 w-10 rounded border border-white/20 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                          <Navigation className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-2 font-bold">
                        <Navigation className="h-3 w-3 text-primary" /> Sector Coordinates
                      </div>
                      <div className="font-mono text-sm text-white">
                        {viewingIncident.lat?.toFixed(4) || "19.0390"}°N / {viewingIncident.lng?.toFixed(4) || "72.8619"}°E
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-2 font-bold">
                        <Users className="h-3 w-3 text-info" /> Field Command
                      </div>
                      <div className="font-semibold text-white">{viewingIncident.team}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                      Operational Log
                    </h4>
                    <div className="space-y-4 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/50">
                      {[
                        { t: "12:04 PM", m: "Unit Alpha initiated ground survey", status: "success" },
                        { t: "11:58 AM", m: "SOS request verified via multi-source logic", status: "primary" },
                        { t: "11:55 AM", m: "Incident logged at Command Center", status: "muted" }
                      ].map((log, i) => (
                        <div key={i} className="flex gap-5 pl-8 relative">
                          <div className={`absolute left-1 top-1.5 h-3 w-3 rounded-full border-2 border-background bg-${log.status === 'success' ? 'emerald-500' : log.status === 'primary' ? 'blue-500' : 'gray-600'}`} />
                          <div className="flex-1 pb-4 border-b border-white/5 last:border-0">
                            <div className="flex justify-between mb-1">
                              <span className="text-[11px] font-bold text-white/90">{log.m}</span>
                              <span className="text-[10px] font-mono text-muted-foreground">{log.t}</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground leading-relaxed">System recorded automatic GPS ping and status transition.</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4 border-t border-white/10">
                    <button 
                      onClick={() => navigate('/map', { state: { incidentId: viewingIncident.id, vehicleId: viewingIncident.vehicleId } })}
                      className="flex-1 flex items-center justify-center gap-3 rounded-lg bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all active:scale-95"
                    >
                      <Navigation className="h-4 w-4" /> Deploy Strategic Route
                    </button>
                    <button className="px-6 rounded-lg border border-border bg-white/5 py-3.5 text-sm font-bold text-white hover:bg-white/10 transition-all">
                      Archive
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Zone Deep-Dive Modal */}
      {selectedZone && (
        <div className="fixed inset-0 z-[110] flex items-center justify-end bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedZone(null)}>
          <div 
            className="h-full w-full max-w-md bg-[#0F172A] border-l border-white/10 shadow-2xl p-8 animate-slide-in-right relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedZone(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-muted-foreground transition-all"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="mb-10">
              <div className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-2">Zone Deep-Dive</div>
              <h2 className="text-4xl font-black text-white">{selectedZone}</h2>
              <div className="flex items-center gap-3 mt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-[#0F172A] bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">U{i}</div>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground font-medium">12 Responders Active</span>
              </div>
            </div>

            <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-300px)] pr-2 custom-scrollbar">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-white/5 pb-2">Active Mission Archive</h3>
              <div className="space-y-3">
                {incidents?.filter(i => i.location.includes(selectedZone) || (selectedZone === "Dharavi" && i.location.includes("Dharavi"))).map(incident => (
                  <div key={incident.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-mono text-primary font-bold">{incident.id}</span>
                      <SeverityBadge severity={severityFromStatus(incident.status)} />
                    </div>
                    <div className="text-sm font-bold text-white group-hover:text-primary transition-colors">{incident.type} Emergency</div>
                    <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-2">
                      <Clock className="h-3 w-3" /> Reported {incident.time}
                    </div>
                  </div>
                ))}
                {(!incidents || incidents.filter(i => i.location.includes(selectedZone) || (selectedZone === "Dharavi" && i.location.includes("Dharavi"))).length === 0) && (
                  <div className="py-10 text-center">
                    <div className="text-xs text-muted-foreground italic">No historical data found for this specific sector.</div>
                  </div>
                )}
              </div>

              <div className="pt-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-white/5 pb-2 mb-4">Resource Allocation</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <div className="text-[10px] uppercase font-bold text-emerald-500 mb-1">Medical</div>
                    <div className="text-xl font-black text-white">4 Units</div>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="text-[10px] uppercase font-bold text-blue-500 mb-1">Extraction</div>
                    <div className="text-xl font-black text-white">2 Units</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-8 left-8 right-8">
              <button className="w-full py-4 rounded-xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all shadow-xl shadow-white/5">
                Generate Sector Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

