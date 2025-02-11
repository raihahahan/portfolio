import Head from "next/head";
import { useTina } from "tinacms/dist/react";
import client from "../../../tina/__generated__/client";
import HomeContentLayout from "../../features/home/home-layout";
import {
  BlogBackButton,
  ContentSection,
  NavigationButtons,
  TableOfContents,
} from "../../features/blog/blog-components";
import { extractHeadings } from "../../features/blog/blog-utils";

const BlogPage = (props) => {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  });
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
        <BlogBackButton />
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
    paths: postsListData?.data?.postConnection?.edges?.map((post) => ({
      params: { filename: post?.node?._sys.filename },
    })),
    fallback: false,
  };
};

export default BlogPage;
