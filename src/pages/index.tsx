import { GetStaticProps } from "next";
import HomeContents from "../features/home/home-contents";
import { getTaglineAsync, homeIntroTextData } from "../features/home/home-data";

export default function Home({ tagline }: { tagline: string }) {
  return <HomeContents tagline={tagline} />;
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    const tagline = await getTaglineAsync();
    return {
      props: { tagline },
      revalidate: 10,
    };
  } catch (error) {
    return {
      props: {
        tagline: homeIntroTextData,
      },
      revalidate: 10,
    };
  }
};
