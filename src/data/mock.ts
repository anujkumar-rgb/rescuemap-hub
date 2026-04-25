export type TeamStatus = "En Route" | "On Site" | "Returning" | "Standby";
export type IncidentStatus = "Open" | "In Progress" | "Resolved";
export type AlertSeverity = "critical" | "warning" | "info";

export interface Team {
  id: string;
  name: string;
  leader: string;
  members: number;
  vehicle: string;
  zone: string;
  status: TeamStatus;
  pin: { x: number; y: number };
  color: "red" | "blue" | "green";
}

export interface Incident {
  id: string;
  location: string;
  type: string;
  team: string;
  status: IncidentStatus;
  time: string;
  responseMin: number;
}

export interface Vehicle {
  id: string;
  type: string;
  driver: string;
  location: string;
  fuel: number;
  status: "Active" | "Idle" | "Maintenance";
}

export interface AlertItem {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  location: string;
  timeAgo: string;
}

export const teams: Team[] = [
  { id: "T-01", name: "Alpha Squad", leader: "Capt. R. Mehta", members: 8, vehicle: "Rescue Van", zone: "Zone A (Dharavi)", status: "On Site", pin: { x: 22, y: 38 }, color: "red" },
  { id: "T-02", name: "Bravo Unit", leader: "Lt. S. Khan", members: 6, vehicle: "Ambulance", zone: "Zone B (Kurla)", status: "En Route", pin: { x: 40, y: 55 }, color: "blue" },
  { id: "T-03", name: "Delta Force", leader: "Capt. A. Nair", members: 10, vehicle: "Fire Truck", zone: "Zone C (Andheri)", status: "On Site", pin: { x: 58, y: 30 }, color: "red" },
  { id: "T-04", name: "Eagle Team", leader: "Lt. P. Verma", members: 5, vehicle: "Helicopter", zone: "Zone D (Thane)", status: "Returning", pin: { x: 75, y: 22 }, color: "green" },
  { id: "T-05", name: "Falcon Squad", leader: "Capt. M. Iyer", members: 7, vehicle: "Boat", zone: "Zone E (Borivali)", status: "En Route", pin: { x: 30, y: 70 }, color: "blue" },
  { id: "T-06", name: "Griffin Unit", leader: "Lt. D. Rao", members: 9, vehicle: "Rescue Van", zone: "Zone B (Kurla)", status: "Standby", pin: { x: 65, y: 65 }, color: "green" },
];

export const incidents: Incident[] = [
  { id: "INC-1043", location: "Dharavi - Sector 4", type: "Flood", team: "Alpha Squad", status: "In Progress", time: "12 min ago", responseMin: 8 },
  { id: "INC-1042", location: "Andheri West", type: "Building Collapse", team: "Delta Force", status: "Open", time: "27 min ago", responseMin: 11 },
  { id: "INC-1041", location: "Kurla East", type: "Medical Emergency", team: "Bravo Unit", status: "In Progress", time: "44 min ago", responseMin: 6 },
  { id: "INC-1040", location: "Thane Junction", type: "Road Block", team: "Eagle Team", status: "Resolved", time: "1 hr ago", responseMin: 14 },
  { id: "INC-1039", location: "Borivali Creek", type: "Flood", team: "Falcon Squad", status: "In Progress", time: "1 hr ago", responseMin: 9 },
  { id: "INC-1038", location: "Andheri MIDC", type: "Fire", team: "Delta Force", status: "Resolved", time: "2 hrs ago", responseMin: 7 },
  { id: "INC-1037", location: "Kurla Depot", type: "Fire", team: "Griffin Unit", status: "Resolved", time: "3 hrs ago", responseMin: 12 },
];

export const vehicles: Vehicle[] = [
  { id: "V-201", type: "Ambulance", driver: "R. Singh", location: "Kurla East", fuel: 78, status: "Active" },
  { id: "V-202", type: "Fire Truck", driver: "K. Patil", location: "Andheri MIDC", fuel: 42, status: "Active" },
  { id: "V-203", type: "Rescue Van", driver: "J. Desai", location: "Dharavi Sec 4", fuel: 91, status: "Active" },
  { id: "V-204", type: "Boat", driver: "S. Pillai", location: "Borivali Creek", fuel: 55, status: "Active" },
  { id: "V-205", type: "Helicopter", driver: "Capt. N. Joshi", location: "Thane Helipad", fuel: 23, status: "Idle" },
  { id: "V-206", type: "Ambulance", driver: "M. Shah", location: "Kurla Depot", fuel: 8, status: "Maintenance" },
];

export const alerts: AlertItem[] = [
  { id: "A-01", severity: "critical", title: "Flash Flood Warning - Dharavi", description: "Water levels rising rapidly near Sector 4. Immediate evacuation of low-lying homes required.", location: "Zone A (Dharavi)", timeAgo: "2 min ago" },
  { id: "A-02", severity: "critical", title: "Building Collapse Reported", description: "3-storey residential building partially collapsed. Civilians possibly trapped under debris.", location: "Andheri West", timeAgo: "18 min ago" },
  { id: "A-03", severity: "warning", title: "Heavy Rainfall Forecast", description: "IMD predicts 200mm+ rainfall over next 6 hours across coastal zones.", location: "All Zones", timeAgo: "35 min ago" },
  { id: "A-04", severity: "warning", title: "Vehicle Fuel Low", description: "Helicopter V-205 fuel at 23%. Refuel before next deployment.", location: "Thane Helipad", timeAgo: "52 min ago" },
  { id: "A-05", severity: "info", title: "Eagle Team Returning to Base", description: "Mission complete at Thane Junction. ETA to base: 22 minutes.", location: "Zone D (Thane)", timeAgo: "1 hr ago" },
  { id: "A-06", severity: "critical", title: "Fire Outbreak - Industrial Area", description: "Chemical fire reported at MIDC complex. Hazmat protocol activated.", location: "Andheri MIDC", timeAgo: "1 hr ago" },
];

export const zoneStats = [
  { zone: "Zone A", count: 18 },
  { zone: "Zone B", count: 11 },
  { zone: "Zone C", count: 24 },
  { zone: "Zone D", count: 7 },
  { zone: "Zone E", count: 14 },
];

export type ZoneRisk = "critical" | "active" | "clear";
export const zoneRisk: Record<string, ZoneRisk> = {
  "Zone A": "critical",
  "Zone B": "active",
  "Zone C": "critical",
  "Zone D": "clear",
  "Zone E": "active",
};

export interface FieldUpdate {
  id: string;
  time: string;
  unit: string;
  message: string;
  kind: "urgent" | "update" | "success";
}

export const fieldUpdates: FieldUpdate[] = [
  { id: "F-06", time: "14:32", unit: "Bravo Unit", message: "Road blocked on SV Road, taking alternate via LBS Marg", kind: "update" },
  { id: "F-05", time: "14:28", unit: "Delta Force", message: "Reached Zone C, 14 survivors found", kind: "success" },
  { id: "F-04", time: "14:21", unit: "Eagle Team", message: "Medical supplies running low, requesting refill", kind: "urgent" },
  { id: "F-03", time: "14:15", unit: "Alpha Squad", message: "Evacuation underway in Dharavi Sector 4, 32 civilians moved", kind: "update" },
  { id: "F-02", time: "14:08", unit: "Falcon Squad", message: "Boat deployed at Borivali Creek, two children rescued", kind: "success" },
  { id: "F-01", time: "13:55", unit: "Griffin Unit", message: "Fuel critical on V-206, returning to depot immediately", kind: "urgent" },
];

export interface SupplyRow {
  zone: string;
  food: number;
  water: number;
  medical: number;
  blankets: number;
  status: "Sufficient" | "Low" | "Critical";
  coverage: number;
}

export const supplies: SupplyRow[] = [
  { zone: "Zone A (Dharavi)", food: 1200, water: 3400, medical: 85, blankets: 540, status: "Low", coverage: 58 },
  { zone: "Zone B (Kurla)", food: 2200, water: 5100, medical: 140, blankets: 820, status: "Sufficient", coverage: 86 },
  { zone: "Zone C (Andheri)", food: 480, water: 1100, medical: 32, blankets: 210, status: "Critical", coverage: 24 },
  { zone: "Zone D (Thane)", food: 1900, water: 4600, medical: 110, blankets: 700, status: "Sufficient", coverage: 78 },
  { zone: "Zone E (Borivali)", food: 980, water: 2700, medical: 64, blankets: 410, status: "Low", coverage: 49 },
];

/* For elapsed timer in incidents — minutes since "now" the incident started */
export const incidentElapsedStart: Record<string, number> = {
  "INC-1043": 12,
  "INC-1042": 27,
  "INC-1041": 44,
  "INC-1040": 60,
  "INC-1039": 73,
  "INC-1038": 122,
  "INC-1037": 184,
};
