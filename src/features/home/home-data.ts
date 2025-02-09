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

interface ILink {
  title: string;
  link: string;
}

export const links: ILink[] = [
  { title: "GitHub", link: process.env.NEXT_PUBLIC_GITHUB ?? "" },
  { title: "Email", link: process.env.NEXT_PUBLIC_EMAIL ?? "" },
  { title: "LinkedIn", link: process.env.NEXT_PUBLIC_LINKEDIN ?? "" },
  { title: "Resume", link: process.env.NEXT_PUBLIC_RESUME ?? "" },
];
