// THIS FILE HAS BEEN GENERATED WITH THE TINA CLI.
// @ts-nocheck
// This is a demo file once you have tina setup feel free to delete this file

import Head from "next/head";
import { useTina } from "tinacms/dist/react";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import client from "../../../tina/__generated__/client";
import { Anchor, Title } from "@mantine/core";
import HomeContentLayout from "../../features/home/home-layout";
import { Codeblock } from "../../features/blog/blog-components";
import useTheme from "../../common/hooks/useTheme";

const BlogPage = (props) => {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  });
  const { siteColors } = useTheme();

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
        <div>
          <ContentSection content={data.post.body}></ContentSection>
        </div>
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
      //myOtherProp: 'some-other-data',
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

const components = {
  PageSection: PageSection,
  h1: (props) => <Title order={1} className="mt-6 mb-6" {...props} />,
  h2: (props) => <Title order={2} className="mt-6 mb-6" {...props} />,
  h3: (props) => <Title order={3} className="mt-6 mb-6" {...props} />,
  h4: (props) => <Title order={4} className="mt-6 mb-6" {...props} />,
  h5: (props) => <Title order={5} className="mt-6 mb-6" {...props} />,
  h6: (props) => <Title order={6} className="mt-6 mb-6" {...props} />,
  p: (props) => <p {...props} />,
  ol: (props) => <ol className="list-decimal ml-5 mt-4" {...props} />, // Numbered lists
  ul: (props) => <ul className="list-disc ml-5 mt-4" {...props} />, // Bullet lists
  li: (props) => <li className="mt-1" {...props} />, // List items spacing
  br: () => <br className="my-2" />,
  a: (props) => (
    <Anchor
      className="text-cyan-500 underline hover:text-cyan-700 transition duration-200"
      target="_blank"
      rel="noopener noreferrer"
      href={props.url}
      {...props}
    />
  ),
  code_block: (props) => {
    return <Codeblock language={props.lang}>{props.value}</Codeblock>;
  },
};

const ContentSection = ({ content }) => {
  const { siteColors } = useTheme();
  return (
    <div
      style={{
        backgroundColor: siteColors.background,
        color: siteColors.text.primary,
      }}
      className="relative py-16 bg-white overflow-auto text-black sm:max-w-full lg:max-w-screen-lg mx-auto"
    >
      <div className="relative px-4 sm:px-6 lg:px-8">
        <div className="text-lg mx-auto">
          <TinaMarkdown components={components} content={content} />
        </div>
      </div>
    </div>
  );
};
