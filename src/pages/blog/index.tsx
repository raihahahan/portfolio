import { SimpleGrid } from "@mantine/core";
import Seo from "../../common/components/components-seo";
import HomeContentLayout from "../../features/home/home-layout";
import { fetchBlogs } from "../../features/blog/blog-data";
import { BlogCard } from "../../features/blog/blog-components";

export default function BlogList({ posts }) {
  return (
    <>
      <Seo
        title="Blog"
        description="Technical writings on databases, system design, software engineering, and building products."
        path="/blog"
        keywords={[
          "software engineering blog",
          "database internals",
          "system design",
          "technical writing",
          "Raihan Rizqullah blog",
        ]}
      />
      <HomeContentLayout
        id="BLOG"
        headerTitle="Blog"
        headerDescription="This is where I occasionally write stuff."
      >
        <br />
        <SimpleGrid cols={3} breakpoints={[{ maxWidth: "sm", cols: 1 }]}>
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </SimpleGrid>
      </HomeContentLayout>
    </>
  );
}

export async function getStaticProps() {
  try {
    const posts = await fetchBlogs();

    return { props: { posts } };
  } catch (e) {
    console.log(e);
    return { props: { posts: [] } };
  }
}
