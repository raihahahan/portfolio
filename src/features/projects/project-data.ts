import { supabase } from "../../server/config";
import { projectDataType } from "./project-types";

export const getProjectsAsync = async (): Promise<projectDataType[]> => {
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
