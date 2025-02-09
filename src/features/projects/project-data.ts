import { supabase } from "../../server/config";
import { projectDataType } from "./project-types";

export const getProjectsAsync = async (
  limit?: number
): Promise<projectDataType[]> => {
  try {
    let query = supabase
      .from("projects")
      .select()
      .order("importance", { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (data) {
      return data;
    } else {
      return [];
    }
  } catch (error) {
    return [];
  }
};
