import { supabase } from "../../server/config";

export const getProjectsAsync = async () => {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select()
      .order("importance", { ascending: false });
    if (data) {
      return data;
    } else {
      return [];
    }
  } catch (error) {
    return [];
  }
};
