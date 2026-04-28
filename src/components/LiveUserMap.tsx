import { useEffect, useState } from "react";
import { LocateFixed, Flame, Crosshair } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

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

import { Drone } from "@/data/mock";
import { useDronesQuery, useRiskPointsQuery } from "@/hooks/useQueries";

const droneIcon = L.divIcon({
  className: "bg-transparent",
  html: `
    <div class="relative flex h-8 w-8 items-center justify-center">
      <div class="absolute inset-0 rounded-full border-2 border-emerald-500 animate-[spin_3s_linear_infinite] border-t-transparent"></div>
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2v2"></path><path d="M12 20v2"></path><path d="M2 12h2"></path><path d="M20 12h2"></path>
        <circle cx="12" cy="12" r="6"></circle>
      </svg>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const userIcon = L.divIcon({
  className: "bg-transparent",
  html: `
    <div class="relative flex h-6 w-6 items-center justify-center">
      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
      <span class="relative inline-flex rounded-full h-4 w-4 bg-primary border-2 border-white shadow-sm"></span>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});


function HeatmapOverlay({ show }: { show: boolean }) {
  const map = useMap();
  const { data: heatData } = useRiskPointsQuery();
  
  useEffect(() => {
    if (!show || !heatData) return;
    
    // @ts-ignore - leaflet.heat adds L.heatLayer
    const heatLayer = L.heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 10,
      gradient: { 0.3: 'yellow', 0.6: 'orange', 1.0: 'red' }
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, show, heatData]);

  return null;
}

function LocationTracker({ position, setPosition }: { position: L.LatLng | null, setPosition: (pos: L.LatLng) => void }) {
  const map = useMap();
  
  useEffect(() => {
    let watchId: number;
    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const latlng = new L.LatLng(pos.coords.latitude, pos.coords.longitude);
          if (!position) {
             map.setView(latlng, 15);
          }
          setPosition(latlng);
        },
        (error) => {
          console.error("Error getting location:", error);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
    }
    return () => {
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [map, position, setPosition]);

  return position ? (
    <Marker position={position} icon={userIcon}>
      <Popup className="dark-popup font-sans">
        <b>You are here</b><br/>
        Lat: {position.lat.toFixed(4)}<br/>
        Lng: {position.lng.toFixed(4)}
      </Popup>
    </Marker>
  ) : null;
}

// Map invalidation on mount
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 100);
  }, [map]);
  return null;
}


export function LiveUserMap({ 
  className = "", 
  height = "400px",
  routeCoordinates = [],
  altRouteCoordinates = []
}: { 
  className?: string; 
  height?: string;
  routeCoordinates?: [number, number][];
  altRouteCoordinates?: [number, number][];
}) {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [mapRef, setMapRef] = useState<L.Map | null>(null);
  const { data: drones } = useDronesQuery();
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showDrones, setShowDrones] = useState(true);

  const handleRecenter = () => {
    if (mapRef && position) {
      mapRef.setView(position, 15);
    }
  };

  return (
    <div className={`relative w-full rounded-lg overflow-hidden border border-border shadow-card ${className}`} style={{ height }}>
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
        className="z-0"
        ref={setMapRef}
      >
        <MapResizer />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationTracker position={position} setPosition={setPosition} />
        <HeatmapOverlay show={showHeatmap} />
        
        {routeCoordinates.length > 0 && (
          <Polyline positions={routeCoordinates} color="#3b82f6" weight={5} opacity={0.8} />
        )}
        {altRouteCoordinates.length > 0 && (
          <Polyline positions={altRouteCoordinates} color="#10b981" weight={5} opacity={0.8} dashArray="10, 10" />
        )}

        {showDrones && drones?.map((d: Drone) => (
          <Marker key={d.id} position={d.coords} icon={droneIcon}>
            <Popup className="dark-popup font-sans">
              <div className="flex flex-col gap-1 w-48">
                <b className="text-emerald-500 border-b border-border pb-1 mb-1">{d.id}</b>
                <div className="flex justify-between text-xs"><span>Mission:</span> <span className="font-semibold">{d.mission}</span></div>
                <div className="flex justify-between text-xs"><span>Battery:</span> <span className="font-semibold text-emerald-500">{d.battery}%</span></div>
                <div className="flex justify-between text-xs"><span>Altitude:</span> <span className="font-semibold">{d.altitude}</span></div>
                <div className="flex justify-between text-xs"><span>Status:</span> <span className="font-semibold">{d.status}</span></div>
                <div className="text-[9px] text-muted-foreground mt-1 pt-1 border-t border-border">Live since {new Date(d.timestamp).toLocaleTimeString()}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Map Overlays */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <button
          onClick={() => setShowDrones(!showDrones)}
          className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold transition-colors shadow-card ${showDrones ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/50' : 'bg-card text-foreground border border-border hover:bg-accent'}`}
        >
          <Crosshair className={`h-4 w-4 ${showDrones ? 'animate-pulse' : 'text-muted-foreground'}`} />
          Drones {showDrones ? "ON" : "OFF"}
        </button>
        
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold transition-colors shadow-card ${showHeatmap ? 'bg-orange-500 text-white border border-orange-400' : 'bg-card text-foreground border border-border hover:bg-accent'}`}
        >
          <Flame className={`h-4 w-4 ${showHeatmap ? 'animate-pulse text-yellow-300' : 'text-muted-foreground'}`} />
          Heatmap {showHeatmap ? "ON" : "OFF"}
        </button>
      </div>

      {/* Heatmap Legend */}
      {showHeatmap && (
        <div className="absolute bottom-6 left-6 z-[1000] bg-card/95 backdrop-blur-sm border border-border p-3 rounded-lg shadow-card animate-fade-in">
          <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Risk Intensity</h4>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span> High Risk</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]"></span> Medium Risk</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]"></span> Low Risk</div>
          </div>
        </div>
      )}
      
      {position && (
        <button
          onClick={handleRecenter}
          className="absolute bottom-6 right-6 z-[1000] flex items-center justify-center gap-2 rounded-full bg-primary p-3 text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors cursor-pointer"
          title="Re-center to my location"
        >
          <LocateFixed className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
