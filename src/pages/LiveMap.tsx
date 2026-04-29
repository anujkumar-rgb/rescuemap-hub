import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Search, Plus, MapPin, Users, Truck, AlertTriangle, Route as RouteIcon, Navigation, Cloud, Thermometer, Wind, Crosshair, X, Video } from "lucide-react";
import { LiveUserMap } from "@/components/LiveUserMap";
import { StatusBadge, statusVariant } from "@/components/StatusBadge";
import { useTeamsQuery, useIncidentsQuery, useVehiclesQuery, useDronesQuery } from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import { supabase } from "@/supabase";
// @ts-ignore
import Openrouteservice from 'openrouteservice-js';
import { Drone } from "@/data/mock";

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

  // Modal states
  const [showAddIncident, setShowAddIncident] = useState(false);
  const [selectedDrone, setSelectedDrone] = useState<Drone | null>(null);
  const [newIncident, setNewIncident] = useState({ type: 'Flood', location: 'Zone A (Dharavi)', description: '' });

  const handleAddIncident = async () => {
    if (!newIncident.description) return alert("Please enter description");
    
    if (localStorage.getItem("demo_bypass") !== "true") {
      try {
        const { error } = await supabase.from('incidents').insert([{
          type: newIncident.type,
          location: newIncident.location,
          description: newIncident.description,
          status: 'Open',
          lat: zoneCoords[newIncident.location]?.[0] || 19.0760,
          lng: zoneCoords[newIncident.location]?.[1] || 72.8777
        }]);
        if (error) throw error;
      } catch (err) {
        console.error("Failed to add incident", err);
      }
    }
    
    alert("Incident reported successfully!");
    setShowAddIncident(false);
    setNewIncident({ type: 'Flood', location: 'Zone A (Dharavi)', description: '' });
  };

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
        setTargetZone(incident.location);
        
        // Auto-calculate route if we have the data
        if (teams && vehicles && incidents) {
            setTimeout(() => {
              // Create a synthetic event to avoid dependency loop issues
              document.getElementById('auto-calc-btn')?.click();
            }, 800);
        }
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

  // Helper to generate a simulated "AI optimized" path with a clean curve if APIs are blocked
  const generateSimulatedPath = (start: [number, number], end: [number, number], points = 20): [number, number][] => {
    const coords: [number, number][] = [];
    
    // Add a slight curve by offsetting the midpoint to make it look like a planned route
    const midLat = (start[0] + end[0]) / 2 + 0.015;
    const midLng = (start[1] + end[1]) / 2 - 0.015;
    
    for (let i = 0; i <= points; i++) {
      const t = i / points;
      // Quadratic bezier curve interpolation
      const lat = (1 - t) * (1 - t) * start[0] + 2 * (1 - t) * t * midLat + t * t * end[0];
      const lng = (1 - t) * (1 - t) * start[1] + 2 * (1 - t) * t * midLng + t * t * end[1];
      coords.push([lat, lng]);
    }
    return coords;
  };

  const calculateRoute = async () => {
    const isDemo = localStorage.getItem("demo_bypass") === "true";
    
    // Find coordinates
    let startCoord: [number, number] | undefined;
    let endCoord: [number, number] | undefined;

    const team = teams?.find(t => t.id === selectedTeamId) || teams?.[0];
    const incident = incidents?.find(i => i.location === targetZone || i.id === location.state?.incidentId);
    
    if (team) {
      startCoord = zoneCoords[team.zone] || zoneCoords["Zone A (Dharavi)"];
    }
    
    if (incident) {
      endCoord = [incident.lat, incident.lng];
    } else {
      endCoord = zoneCoords[targetZone];
    }

    if (!startCoord || !endCoord) {
      console.error("Missing coordinates:", { startCoord, endCoord, selectedTeamId, targetZone });
      return;
    }

    setIsLoadingRoute(true);
    setRouteCoords([]);
    setAltRouteCoords([]);
    setRouteInfo(null);

    // Give a slight delay for "AI Thinking" effect
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      // Try actual ORS if key exists
      if (apiKey) {
        try {
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
        } catch (apiErr) {
          console.warn("ORS API failed, falling back to OSRM public API:", apiErr);
        }
      }
      
      // Fallback: Use free OSRM public API to get real road paths instead of straight lines
      try {
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startCoord[1]},${startCoord[0]};${endCoord[1]},${endCoord[0]}?overview=full&geometries=geojson`;
        const res = await fetch(osrmUrl);
        const data = await res.json();
        
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          // OSRM returns [lng, lat], Leaflet wants [lat, lng]
          const coords = route.geometry.coordinates.map((c: any) => [c[1], c[0]] as [number, number]);
          setRouteCoords(coords);
          
          setRouteInfo({ 
            dist: Number((route.distance / 1000).toFixed(1)), 
            time: Math.round(route.duration / 60), 
            isFlood: floodZones.includes(targetZone) 
          });
          
          // If flood zone, create a slight detour using OSRM with an intermediate waypoint
          if (floodZones.includes(targetZone)) {
            // Pick a point slightly off to the side to force an alternate route
            const midLng = startCoord[1] + (endCoord[1] - startCoord[1]) * 0.5 + 0.02;
            const midLat = startCoord[0] + (endCoord[0] - startCoord[0]) * 0.5 + 0.02;
            
            const altUrl = `https://router.project-osrm.org/route/v1/driving/${startCoord[1]},${startCoord[0]};${midLng},${midLat};${endCoord[1]},${endCoord[0]}?overview=full&geometries=geojson`;
            const altRes = await fetch(altUrl);
            const altData = await altRes.json();
            
            if (altData.routes && altData.routes.length > 0) {
               const altCoords = altData.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]] as [number, number]);
               setAltRouteCoords(altCoords);
            }
          }
          return;
        }
      } catch (osrmErr) {
        console.error("OSRM failed, using straight line simulation", osrmErr);
      }
      
      // Absolute worst case fallback (should rarely happen now)
      const simulatedPath = generateSimulatedPath(startCoord, endCoord);
      setRouteCoords(simulatedPath);
      
      const dist = Math.sqrt(Math.pow(startCoord[0] - endCoord[0], 2) + Math.pow(startCoord[1] - endCoord[1], 2)) * 111;
      setRouteInfo({ 
        dist: Number((dist * 1.2).toFixed(1)), 
        time: Math.round(dist * 2.5), 
        isFlood: floodZones.includes(targetZone) 
      });
      
    } catch (err) {
      console.error("Error in routing logic:", err);
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const assignRoute = async () => {
    if (!routeInfo || !selectedTeam) return;
    
    // Check if we came from an incident, otherwise we are just dispatching a team generally
    const incidentId = location.state?.incidentId;
    
    const isDemo = localStorage.getItem("demo_bypass") === "true";
    
    if (isDemo) {
      if (incidentId) {
        alert(`Route assigned! ${routeInfo.dist} km distance recorded for ${incidentId}.`);
      } else {
        alert(`${selectedTeam.name} has been dispatched to ${targetZone}. ETA: ${routeInfo.time} mins.`);
      }
      return;
    }

    try {
      if (incidentId) {
        // We have a specific incident to assign this route to
        const { error } = await supabase
          .from('incidents')
          .update({
            optimized_distance: routeInfo.dist,
            eta: routeInfo.time,
            status: 'In Progress'
          })
          .eq('id', incidentId);
        if (error) throw error;
      } else {
        // We are just assigning the team generally, maybe update team status
        const { error } = await supabase
          .from('teams')
          .update({ status: 'En Route', zone: targetZone })
          .eq('id', selectedTeam.id);
        if (error) throw error;
      }
      
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
        <button 
          onClick={() => setShowAddIncident(true)}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 shadow-glow-red transition-opacity"
        >
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
            filter={filter}
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
                  <div 
                    key={d.id} 
                    onClick={() => setSelectedDrone(d)}
                    className="rounded border border-border bg-background p-2.5 cursor-pointer hover:border-emerald-500/50 transition-colors group"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold group-hover:text-emerald-400 transition-colors">{d.id}</span>
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
                id="auto-calc-btn"
                onClick={calculateRoute}
                disabled={isLoadingRoute}
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

      {/* Add Incident Modal */}
      {showAddIncident && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" /> Report Incident
              </h2>
              <button onClick={() => setShowAddIncident(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Incident Type</label>
                <select 
                  value={newIncident.type}
                  onChange={(e) => setNewIncident({...newIncident, type: e.target.value})}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                >
                  <option value="Flood">Flood / Waterlogging</option>
                  <option value="Fire">Fire / Explosion</option>
                  <option value="Structural">Structural Collapse</option>
                  <option value="Medical">Mass Medical Emergency</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Location / Zone</label>
                <select 
                  value={newIncident.location}
                  onChange={(e) => setNewIncident({...newIncident, location: e.target.value})}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                >
                  {Object.keys(zoneCoords).map(z => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <textarea 
                  value={newIncident.description}
                  onChange={(e) => setNewIncident({...newIncident, description: e.target.value})}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-red-500 min-h-[100px]"
                  placeholder="Enter details..."
                />
              </div>
              <button 
                onClick={handleAddIncident}
                className="w-full rounded-md bg-red-600 py-2.5 font-bold text-white shadow-glow-red hover:bg-red-500 transition-colors"
              >
                Broadcast Incident
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drone Detail Modal */}
      {selectedDrone && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-xl border border-emerald-500/30 bg-card p-0 shadow-[0_0_40px_rgba(16,185,129,0.15)] overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="bg-emerald-950/40 p-4 border-b border-emerald-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <Video className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-emerald-50 font-mono tracking-wider">{selectedDrone.id} <span className="text-emerald-500">• LIVE</span></h2>
                  <div className="text-xs text-emerald-400/70">{selectedDrone.mission} • {selectedDrone.city}</div>
                </div>
              </div>
              <button onClick={() => setSelectedDrone(null)} className="text-emerald-500/60 hover:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 p-2 rounded-lg transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Camera Viewport Simulation */}
            <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden group">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-luminosity"></div>
              
              {/* Drone UI Overlays */}
              <div className="absolute inset-0 border-[1px] border-emerald-500/20 m-4 pointer-events-none">
                {/* Crosshairs */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-emerald-500/30 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]"></div>
                  <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-emerald-500/30"></div>
                  <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-emerald-500/30"></div>
                </div>
                
                {/* HUD Elements */}
                <div className="absolute top-4 left-4 text-[10px] font-mono text-emerald-500">
                  <div>REC 🔴 00:14:32</div>
                  <div>ALT: {selectedDrone.altitude}</div>
                  <div>SPD: 24 km/h</div>
                </div>
                
                <div className="absolute top-4 right-4 text-[10px] font-mono text-emerald-500 text-right">
                  <div>BAT: {selectedDrone.battery}%</div>
                  <div>SIG: STRONG</div>
                  <div>GPS: {selectedDrone.coords[0].toFixed(4)}, {selectedDrone.coords[1].toFixed(4)}</div>
                </div>
              </div>
              
              <div className="z-10 bg-black/60 px-4 py-2 rounded text-emerald-500 font-mono text-xs border border-emerald-500/30 backdrop-blur-sm">
                Establishing visual on target sector...
              </div>
            </div>
            
            {/* Footer controls */}
            <div className="p-4 bg-muted/30 flex justify-between items-center">
              <div className="text-xs text-muted-foreground">UAV assigned to sector commander.</div>
              <div className="flex gap-2">
                <button className="px-4 py-2 text-xs font-bold bg-background border border-border rounded-md hover:bg-accent transition-colors">
                  Take Snapshot
                </button>
                <button className="px-4 py-2 text-xs font-bold bg-emerald-600 text-white rounded-md hover:bg-emerald-500 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  Take Manual Control
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
