import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Users, AlertTriangle, MapPin, Truck, Radio } from "lucide-react";

// Fix default marker icons in Vite
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

// All team markers data
const markers = [
  // MAHARASHTRA
  { lat: 19.0390, lng: 72.8619, team: "Alpha Squad", status: "On Site", type: "Flood Response", location: "Mumbai (Dharavi)", state: "Maharashtra", color: "red" },
  { lat: 18.5204, lng: 73.8567, team: "Bravo Unit", status: "En Route", type: "Flood Response", location: "Pune", state: "Maharashtra", color: "blue" },
  { lat: 19.9975, lng: 73.7898, team: "Delta Force", status: "Standby", type: "Flood Response", location: "Nashik", state: "Maharashtra", color: "green" },

  // GUJARAT
  { lat: 23.0225, lng: 72.5714, team: "Eagle Team", status: "On Site", type: "Earthquake Response", location: "Ahmedabad", state: "Gujarat", color: "red" },
  { lat: 21.1702, lng: 72.8311, team: "Falcon Squad", status: "En Route", type: "Flood Response", location: "Surat", state: "Gujarat", color: "blue" },
  { lat: 23.2519, lng: 69.6669, team: "Griffin Unit", status: "On Site", type: "Earthquake Response", location: "Bhuj", state: "Gujarat", color: "red" },

  // RAJASTHAN
  { lat: 26.9124, lng: 75.7873, team: "Hawk Team", status: "Standby", type: "Earthquake Response", location: "Jaipur", state: "Rajasthan", color: "green" },
  { lat: 26.2389, lng: 73.0243, team: "Iron Squad", status: "En Route", type: "Flood Response", location: "Jodhpur", state: "Rajasthan", color: "blue" },

  // UTTAR PRADESH
  { lat: 26.8467, lng: 80.9462, team: "Jaguar Unit", status: "On Site", type: "Flood Response", location: "Lucknow", state: "Uttar Pradesh", color: "red" },
  { lat: 25.3176, lng: 82.9739, team: "Kilo Team", status: "En Route", type: "Flood Response", location: "Varanasi", state: "Uttar Pradesh", color: "blue" },
  { lat: 25.4358, lng: 81.8463, team: "Lima Squad", status: "Standby", type: "Flood Response", location: "Prayagraj", state: "Uttar Pradesh", color: "green" },

  // BIHAR
  { lat: 25.5941, lng: 85.1376, team: "Mike Unit", status: "On Site", type: "Flood Response", location: "Patna", state: "Bihar", color: "red" },
  { lat: 26.1209, lng: 85.3647, team: "November Squad", status: "En Route", type: "Flood Response", location: "Muzaffarpur", state: "Bihar", color: "blue" },

  // WEST BENGAL
  { lat: 22.5726, lng: 88.3639, team: "Oscar Team", status: "On Site", type: "Cyclone Response", location: "Kolkata", state: "West Bengal", color: "red" },
  { lat: 26.7271, lng: 88.3953, team: "Papa Unit", status: "En Route", type: "Cyclone Response", location: "Siliguri", state: "West Bengal", color: "blue" },

  // ODISHA
  { lat: 20.2961, lng: 85.8245, team: "Quebec Squad", status: "On Site", type: "Cyclone Response", location: "Bhubaneswar", state: "Odisha", color: "red" },
  { lat: 19.8135, lng: 85.8312, team: "Romeo Unit", status: "On Site", type: "Cyclone Response", location: "Puri", state: "Odisha", color: "blue" },

  // ANDHRA PRADESH
  { lat: 17.6868, lng: 83.2185, team: "Sierra Team", status: "On Site", type: "Flood Response", location: "Visakhapatnam", state: "Andhra Pradesh", color: "red" },
  { lat: 16.5062, lng: 80.6480, team: "Tango Squad", status: "En Route", type: "Flood Response", location: "Vijayawada", state: "Andhra Pradesh", color: "blue" },

  // TAMIL NADU
  { lat: 13.0827, lng: 80.2707, team: "Uniform Unit", status: "On Site", type: "Flood Response", location: "Chennai", state: "Tamil Nadu", color: "red" },
  { lat: 9.9252, lng: 78.1198, team: "Victor Squad", status: "Standby", type: "Flood Response", location: "Madurai", state: "Tamil Nadu", color: "green" },
  { lat: 11.0168, lng: 76.9558, team: "Whiskey Team", status: "En Route", type: "Flood Response", location: "Coimbatore", state: "Tamil Nadu", color: "blue" },

  // KERALA
  { lat: 8.5241, lng: 76.9366, team: "X-Ray Unit", status: "On Site", type: "Landslide Response", location: "Thiruvananthapuram", state: "Kerala", color: "red" },
  { lat: 9.9312, lng: 76.2673, team: "Yankee Squad", status: "En Route", type: "Landslide Response", location: "Kochi", state: "Kerala", color: "blue" },
  { lat: 11.6854, lng: 76.1320, team: "Zulu Team", status: "On Site", type: "Landslide Response", location: "Wayanad", state: "Kerala", color: "red" },

  // KARNATAKA
  { lat: 12.9716, lng: 77.5946, team: "Alpha-2 Squad", status: "Standby", type: "Flood Response", location: "Bengaluru", state: "Karnataka", color: "green" },
  { lat: 12.2958, lng: 76.6394, team: "Bravo-2 Unit", status: "En Route", type: "Flood Response", location: "Mysuru", state: "Karnataka", color: "blue" },

  // TELANGANA
  { lat: 17.3850, lng: 78.4867, team: "Charlie-2 Team", status: "On Site", type: "Flood Response", location: "Hyderabad", state: "Telangana", color: "red" },

  // MADHYA PRADESH
  { lat: 23.2599, lng: 77.4126, team: "Delta-2 Squad", status: "En Route", type: "Flood Response", location: "Bhopal", state: "Madhya Pradesh", color: "blue" },
  { lat: 22.7196, lng: 75.8577, team: "Echo-2 Unit", status: "Standby", type: "Flood Response", location: "Indore", state: "Madhya Pradesh", color: "green" },

  // CHHATTISGARH
  { lat: 21.2514, lng: 81.6296, team: "Foxtrot-2 Team", status: "En Route", type: "Flood Response", location: "Raipur", state: "Chhattisgarh", color: "blue" },

  // JHARKHAND
  { lat: 23.3441, lng: 85.3096, team: "Golf-2 Squad", status: "On Site", type: "Flood Response", location: "Ranchi", state: "Jharkhand", color: "red" },

  // ASSAM
  { lat: 26.1445, lng: 91.7362, team: "Hotel-2 Unit", status: "On Site", type: "Flood Response", location: "Guwahati", state: "Assam", color: "red" },
  { lat: 24.8333, lng: 92.7789, team: "India-2 Squad", status: "En Route", type: "Flood Response", location: "Silchar", state: "Assam", color: "blue" },

  // MANIPUR
  { lat: 24.8170, lng: 93.9368, team: "Juliet-2 Team", status: "On Site", type: "Landslide Response", location: "Imphal", state: "Manipur", color: "red" },

  // UTTARAKHAND
  { lat: 30.3165, lng: 78.0322, team: "Kilo-2 Squad", status: "On Site", type: "Landslide Response", location: "Dehradun", state: "Uttarakhand", color: "red" },
  { lat: 29.9457, lng: 78.1642, team: "Lima-2 Unit", status: "En Route", type: "Landslide Response", location: "Haridwar", state: "Uttarakhand", color: "blue" },

  // HIMACHAL PRADESH
  { lat: 31.1048, lng: 77.1734, team: "Mike-2 Team", status: "On Site", type: "Landslide Response", location: "Shimla", state: "Himachal Pradesh", color: "red" },
  { lat: 32.2190, lng: 76.3234, team: "November-2 Squad", status: "En Route", type: "Landslide Response", location: "Dharamshala", state: "Himachal Pradesh", color: "blue" },

  // JAMMU & KASHMIR
  { lat: 34.0837, lng: 74.7973, team: "Oscar-2 Unit", status: "On Site", type: "Flood Response", location: "Srinagar", state: "Jammu & Kashmir", color: "red" },
  { lat: 32.7266, lng: 74.8570, team: "Papa-2 Squad", status: "En Route", type: "Flood Response", location: "Jammu", state: "Jammu & Kashmir", color: "blue" },

  // PUNJAB
  { lat: 31.6340, lng: 74.8723, team: "Quebec-2 Team", status: "Standby", type: "Flood Response", location: "Amritsar", state: "Punjab", color: "green" },
  { lat: 30.9010, lng: 75.8573, team: "Romeo-2 Unit", status: "En Route", type: "Flood Response", location: "Ludhiana", state: "Punjab", color: "blue" },

  // HARYANA
  { lat: 28.4089, lng: 77.3178, team: "Sierra-2 Squad", status: "En Route", type: "Flood Response", location: "Faridabad", state: "Haryana", color: "blue" },

  // DELHI
  { lat: 28.6139, lng: 77.2090, team: "Tango-2 Team", status: "On Site", type: "Flood Response", location: "New Delhi", state: "Delhi", color: "red" },

  // ANDAMAN & NICOBAR
  { lat: 11.6234, lng: 92.7265, team: "Uniform-2 Unit", status: "On Site", type: "Cyclone Response", location: "Port Blair", state: "Andaman & Nicobar", color: "red" },

  // LAKSHADWEEP
  { lat: 10.5669, lng: 72.6420, team: "Victor-2 Squad", status: "En Route", type: "Cyclone Response", location: "Kavaratti", state: "Lakshadweep", color: "blue" },

  // NORTHEAST
  { lat: 23.8315, lng: 91.2868, team: "Whiskey-2 Team", status: "On Site", type: "Flood Response", location: "Agartala", state: "Tripura", color: "red" },
  { lat: 23.7307, lng: 92.7173, team: "X-Ray-2 Unit", status: "En Route", type: "Flood Response", location: "Aizawl", state: "Mizoram", color: "blue" },
  { lat: 25.6751, lng: 94.1086, team: "Yankee-2 Squad", status: "Standby", type: "Flood Response", location: "Kohima", state: "Nagaland", color: "green" },
  { lat: 27.3314, lng: 88.6138, team: "Zulu-2 Team", status: "On Site", type: "Landslide Response", location: "Gangtok", state: "Sikkim", color: "red" },
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
          center={[20.5937, 78.9629]}
          zoom={5}
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
                <div className="min-w-[200px] font-sans">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{typeIcon(m.type)}</span>
                    <div>
                      <div className="font-bold text-sm text-white">{m.team}</div>
                      <div className="text-[10px] uppercase tracking-wider text-gray-400">{m.type}</div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusColor(m.status)}`}>
                        {m.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-300">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {m.location}, {m.state}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Last updated: Just now
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
          India • Live Operations
        </div>

        {/* Coordinates */}
        <div className="absolute top-3 right-3 z-[1000] rounded-md bg-card/90 backdrop-blur px-3 py-1.5 text-[10px] font-mono text-muted-foreground border border-border">
          20.59°N · 78.96°E
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
