import { GetStaticProps } from "next";
import Seo, { DEFAULT_DESCRIPTION } from "../common/components/components-seo";
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
  return (
    <>
      <Seo
        description={DEFAULT_DESCRIPTION}
        path="/"
        keywords={[
          "Raihan Rizqullah",
          "software engineer",
          "portfolio",
          "distributed systems",
          "backend engineer",
          "mobile apps",
          "technical blog",
        ]}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Raihan Rizqullah",
          url: "https://mraihan.dev",
          image: "https://mraihan.dev/images/bg-component-light-lg-final.png",
          sameAs: [
            process.env.NEXT_PUBLIC_GITHUB,
            process.env.NEXT_PUBLIC_LINKEDIN,
          ].filter(Boolean),
          jobTitle: "Software Engineer",
        }}
      />
      <HomeContents tagline={tagline} homeAbout={homeAbout} />
    </>
  );
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
