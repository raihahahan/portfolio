import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { MantineProvider } from "@mantine/core";
// import { ReduxProvider } from "../redux/store";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { breakpoints } from "../features/theme/theme-data";
import SiteLayout from "../features/site/site-layout";
import { makeSiteTitle, siteTitleNames } from "../features/site/site-utils";
import { routes } from "../features/site/site-types";
import { ReduxProvider } from "../redux/store";

function MyApp({ Component, pageProps }: AppProps) {
  const route = useRouter();
  const [siteTitle, setSiteTitle] = useState("Raihan Rizqullah");

  useEffect(() => {
    setSiteTitle(makeSiteTitle(siteTitleNames[route.pathname as routes]));
  }, [route.pathname]);

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />

        <meta name="description" content="Portfolio site" />
        <meta
          property="og:image"
          content={`https://og-image.vercel.app/${encodeURI(
            siteTitle
          )}.png?theme=light&md=0&fontSize=75px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`}
        />
        <meta name="og:title" content={siteTitle} />
        <title>{siteTitle}</title>
      </Head>
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          breakpoints: {
            xs: breakpoints.xs,
            sm: breakpoints.sm,
            md: breakpoints.md,
            lg: breakpoints.lg,
            xl: breakpoints.xs,
          },
        }}
      >
        <ReduxProvider>
          <SiteLayout>
            <Component {...pageProps} />
          </SiteLayout>
        </ReduxProvider>
      </MantineProvider>
    </>
  );
}

export default MyApp;
