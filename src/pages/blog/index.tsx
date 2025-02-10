import { Card, Text, Group, SimpleGrid, Badge } from "@mantine/core";
import HomeContentLayout from "../../features/home/home-layout";
import { client } from "../../../tina/__generated__/client";
import { useRouter } from "next/router";
import useTheme from "../../common/hooks/useTheme";

export default function BlogList({ posts }) {
  const router = useRouter();
  const { siteColors, themeState } = useTheme();
  return (
    <HomeContentLayout
      id="BLOG"
      headerTitle="Blog"
      headerDescription="This is where I occasionally write stuff. (work in progress)"
    >
      <br />
      <SimpleGrid cols={3} breakpoints={[{ maxWidth: "sm", cols: 1 }]}>
        {posts.map((post) => (
          <Card
            key={post.slug}
            shadow="sm"
            p="lg"
            onClick={() => router.push(`/blog/${post.slug}`)}
            style={{
              cursor: "pointer",
              backgroundColor: siteColors.header,
              color: siteColors.text.primary,
            }}
          >
            <Group position="apart" style={{ marginBottom: 5 }}>
              <Text size={20} weight={500}>
                {post.title}
              </Text>
              <Badge
                color={"orange"}
                variant={themeState == "light" ? "light" : "filled"}
              >
                {new Date(post.published_at).toLocaleDateString()}
              </Badge>
            </Group>
          </Card>
        ))}
      </SimpleGrid>
    </HomeContentLayout>
  );
}

export async function getStaticProps() {
  // Simulating fetching data from TinaCMS content stored in the `content/posts` directory
  try {
    const postsResponse = await client.queries.postConnection();
    if (
      postsResponse === null ||
      postsResponse === undefined ||
      !postsResponse.data ||
      !postsResponse.data.postConnection ||
      !postsResponse.data.postConnection.edges
    ) {
      throw new Error("Failed to fetch.");
    }
    const posts = postsResponse?.data?.postConnection?.edges.map((post) => {
      console.log(post);
      return {
        slug: (post as any).node._sys.filename,
        title: post.node.title,
        published_at: post?.node?.published_at,
      };
    });

    return { props: { posts } };
    // This would return an array like: [ { slug: 'HelloWorld.md'}, /*...*/ ]
  } catch (e) {
    console.log(e);
    return { props: { posts: [] } };
  }
}
