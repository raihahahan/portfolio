import { GetStaticProps } from "next";
import AboutContents from "../features/about/about-contents";
import { getAboutDataAsync } from "../features/about/about-data";
import { aboutDataType } from "../features/about/about-types";

export default function About({ about }: { about: aboutDataType[] }) {
  if (typeof about == "string") {
    alert(`Unexpected error while fetching about data -- ${about}`);
    return <AboutContents about={[]} />;
  } else {
    return <AboutContents about={about} />;
  }
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    const about = await getAboutDataAsync();
    return {
      props: { about },
      revalidate: 10,
    };
  } catch (error) {
    return { props: { about: JSON.stringify(error) }, revalidate: 10 };
  }
};
