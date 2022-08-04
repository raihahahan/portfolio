import { supabase } from "../../server/config";

export const getPrivacyPolicyAsync = async (): Promise<string> => {
  const { data, error } = await supabase.from("privacy-policy").select("data");
  if (data) {
    if (data.length > 0) {
      return data[0].data;
    } else {
      return "Error while fetching privacy policy.";
    }
  } else {
    return "Error while fetching privacy policy.";
  }
};
