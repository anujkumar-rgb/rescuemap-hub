import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/supabase";

export const useTeamsQuery = () => {
  return useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
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
      const { data, error } = await supabase
        .from("supplies")
        .select("*")
        .order("zone", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
};
