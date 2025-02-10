// THIS FILE HAS BEEN GENERATED WITH THE TINA CLI.
// @ts-nocheck
// This is a demo file once you have tina setup feel free to delete this file

import Head from "next/head";
import { useTina } from "tinacms/dist/react";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import client from "../../../tina/__generated__/client";
import {
  ActionIcon,
  Anchor,
  Badge,
  Button,
  Group,
  Text,
  Title,
} from "@mantine/core";
import HomeContentLayout from "../../features/home/home-layout";
import {
  Codeblock,
  NavigationButtons,
  TableOfContents,
} from "../../features/blog/blog-components";
import useTheme from "../../common/hooks/useTheme";
import { useEffect } from "react";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons";
import {
  constructHeading,
  extractHeadings,
  isHeaderLink,
} from "../../features/blog/blog-utils";

const BlogPage = (props) => {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  });
  const { siteColors, themeState } = useTheme();
  const headings = extractHeadings(data.post.body);

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
        id="BLOG"
        headerDescription={new Date(data.post.published_at).toUTCString()}
        headerTitle={data.post.title}
      >
        <ActionIcon component="a" href="/blog">
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              justifySelf: "flex-start",
              flexDirection: "row",
            }}
          >
            <IconArrowLeft />
            <Text>Back</Text>
          </div>
        </ActionIcon>
        <br />
        <TableOfContents headings={headings} />

        <div>
          <ContentSection
            content={data.post.body}
            min_read={data.post.read_time}
          ></ContentSection>
        </div>
        <NavigationButtons
          prev={data.post.prev_post}
          next={data.post.next_post}
        />
      </HomeContentLayout>
    </>
  );
};

export const getStaticProps = async ({ params }) => {
  let data = {};
  let query = {};
  let variables = { relativePath: `${params.filename}.md` };
  try {
    const res = await client.queries.post(variables);
    query = res.query;
    data = res.data;
    variables = res.variables;
  } catch {
    // swallow errors related to document creation
  }

  return {
    props: {
      variables: variables,
      data: data,
      query: query,
    },
  };
};

export const getStaticPaths = async () => {
  const postsListData = await client.queries.postConnection();

  return {
    paths: postsListData.data.postConnection.edges.map((post) => ({
      params: { filename: post.node._sys.filename },
    })),
    fallback: false,
  };
};

export default BlogPage;

const PageSection = (props) => {
  return (
    <>
      <h1>{props.heading}</h1>
      <p>{props.content}</p>
    </>
  );
};

const components = (siteColors) => ({
  PageSection: PageSection,
  h1: (props) => constructHeading(props, 1),
  h2: (props) => constructHeading(props, 2),
  h3: (props) => constructHeading(props, 3),
  h4: (props) => constructHeading(props, 4),
  h5: (props) => constructHeading(props, 5),
  h6: (props) => constructHeading(props, 6),
  p: (props) => <p {...props} />,
  ol: (props) => <ol className="list-decimal ml-5 mt-4" {...props} />, // Numbered lists
  ul: (props) => <ul className="list-disc ml-5 mt-4" {...props} />, // Bullet lists
  li: (props) => <li className="mt-1" {...props} />, // List items spacing
  br: () => <br className="my-2" />,
  a: (props) => (
    <Anchor
      className="text-cyan-500 underline hover:text-cyan-700 transition duration-200"
      target={isHeaderLink(props) ? undefined : "_blank"}
      id={isHeaderLink(props) ? (props.url as string).substring(1) : undefined}
      rel="noopener noreferrer"
      href={props.url}
      {...props}
    />
  ),
  code_block: (props) => {
    return <Codeblock language={props.lang}>{props.value}</Codeblock>;
  },
  blockquote: (props) => {
    return (
      <blockquote
        color={siteColors.text.secondary}
        className="border-l-4 border-gray-500 pl-4 italic"
      >
        {props.children}
      </blockquote>
    );
  },
});

const ContentSection = ({ content, min_read }) => {
  const { siteColors, themeState } = useTheme();
  return (
    <div
      style={{
        backgroundColor: siteColors.background,
        color: siteColors.text.primary,
      }}
      className="relative py-16 bg-white overflow-auto text-black sm:max-w-full lg:max-w-screen-lg mx-auto"
    >
      <div className="relative px-4 sm:px-6 lg:px-8">
        {min_read && (
          <Badge
            mb={30}
            color={"gray"}
            variant={themeState == "light" ? "light" : "filled"}
          >
            {min_read} min read
          </Badge>
        )}
        <div className="text-lg mx-auto">
          <TinaMarkdown components={components(siteColors)} content={content} />
        </div>
      </div>
    </div>
  );
};
