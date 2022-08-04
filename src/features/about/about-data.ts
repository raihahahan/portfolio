import { supabase } from "../../server/config";
import { aboutDataType } from "./about-types";

export const aboutImageSrc = "/images/pixil-icon.png";

export const getAboutDataAsync = async (): Promise<aboutDataType[]> => {
  try {
    const { data, error } = await supabase
      .from("about")
      .select()
      .order("id", { ascending: true });
    if (data) {
      return data;
    } else {
      return [];
    }
  } catch (error) {
    return [];
  }
};
