import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Users, AlertTriangle, MapPin, Truck, Radio, Clock } from "lucide-react";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom colored marker icons using SVG data URIs
const createColoredIcon = (color: string, isActive: boolean) => {
  const colors: Record<string, string> = {
    red: "#DC2626",
    blue: "#3B82F6",
    green: "#22C55E",
  };
  const fill = colors[color] || colors.red;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="28" height="40">
      <defs>
        <filter id="shadow-filter" x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="black" flood-opacity="0.4"/>
        </filter>
      </defs>
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="${fill}" filter="url(#shadow-filter)" stroke="white" stroke-opacity="0.3" stroke-width="0.5"/>
      <circle cx="12" cy="11" r="5" fill="white" opacity="0.9"/>
      <circle cx="12" cy="11" r="3" fill="${fill}"/>
    </svg>`;

  return L.divIcon({
    html: `<div class="custom-marker ${isActive ? "marker-pulse" : ""}">${svg}</div>`,
    className: "custom-marker-container",
    iconSize: [28, 40],
    iconAnchor: [14, 40],
    popupAnchor: [0, -42],
  });
};

// Active Mumbai Metro Operational Zones
const markers = [
  { lat: 19.0380, lng: 72.8538, team: "Alpha Squad", status: "On Site", type: "Flood Response", location: "Dharavi", state: "Zone A", color: "red" },
  { lat: 19.0726, lng: 72.8744, team: "Bravo Unit", status: "En Route", type: "Flood Response", location: "Kurla", state: "Zone B", color: "blue" },
  { lat: 19.1136, lng: 72.8697, team: "Delta Force", status: "On Site", type: "Medical Emergency", location: "Andheri", state: "Zone C", color: "red" },
  { lat: 19.2183, lng: 72.9781, team: "Eagle Team", status: "Returning", type: "Structural Collapse", location: "Thane", state: "Zone D", color: "green" },
  { lat: 19.2307, lng: 72.8567, team: "Falcon Squad", status: "En Route", type: "Flood Response", location: "Borivali", state: "Zone E", color: "blue" },
  { lat: 19.0680, lng: 72.8800, team: "Griffin Unit", status: "Standby", type: "Rapid Deployment", location: "Kurla East", state: "Zone B", color: "green" },
  { lat: 19.0200, lng: 72.8400, team: "Hawk Team", status: "On Site", type: "Fire Emergency", location: "Dadar", state: "Zone A", color: "red" },
  { lat: 19.1300, lng: 72.8900, team: "Iron Squad", status: "En Route", type: "Traffic Incident", location: "Powai", state: "Zone C", color: "blue" },
];

// Stats
const totalTeams = markers.length;
const activeEmergencies = markers.filter((m) => m.color === "red").length;
const statesCovered = new Set(markers.map((m) => m.state)).size;
const enRoute = markers.filter((m) => m.color === "blue").length;

// Status badge color helper
const statusColor = (status: string) => {
  if (status === "On Site") return "bg-red-500/20 text-red-400 border-red-500/30";
  if (status === "En Route") return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  return "bg-green-500/20 text-green-400 border-green-500/30";
};

// Type icon helper
const typeIcon = (type: string) => {
  if (type.includes("Flood")) return "🌊";
  if (type.includes("Cyclone")) return "🌀";
  if (type.includes("Earthquake")) return "⚡";
  if (type.includes("Landslide")) return "⛰️";
  return "🚨";
};

// Map invalidation on mount
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 100);
  }, [map]);
  return null;
}

interface IndiaMapProps {
  className?: string;
  height?: string;
}

export function IndiaMap({ className = "", height = "550px" }: IndiaMapProps) {
  const navigate = useNavigate();
  return (
    <div className={className}>
      {/* Counter bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: "Total Teams Deployed", value: totalTeams, icon: Users, color: "text-primary", bg: "bg-primary/10" },
          { label: "Active Emergencies", value: activeEmergencies, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
          { label: "States Covered", value: statesCovered, icon: MapPin, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Vehicles En Route", value: enRoute, icon: Truck, color: "text-blue-500", bg: "bg-blue-500/10" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-card/80 backdrop-blur p-3 flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.bg} ${s.color} flex-shrink-0`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xl font-bold">{s.value}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Map container */}
      <div className="relative rounded-lg border border-border overflow-hidden shadow-card" style={{ height }}>
        <MapContainer
          center={[19.1000, 72.8800]}
          zoom={11}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
          className="z-0"
        >
          <MapResizer />
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {markers.map((m, i) => (
            <Marker
              key={`${m.team}-${i}`}
              position={[m.lat, m.lng]}
              icon={createColoredIcon(m.color, m.color === "red")}
            >
              <Popup className="dark-popup">
                <div className="min-w-[240px] font-sans p-1">
                  <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/10">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-xl">
                      {typeIcon(m.type)}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white">{m.team}</div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{m.type} Unit</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Current Status</span>
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusColor(m.status)}`}>
                        {m.status}
                      </span>
                    </div>
                    
                    <div className="flex items-start gap-2.5 text-xs text-gray-300">
                      <MapPin className="h-3.5 w-3.5 text-primary mt-0.5" />
                      <div>
                        <div className="font-medium">{m.location}</div>
                        <div className="text-[10px] text-muted-foreground">{m.state}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 text-[10px] text-gray-500 bg-white/5 p-2 rounded">
                      <Clock className="h-3 w-3" />
                      <span>Last sync: {Math.floor(Math.random() * 5) + 1} minutes ago</span>
                    </div>
                    
                    <div className="pt-2">
                      <button 
                        onClick={() => navigate('/teams', { state: { teamId: m.team } })}
                        className="w-full rounded bg-primary py-2 text-[11px] font-bold text-white shadow-glow-red hover:opacity-90 transition-all flex items-center justify-center gap-2"
                      >
                        <Users className="h-3 w-3" />
                        View Deployment Details
                      </button>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Live indicator */}
        <div className="absolute top-3 left-3 z-[1000] rounded-md bg-card/90 backdrop-blur px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground border border-border flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          Mumbai Metro • Live Operations
        </div>

        {/* Coordinates */}
        <div className="absolute top-3 right-3 z-[1000] rounded-md bg-card/90 backdrop-blur px-3 py-1.5 text-[10px] font-mono text-muted-foreground border border-border">
          19.10°N · 72.88°E
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-[1000] rounded-lg border border-border bg-card/90 backdrop-blur p-3 shadow-card">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-bold">Legend</div>
          <ul className="space-y-1.5 text-xs">
            <li className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(220,38,38,0.5)]" />
              <span className="text-gray-300">Active Emergency</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.5)]" />
              <span className="text-gray-300">En Route</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
              <span className="text-gray-300">Standby</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
