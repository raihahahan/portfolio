import { supabase } from "../../server/config";

export const homeIntroTextData =
  "A relatively new developer looking to gain experience.";

export const getTaglineAsync = async (): Promise<string> => {
  const { data, error } = await supabase.from("tagline").select("data");
  if (data) {
    if (data.length > 0) {
      return data[0].data;
    } else {
      return homeIntroTextData;
    }
  } else {
    return homeIntroTextData;
  }
};
