import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { MantineProvider } from "@mantine/core";
// import { ReduxProvider } from "../redux/store";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { makeSiteTitle, siteTitleNames } from "../common/utils/utils-site";
import { routes } from "../common/types/types-site";
import { breakpoints } from "../styles/styles-constants";

function MyApp({ Component, pageProps }: AppProps) {
  const route = useRouter();
  const [siteTitle, setSiteTitle] = useState("Melonbase");

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
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="Welcome to Melonbase." />
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
        {/* <ReduxProvider> */}
        <Component {...pageProps} />
        {/* </ReduxProvider> */}
      </MantineProvider>
    </>
  );
}

export default MyApp;
