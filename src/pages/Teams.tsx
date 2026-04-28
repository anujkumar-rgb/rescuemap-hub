import { useMemo, useState } from "react";
import { Search, MapPin, Phone, Users, Loader2, X, Activity, Clock, Navigation } from "lucide-react";
import { StatusBadge, statusVariant } from "@/components/StatusBadge";
import { useTeamsQuery, useVehiclesQuery } from "@/hooks/useQueries";
import { supabase } from "@/supabase";

/*
  SQL TO CREATE TEAMS TABLE IN SUPABASE:
  
  CREATE TABLE teams (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    leader text,
    members_count int DEFAULT 0,
    zone text,
    status text DEFAULT 'Standby',
    location text,
    created_at timestamp DEFAULT now()
  );

  INSERT INTO teams (name, leader, members_count, zone, status, location)
  VALUES
  ('Alpha Squad', 'Rajesh Kumar', 8, 'Zone A (Dharavi)', 'On Site', 'Dharavi, Mumbai'),
  ('Bravo Unit', 'Priya Sharma', 6, 'Zone B (Kurla)', 'En Route', 'Kurla, Mumbai'),
  ('Delta Force', 'Amit Singh', 10, 'Zone C (Andheri)', 'On Site', 'Andheri, Mumbai'),
  ('Eagle Team', 'Sunita Patel', 7, 'Zone D (Thane)', 'Returning', 'Thane'),
  ('Falcon Squad', 'Vikram Mehta', 5, 'Zone E (Borivali)', 'En Route', 'Borivali'),
  ('Griffin Unit', 'Neha Joshi', 9, 'Zone B (Kurla)', 'Standby', 'Kurla, Mumbai');
*/

const zones = ["All Zones", "Zone A (Dharavi)", "Zone B (Kurla)", "Zone C (Andheri)", "Zone D (Thane)", "Zone E (Borivali)"];
const statuses = ["All Status", "On Site", "En Route", "Returning", "Standby"];

export default function Teams() {
  const [q, setQ] = useState("");
  const [zone, setZone] = useState(zones[0]);
  const [status, setStatus] = useState(statuses[0]);
  const [viewingTeam, setViewingTeam] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const { data: teams, isLoading: teamsLoading } = useTeamsQuery();
  const { data: vehicles, isLoading: vehiclesLoading } = useVehiclesQuery();

  const filtered = useMemo(() => {
    if (!teams) return [];
    return teams.filter((t) => {
      if (q && !`${t.name} ${t.leader}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (zone !== zones[0] && t.zone !== zone) return false;
      if (status !== statuses[0] && t.status !== status) return false;
      return true;
    });
  }, [teams, q, zone, status]);

  const handleViewDetails = async (team: any) => {
    setViewingTeam(team);
    
    // If in demo mode, don't try to fetch from Supabase to avoid 404s
    const isDemo = localStorage.getItem("demo_bypass") === "true";
    if (isDemo) return;

    setIsLoadingDetails(true);
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', team.id)
        .single();
      
      if (data) {
        setViewingTeam({ ...team, ...data });
      }
    } catch (err) {
      console.warn("Using fallback data for team details");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-white">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Rescue Teams & Vehicles</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage active units and relief vehicles across all operational zones</p>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-border bg-card p-3 shadow-card grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search team or leader..."
            className="w-full rounded-md bg-background border border-border pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md bg-background border border-border px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={zone}
          onChange={(e) => setZone(e.target.value)}
          className="rounded-md bg-background border border-border px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          {zones.map((z) => <option key={z} value={z}>{z}</option>)}
        </select>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {teamsLoading ? (
          <div className="col-span-full py-20 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {filtered.map((team) => (
              <div
                key={team.id}
                className="rounded-lg border border-border bg-card p-5 shadow-card hover:border-primary/40 hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{team.id}</div>
                    <h3 className="text-lg font-bold mt-0.5 text-white">{team.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Led by {team.leader}</p>
                  </div>
                  <StatusBadge variant={statusVariant(team.status)}>{team.status}</StatusBadge>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span><span className="text-foreground font-medium text-white">{team.members}</span> members</span>
                  </div>
                  <div className="text-muted-foreground">
                    <span className="text-foreground font-medium text-white">{team.vehicle}</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{team.zone}</span>
                  </div>
                </div>

                <div className="mt-5 flex gap-2">
                  <button 
                    onClick={() => handleViewDetails(team)}
                    className="flex-1 rounded-md bg-primary py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                  >
                    View Details
                  </button>
                  <button className="flex items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold text-white hover:border-primary/40 transition-colors">
                    <Phone className="h-3.5 w-3.5" /> Contact
                  </button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full rounded-lg border border-dashed border-border bg-card/40 p-10 text-center text-muted-foreground text-sm">
                No teams match your filters.
              </div>
            )}
          </>
        )}
      </div>

      {/* Vehicles */}
      <div className="rounded-lg border border-border bg-card shadow-card">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Relief Vehicles</h2>
          <span className="text-xs text-muted-foreground">{vehicles?.length || 0} units</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left font-medium">Vehicle ID</th>
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-left font-medium">Driver</th>
                <th className="px-4 py-3 text-left font-medium">Current Location</th>
                <th className="px-4 py-3 text-left font-medium w-48">Fuel Status</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {vehiclesLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin inline mr-2" />
                    Loading vehicles...
                  </td>
                </tr>
              ) : (
                vehicles?.map((v) => {
                  const fuelColor =
                    v.fuel < 25 ? "bg-primary" : v.fuel < 50 ? "bg-warning" : "bg-success";
                  return (
                    <tr key={v.id} className="border-b border-border/60 hover:bg-accent/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-primary">{v.id}</td>
                      <td className="px-4 py-3">{v.type}</td>
                      <td className="px-4 py-3 text-muted-foreground">{v.driver}</td>
                      <td className="px-4 py-3 text-muted-foreground">{v.location}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                            <div className={`h-full ${fuelColor} transition-all`} style={{ width: `${v.fuel}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground tabular-nums w-9 text-right">{v.fuel}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge variant={statusVariant(v.status)}>{v.status}</StatusBadge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Team Details Modal */}
      {viewingTeam && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-xl rounded-xl border border-border bg-[#1E293B] shadow-2xl overflow-hidden relative">
            <div className="h-1.5 w-full bg-primary" />
            
            <button 
              onClick={() => setViewingTeam(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white transition-all z-10"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-xs font-mono uppercase tracking-widest text-primary mb-1">{viewingTeam.id}</div>
                  <h2 className="text-2xl font-bold">{viewingTeam.name}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <StatusBadge variant={statusVariant(viewingTeam.status)}>{viewingTeam.status}</StatusBadge>
                    <span className="text-sm text-muted-foreground">Assigned to {viewingTeam.zone}</span>
                  </div>
                </div>
              </div>

              {isLoadingDetails ? (
                <div className="py-20 flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Syncing from Supabase...</span>
                </div>
              ) : (
                <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-2">
                        <Users className="h-3 w-3" /> Team Leader
                      </div>
                      <div className="font-semibold">{viewingTeam.leader}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-2">
                        <Users className="h-3 w-3" /> Members
                      </div>
                      <div className="font-semibold">{viewingTeam.members} Trained Personnel</div>
                    </div>
                    <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-2">
                        <Navigation className="h-3 w-3" /> Current Location
                      </div>
                      <div className="font-semibold truncate">{viewingTeam.location || viewingTeam.zone}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-2">
                        <Clock className="h-3 w-3" /> Active Since
                      </div>
                      <div className="font-semibold">08:00 AM Today</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                      <Users className="h-3.5 w-3.5" /> Personnel Roster
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                      <div className="flex items-center gap-2 px-2 py-1 rounded bg-white/5">S. Kulkarni (Medic)</div>
                      <div className="flex items-center gap-2 px-2 py-1 rounded bg-white/5">A. Deshpande (Rescue)</div>
                      <div className="flex items-center gap-2 px-2 py-1 rounded bg-white/5">M. Khan (Driver)</div>
                      <div className="flex items-center gap-2 px-2 py-1 rounded bg-white/5">P. Rao (Communications)</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                      <Activity className="h-3.5 w-3.5" /> Recent Activity Log
                    </h4>
                    <div className="space-y-3">
                      {[
                        { t: "10 mins ago", m: "Arrived at current deployment location" },
                        { t: "45 mins ago", m: "Dispatched from regional HQ" },
                        { t: "2 hrs ago", m: "Completed pre-mission equipment check" }
                      ].map((log, i) => (
                        <div key={i} className="flex gap-3 text-sm">
                          <span className="text-primary font-mono whitespace-nowrap">{log.t}</span>
                          <span className="text-gray-400">{log.m}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-4 flex gap-3">
                    <button className="flex-1 rounded-md bg-primary py-2.5 text-sm font-bold shadow-glow-red hover:opacity-90 transition-opacity">
                      Deploy Backup
                    </button>
                    <button className="flex-1 rounded-md border border-border bg-background py-2.5 text-sm font-bold hover:bg-white/5 transition-colors">
                      Send Orders
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

