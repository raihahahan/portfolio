import { Card, Text, Group, SimpleGrid, Badge, Grid } from "@mantine/core";
import HomeContentLayout from "../../features/home/home-layout";
import { useRouter } from "next/router";
import useTheme from "../../common/hooks/useTheme";
import { fetchBlogs } from "../../features/blog/blog-data";

export default function BlogList({ posts }) {
  const router = useRouter();
  const { siteColors, themeState } = useTheme();
  return (
    <HomeContentLayout
      id="BLOG"
      headerTitle="Blog"
      headerDescription="This is where I occasionally write stuff."
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
            <Group
              position="apart"
              style={{
                marginBottom: 5,
              }}
            >
              <Text size={20} weight={500}>
                {post.title}
              </Text>
              <Text style={{ color: siteColors.text.secondary }}>
                {post.excerpt}
              </Text>
              <Grid>
                <Badge
                  color={"gray"}
                  variant={themeState == "light" ? "light" : "filled"}
                >
                  {post.read_time} min read
                </Badge>
                <Badge
                  color={"orange"}
                  variant={themeState == "light" ? "light" : "filled"}
                >
                  {new Date(post.published_at).toLocaleDateString()}
                </Badge>
              </Grid>
            </Group>
          </Card>
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
