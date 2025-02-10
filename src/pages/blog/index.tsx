import { SimpleGrid } from "@mantine/core";
import HomeContentLayout from "../../features/home/home-layout";
import { fetchBlogs } from "../../features/blog/blog-data";
import { BlogCard } from "../../features/blog/blog-components";

export default function BlogList({ posts }) {
  return (
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
