import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Search, Plus, MapPin, Users, Truck, AlertTriangle, Route as RouteIcon, Navigation, Cloud, Thermometer, Wind, Crosshair } from "lucide-react";
import { LiveUserMap } from "@/components/LiveUserMap";
import { StatusBadge, statusVariant } from "@/components/StatusBadge";
import { useTeamsQuery, useIncidentsQuery, useVehiclesQuery, useDronesQuery } from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
// @ts-ignore
import Openrouteservice from 'openrouteservice-js';

type Filter = "all" | "teams" | "vehicles" | "incidents";

const filters: { id: Filter; label: string; icon: any }[] = [
  { id: "all", label: "All", icon: MapPin },
  { id: "teams", label: "Rescue Teams", icon: Users },
  { id: "vehicles", label: "Vehicles", icon: Truck },
  { id: "incidents", label: "Incidents", icon: AlertTriangle },
];

const zoneCoords: Record<string, [number, number]> = {
  "Zone A (Dharavi)": [19.0380, 72.8538],
  "Zone B (Kurla)": [19.0726, 72.8744],
  "Zone C (Andheri)": [19.1136, 72.8697],
  "Zone D (Thane)": [19.2183, 72.9781],
  "Zone E (Borivali)": [19.2307, 72.8567],
};

const floodZones = ["Zone A (Dharavi)", "Zone C (Andheri)"];

export default function LiveMap() {
  const location = useLocation();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const { data: teams } = useTeamsQuery();
  const { data: incidents } = useIncidentsQuery();
  const { data: vehicles } = useVehiclesQuery();
  const { data: drones } = useDronesQuery();
  
  // Route Optimizer State
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  
  // Set default team if none selected
  useEffect(() => {
    if (!selectedTeamId && teams && teams.length > 0) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams, selectedTeamId]);
  const [targetZone, setTargetZone] = useState<string>("Zone B (Kurla)");
  const [apiKey, setApiKey] = useState<string>("");
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [altRouteCoords, setAltRouteCoords] = useState<[number, number][]>([]);
  const [routeInfo, setRouteInfo] = useState<{ dist: number, time: number, isFlood: boolean } | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [weather, setWeather] = useState<any>(null);

  // Handle incoming state from Dashboard
  useEffect(() => {
    if (location.state?.incidentId && location.state?.vehicleId) {
      const vehicle = vehicles?.find(v => v.id === location.state.vehicleId);
      const incident = incidents?.find(i => i.id === location.state.incidentId);
      
      if (vehicle) {
        // Find team associated with this vehicle or just use vehicle as start
        const team = teams?.find(t => t.vehicle === vehicle.type);
        if (team) setSelectedTeamId(team.id);
      }
      
      if (incident) {
        // For simplicity, we'll map incident location to the nearest Zone if needed, 
        // or just use incident coordinates directly if calculateRoute is updated.
        setTargetZone(incident.location);
      }
    }
  }, [location.state, vehicles, incidents, teams]);

  useEffect(() => {
    // Fetch live weather from Open-Meteo for Mumbai
    fetch("https://api.open-meteo.com/v1/forecast?latitude=19.07&longitude=72.87&current_weather=true")
      .then(res => res.json())
      .then(data => {
        setWeather(data.current_weather);
      })
      .catch(err => console.error("Weather fetch error:", err));
  }, []);

  const selectedTeam = teams?.find(t => t.id === selectedTeamId) || teams?.[0];

  const calculateRoute = async () => {
    const isDemo = localStorage.getItem("demo_bypass") === "true";
    
    // Find coordinates
    let startCoord: [number, number] | undefined;
    let endCoord: [number, number] | undefined;

    if (isDemo) {
      const team = teams?.find(t => t.id === selectedTeamId);
      const incident = incidents?.find(i => i.location === targetZone || i.id === location.state?.incidentId);
      
      if (team) {
        // In our mock data, teams have zone-based coords
        startCoord = zoneCoords[team.zone] || zoneCoords["Zone A (Dharavi)"];
      }
      if (incident) {
        endCoord = [incident.lat, incident.lng];
      } else {
        endCoord = zoneCoords[targetZone];
      }
    }

    if (!startCoord || !endCoord) return;
    if (!apiKey && !isDemo) {
      alert("Please enter an OpenRouteService API Key or use Demo Mode.");
      return;
    }

    setIsLoadingRoute(true);
    setRouteCoords([]);
    setAltRouteCoords([]);
    setRouteInfo(null);

    try {
      if (isDemo) {
        // Simulate route for demo mode if no API key
        // Just a straight line with some noise or actual ORS if key exists
        if (apiKey) {
          const Directions = new Openrouteservice.Directions({ api_key: apiKey });
          const response = await Directions.calculate({
            coordinates: [[startCoord[1], startCoord[0]], [endCoord[1], endCoord[0]]],
            profile: 'driving-car',
            format: 'geojson'
          });
          if (response.features && response.features.length > 0) {
            const feature = response.features[0];
            const coords = feature.geometry.coordinates.map((c: any) => [c[1], c[0]] as [number, number]);
            setRouteCoords(coords);
            setRouteInfo({ 
              dist: Number((feature.properties.summary.distance / 1000).toFixed(1)), 
              time: Math.round(feature.properties.summary.duration / 60), 
              isFlood: floodZones.includes(targetZone) 
            });
            return;
          }
        }
        
        // Fallback simulation
        const dist = Math.sqrt(Math.pow(startCoord[0] - endCoord[0], 2) + Math.pow(startCoord[1] - endCoord[1], 2)) * 111;
        setRouteCoords([startCoord, endCoord]);
        setRouteInfo({ dist: Number(dist.toFixed(1)), time: Math.round(dist * 2), isFlood: floodZones.includes(targetZone) });
        
        // If flood zone, create an alternate route
        if (floodZones.includes(targetZone)) {
          setAltRouteCoords([[startCoord[0] + 0.005, startCoord[1] + 0.005], [endCoord[0] + 0.005, endCoord[1] + 0.005]]);
        }
      }
    } catch (err) {
      console.error("Error calculating route:", err);
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const assignRoute = async () => {
    if (!routeInfo || !selectedTeam) return;
    
    const incidentId = location.state?.incidentId;
    if (!incidentId) {
      alert("Please select an incident from the Dashboard first to assign a route.");
      return;
    }

    const isDemo = localStorage.getItem("demo_bypass") === "true";
    if (isDemo) {
      alert(`Route assigned! ${routeInfo.dist} km distance recorded for ${incidentId}.`);
      return;
    }

    try {
      const { error } = await supabase
        .from('incidents')
        .update({
          optimized_distance: routeInfo.dist,
          eta: routeInfo.time,
          status: 'In Progress'
        })
        .eq('id', incidentId);

      if (error) throw error;
      alert("Route successfully assigned and saved to database.");
    } catch (err) {
      console.error("Error assigning route:", err);
      alert("Failed to save assignment.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Control bar */}
      <div className="rounded-lg border border-border bg-card p-3 shadow-card flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search location, zone, or team..."
            className="w-full rounded-md bg-background border border-border pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium border transition-colors",
                filter === f.id
                  ? "bg-primary text-primary-foreground border-primary shadow-glow-red"
                  : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
              )}
            >
              <f.icon className="h-3.5 w-3.5" />
              {f.label}
            </button>
          ))}
          <div className="flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-500 border border-emerald-500/30 ml-2">
            <Crosshair className="h-3.5 w-3.5" />
            Drones Active: {drones?.length || 0}
          </div>
        </div>
        <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 shadow-glow-red transition-opacity">
          <Plus className="h-4 w-4" />
          Add Incident
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 space-y-4">
          {/* Weather Info Bar */}
          {weather && (
            <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 shadow-card flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-blue-400">
                <Cloud className="h-5 w-5" />
                <span className="font-semibold text-sm">Mumbai Live Weather</span>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1.5">
                  <Thermometer className="h-4 w-4 text-muted-foreground" />
                  <span className="font-bold">{weather.temperature}°C</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wind className="h-4 w-4 text-muted-foreground" />
                  <span className="font-bold">{weather.windspeed} km/h</span>
                </div>
              </div>
            </div>
          )}
          
          <LiveUserMap 
            height="600px" 
            routeCoordinates={routeCoords} 
            altRouteCoordinates={altRouteCoords}
          />
          
          {/* Route Info Card */}
          {routeInfo && (
            <div className="rounded-lg border border-border bg-card p-4 shadow-card animate-fade-in flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20 text-blue-500">
                  <Navigation className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Optimized Route Found</h4>
                  <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                    <span><strong className="text-foreground">{routeInfo.dist}</strong> km</span>
                    <span><strong className="text-foreground">{routeInfo.time}</strong> min est.</span>
                  </div>
                </div>
              </div>
              
              {routeInfo.isFlood && (
                <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-4 py-2 text-destructive border border-destructive/20 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <strong>Flood Risk:</strong> Alternate safe route generated (dashed green).
                </div>
              )}
              
              <button 
                onClick={assignRoute}
                className="rounded-md bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-glow-red hover:bg-primary/90 transition-colors"
              >
                Assign This Route
              </button>
            </div>
          )}
        </div>

        {/* Sidebar panels */}
        <div className="space-y-4">
          {/* Drone Control Panel */}
          <div className="rounded-lg border border-border bg-card p-4 shadow-card h-fit border-emerald-500/30">
            <div className="flex items-center gap-2 mb-4">
              <Crosshair className="h-5 w-5 text-emerald-500" />
              <h3 className="text-lg font-bold">Drone Control</h3>
            </div>
            <div className="space-y-3">
              {drones?.map(d => {
                const color = d.battery > 50 ? 'bg-emerald-500' : d.battery > 20 ? 'bg-amber-500' : 'bg-red-500';
                return (
                  <div key={d.id} className="rounded border border-border bg-background p-2.5">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold">{d.id}</span>
                      <span className="text-[10px] text-muted-foreground uppercase">{d.status}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground mb-2 truncate">{d.mission} • {d.city}</div>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full ${color} transition-all`} style={{ width: `${d.battery}%` }} />
                      </div>
                      <span className={`text-[10px] font-bold ${color.replace('bg-', 'text-')}`}>{d.battery}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* AI Route Optimizer Panel */}
          <div className="rounded-lg border border-border bg-card p-4 shadow-card h-fit border-blue-500/30">
            <div className="flex items-center gap-2 mb-4">
              <RouteIcon className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-bold">AI Route Optimizer</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">OpenRouteService API Key</label>
                <input 
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter free API key..."
                  className="w-full rounded-md bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Select Team</label>
                <select 
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="w-full rounded-md bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                >
                  {teams?.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.zone})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Destination Zone</label>
                <select 
                  value={targetZone}
                  onChange={(e) => setTargetZone(e.target.value)}
                  className="w-full rounded-md bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                >
                  {Object.keys(zoneCoords).map(z => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
              </div>

              <button 
                onClick={calculateRoute}
                disabled={isLoadingRoute || (!apiKey && localStorage.getItem("demo_bypass") !== "true")}
                className="w-full rounded-md bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex justify-center items-center gap-2"
              >
                {isLoadingRoute ? (
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Navigation className="h-4 w-4" />
                )}
                Calculate Route
              </button>
            </div>
          </div>

          {/* Selected team panel */}
          <div className="rounded-lg border border-border bg-card p-4 shadow-card h-fit">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Selected Unit</div>
            <h3 className="mt-1 text-xl font-bold">{selectedTeam?.name ?? "Alpha Squad"}</h3>
            <div className="mt-1">
              <StatusBadge variant={statusVariant(selectedTeam?.status ?? "On Site")}>{selectedTeam?.status ?? "On Site"}</StatusBadge>
            </div>

            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Team Leader</dt>
                <dd className="font-medium">{selectedTeam?.leader ?? "Capt. Arjun Mehta"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Members</dt>
                <dd className="font-medium">{selectedTeam?.members ?? 8} personnel</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Vehicle</dt>
                <dd className="font-medium">{selectedTeam?.vehicle ?? "V-01 Ambulance"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Current Zone</dt>
                <dd className="font-medium">{selectedTeam?.zone ?? "Zone A (Dharavi)"}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
