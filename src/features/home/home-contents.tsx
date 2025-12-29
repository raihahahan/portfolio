import HomeContentLayout from "./home-layout";
import { ContentSection } from "../blog/blog-components";
import Head from "next/head";

export default function HomeContents({
  tagline,
  homeAbout,
}: {
  tagline: string;
  homeAbout: string;
}) {
  return (
    <>
      <Head>
        {/* Tailwind CDN */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.7/tailwind.min.css"
          integrity="sha512-y6ZMKFUQrn+UUEVoqYe8ApScqbjuhjqzTuwUMEGMDuhS2niI8KA3vhH2LenreqJXQS+iIXVTRL2iaNfJbDNA1Q=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </Head>
      <HomeContentLayout
        id="ABOUT"
        headerTitle="Raihan Rizqullah"
        headerDescription={tagline}
      >
        {/* <FilmStrip /> */}
        <div>
          <ContentSection content={homeAbout} min_read={0}></ContentSection>
        </div>
      </HomeContentLayout>
    </>
  );
}
