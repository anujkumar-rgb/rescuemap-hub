import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/supabase";
import * as mockData from "@/data/mock";

const isDemo = () => localStorage.getItem("demo_bypass") === "true";

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
