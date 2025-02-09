import { createGetInitialProps } from "@mantine/next";
import Document, { Head, Html, Main, NextScript } from "next/document";

const getInitialProps = createGetInitialProps();

export default class _Document extends Document {
  static getInitialProps = getInitialProps;

  render() {
    return (
      <Html>
        <Head />
        <meta
          name="description"
          content="Portfolio site for Raihan Rizqullah"
        />
        <meta
          name="keywords"
          content="nextjs, seo, web development, javascript, portfolio, typescript, python, software engineering, react, react native, ml"
        />
        <meta property="og:title" content="Raihan Rizqullah" />
        <meta
          property="og:description"
          content="Portfolio site for Raihan Rizqullah"
        />
        <meta property="og:type" content="website" />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
