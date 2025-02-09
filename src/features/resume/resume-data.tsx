import { ResumeItem } from "./resume-types";

import { supabase } from "../../server/config";

export const getResumeAsync = async (): Promise<ResumeItem[]> => {
  try {
    let query = supabase
      .from("resume")
      .select()
      .eq("type", "work")
      .order("order", { ascending: false });

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

export const getEducationAsync = async (): Promise<ResumeItem[]> => {
  try {
    let query = supabase
      .from("resume")
      .select()
      .eq("type", "education")
      .order("order", { ascending: false });

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
