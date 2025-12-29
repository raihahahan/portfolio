import { supabase } from "../../server/config";
import client from "../../../tina/__generated__/client";

export const homeIntroTextData =
  "Computer Science student with a passion in Software Engineering.";

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

export async function fetchHomeAbout() {
  const aboutRes = await client.queries.aboutConnection();
  if (
    aboutRes === null ||
    aboutRes === undefined ||
    !aboutRes.data ||
    !aboutRes.data.aboutConnection ||
    !aboutRes.data.aboutConnection.edges
  ) {
    throw new Error("Failed to fetch.");
  }
  let about = aboutRes?.data?.aboutConnection?.edges.map((post) => {
    return {
      content: post?.node?.body ?? "",
    };
  });

  if (about.length != 1) return "";

  return about[0].content;
}

interface ILink {
  title: string;
  link: string;
}

export const links: ILink[] = [
  { title: "GitHub", link: process.env.NEXT_PUBLIC_GITHUB ?? "" },
  { title: "Email", link: process.env.NEXT_PUBLIC_EMAIL ?? "" },
  { title: "LinkedIn", link: process.env.NEXT_PUBLIC_LINKEDIN ?? "" },
];
