import "../styles/globals.css";
import type { AppProps } from "next/app";
import { MantineProvider } from "@mantine/core";
// import { ReduxProvider } from "../redux/store";
import { breakpoints } from "../features/theme/theme-data";
import SiteLayout from "../features/site/site-layout";
import { ReduxProvider } from "../redux/store";
import { Analytics } from "@vercel/analytics/next";
import Seo from "../common/components/components-seo";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Seo />
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
            <Analytics />
          </SiteLayout>
        </ReduxProvider>
      </MantineProvider>
    </>
  );
}

export default MyApp;
