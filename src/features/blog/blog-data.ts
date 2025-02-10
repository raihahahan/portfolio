import client from "../../../tina/__generated__/client";

export async function fetchBlogs(limit?: number) {
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
  let posts = postsResponse?.data?.postConnection?.edges
    .map((post) => {
      return {
        slug: post?.node?._sys.filename ?? "",
        title: post?.node?.title ?? "",
        published_at: post?.node?.published_at ?? "",
        read_time: post?.node?.read_time ?? 0,
        excerpt: post?.node?.excerpt ?? "",
      };
    })
    .sort((a, b) => {
      if (!a.published_at || !b.published_at) {
        return a.title.localeCompare(b.title);
      }
      return (
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      );
    });

  return limit && posts.length > 0 ? posts.slice(0, limit) : posts;
}
