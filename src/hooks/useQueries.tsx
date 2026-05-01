import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/supabase";
import * as mockData from "@/data/mock";

const isDemo = () => {
  return localStorage.getItem("demo_bypass") === "true";
};

export const useTeamsQuery = () => {
  return useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      if (isDemo()) return mockData.teams;
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
};

export const useIncidentsQuery = () => {
  return useQuery({
    queryKey: ["incidents"],
    queryFn: async () => {
      if (isDemo()) return mockData.incidents;
      const { data, error } = await supabase
        .from("incidents")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useVehiclesQuery = () => {
  return useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      if (isDemo()) return mockData.vehicles;
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .order("id", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
};

export const useAlertsQuery = () => {
  return useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      if (isDemo()) return mockData.alerts;
      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useFieldUpdatesQuery = () => {
  return useQuery({
    queryKey: ["field_updates"],
    queryFn: async () => {
      if (isDemo()) return mockData.fieldUpdates;
      const { data, error } = await supabase
        .from("field_updates")
        .select("*")
        .order("time", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useSuppliesQuery = () => {
  return useQuery({
    queryKey: ["supplies"],
    queryFn: async () => {
      if (isDemo()) return mockData.supplies;
      const { data, error } = await supabase
        .from("supplies")
        .select("*")
        .order("zone", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
};

export const useVolunteersQuery = () => {
  return useQuery({
    queryKey: ["volunteers"],
    queryFn: async () => {
      if (isDemo()) return mockData.volunteers;
      const { data, error } = await supabase
        .from("volunteers")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};
export const useDronesQuery = () => {
  return useQuery({
    queryKey: ["drones"],
    queryFn: async () => {
      if (isDemo()) return mockData.drones;
      const { data, error } = await supabase
        .from("drones")
        .select("*")
        .order("id", { ascending: true });
      if (error) throw error;
      return data.map((d: any) => ({
        ...d,
        coords: [d.latitude, d.longitude] as [number, number]
      }));
    },
  });
};

export const useRiskPointsQuery = () => {
  return useQuery({
    queryKey: ["risk_points"],
    queryFn: async () => {
      if (isDemo()) return [
        [19.0760, 72.8777, 1.0],
        [13.0827, 80.2707, 1.0],
        [22.5726, 88.3639, 1.0],
        [26.1445, 91.7362, 1.0],
        [20.2961, 85.8245, 1.0],
        [17.3850, 78.4867, 0.6],
        [25.5941, 85.1376, 0.6],
        [30.3165, 78.0322, 0.6],
        [24.8170, 93.9368, 0.6],
        [26.9124, 75.7873, 0.3],
        [12.9716, 77.5946, 0.3],
        [23.2599, 77.4126, 0.3],
      ] as [number, number, number][];
      
      const { data, error } = await supabase
        .from("risk_points")
        .select("*");
      if (error) throw error;
      return data.map((p: any) => [p.latitude, p.longitude, p.intensity] as [number, number, number]);
    },
  });
};
