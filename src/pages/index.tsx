import { GetStaticProps } from "next";
import HomeContents from "../features/home/home-contents";
import {
  fetchHomeAbout,
  getTaglineAsync,
  homeIntroTextData,
} from "../features/home/home-data";

export default function Home({
  tagline,
  homeAbout,
}: {
  tagline: string;
  homeAbout: string;
}) {
  return <HomeContents tagline={tagline} homeAbout={homeAbout} />;
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    const tagline = await getTaglineAsync();
    const homeAbout = await fetchHomeAbout();

    return {
      props: { tagline, homeAbout },
      revalidate: 10,
    };
  } catch (error) {
    return {
      props: {
        tagline: homeIntroTextData,
        homeAbout: "",
      },
      revalidate: 10,
    };
  }
};
