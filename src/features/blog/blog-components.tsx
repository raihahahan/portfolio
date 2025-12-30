import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import atomOneDark from "react-syntax-highlighter/dist/cjs/styles/prism/material-dark";
import useTheme from "../../common/hooks/useTheme";
import {
  IconArrowLeft,
  IconArrowRight,
  IconChevronDown,
  IconChevronRight,
} from "@tabler/icons";
import { useState } from "react";
import {
  Anchor,
  Button,
  Group,
  Transition,
  List,
  ThemeIcon,
  Card,
  Text,
  Grid,
  Badge,
  ActionIcon,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useRouter } from "next/router";
import { constructHeading, isHeaderLink } from "./blog-utils";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import useGlobalMediaQuery from "../../common/hooks/useGlobalMediaQueries";

export const Codeblock = ({ children, language }) => {
  return (
    <div className="w-full overflow-x-auto">
      <SyntaxHighlighter
        code={children || ""}
        language={language || "jsx"}
        style={atomOneDark}
        showInlineLineNumbers={true}
        customStyle={{ width: "calc(100vw - 50px)" }}
        wrapLines={true}
      />
    </div>
  );
};

export const NavigationButtons = ({ prev, next }: { prev: any; next: any }) => {
  const { siteColors, themeState } = useTheme();
  const { sm, md } = useGlobalMediaQuery();

  const NavButton = ({ type, post }) => (
    <Button
      color="red"
      variant="default"
      component="a"
      href={`/blog/${post._sys.filename}`}
      style={{
        flex: 1,
        margin: 10,
        justifyContent: "flex-start",
        alignContent: "center",
        backgroundColor: siteColors.header,
        width: sm ? "97vw" : "100%",
        borderRadius: "8px",
        padding: "20px 24px",
        height: "auto",
        border: themeState == "dark" ? 0 : undefined,
        display: "flex",
        flexDirection: "row",
        minWidth: "max-content",
        minHeight: "max-content",
      }}
    >
      <div>
        <div
          style={{
            color: siteColors.text.primary,
            fontSize: "16px",
            marginBottom: 4,
            flex: 1,
          }}
        >
          {type}
        </div>
        <div
          style={{
            color: siteColors.text.secondary,
            fontSize: "14px",
            fontWeight: "lighter",
            wordWrap: "break-word",
          }}
        >
          {post.title}
        </div>
      </div>
    </Button>
  );

  return (
    <Group
      p="md"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: sm ? "column" : "row",
          width: "100%",
        }}
      >
        {/* Previous Button */}
        {prev && <NavButton type="Previous" post={prev} />}

        {/* Next Button */}
        {next && <NavButton type="Next" post={next} />}
      </div>
    </Group>
  );
};

export function TableOfContents({ headings }) {
  const [expanded, setExpanded] = useState({});
  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  const { siteColors, themeState } = useTheme();

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside
      className={`sticky top-20 p-4 shadow-lg rounded-lg border border-gray-200 transition-all`}
      style={{
        width: isSmallScreen ? "100%" : "90%", // 100% on small screens, 30% on large screens
        maxWidth: "850px", // Prevents it from being too wide
        minWidth: "250px", // Ensures it doesn’t get too small
        backgroundColor: siteColors.header,
        borderWidth: themeState == "dark" ? 0 : undefined,
      }}
    >
      <h2
        style={{ color: siteColors.text.primary }}
        className="text-lg font-bold mb-3 text-gray-700"
      >
        Table of Contents
      </h2>
      <List style={{}} spacing="xs">
        {headings.map((heading) => {
          const isExpandable = heading.level >= 3;
          const isExpanded = expanded[heading.id];

          return (
            <div key={heading.id} className={`ml-${(heading.level - 1) * 4}`}>
              <Anchor
                style={{ color: siteColors.text.primary }}
                href={`#${heading.id}`}
                className="flex items-center text-gray-700 hover:text-blue-600 font-medium transition-all"
                onClick={(e) => {
                  if (isExpandable) {
                    toggleExpand(heading.id);
                  }
                }}
              >
                {isExpandable && (
                  <ThemeIcon
                    variant="light"
                    size="sm"
                    radius="xl"
                    className={`mr-2 transition-transform ${
                      isExpanded ? "rotate-90 text-blue-500" : "text-gray-500"
                    }`}
                  >
                    {isExpanded ? (
                      <IconChevronDown size={14} />
                    ) : (
                      <IconChevronRight size={14} />
                    )}
                  </ThemeIcon>
                )}
                {heading.text}
              </Anchor>

              <Transition mounted={isExpanded} transition="fade">
                {(styles) => (
                  <List style={styles} ml="lg" className="mt-1 space-y-1">
                    {heading.children?.map((sub) => (
                      <List.Item key={sub.id}>
                        <Anchor
                          href={`#${sub.id}`}
                          className="text-gray-600 hover:text-blue-500 text-sm transition-all"
                        >
                          {sub.text}
                        </Anchor>
                      </List.Item>
                    ))}
                  </List>
                )}
              </Transition>
            </div>
          );
        })}
      </List>
    </aside>
  );
}

export function BlogCard2({ post }) {
  const router = useRouter();
  const { siteColors, themeState } = useTheme();
  return (
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
        <Text style={{ color: siteColors.text.secondary }}>{post.excerpt}</Text>
        <Grid>
          <Badge
            m={3}
            color={"gray"}
            variant={themeState == "light" ? "light" : "filled"}
          >
            {post.read_time} min read
          </Badge>
          <Badge
            m={3}
            color={"orange"}
            variant={themeState == "light" ? "light" : "filled"}
          >
            {new Date(post.published_at).toLocaleDateString()}
          </Badge>
        </Grid>
      </Group>
    </Card>
  );
}

export function BlogCard({ post }) {
  const router = useRouter();
  const { siteColors, themeState } = useTheme();
  const { sm } = useGlobalMediaQuery();

  return (
    <Card
      key={post.slug}
      shadow={"sm"}
      p="lg"
      radius="md"
      style={{
        cursor: "pointer",
        width: sm ? "100%" : undefined,
        color: siteColors.text.primary,
        // maxWidth: 400,
      }}
      sx={{
        backgroundColor: siteColors.header,
      }}
      onClick={() => router.push(`/blog/${post.slug}`)}
    >
      {/* Date */}
      <Text size="sm" color="gray" mb="xs">
        {new Date(post.published_at).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </Text>

      {/* Title */}
      <Text size="xl" weight={600} mb="xs">
        {post.title}
      </Text>

      {/* Excerpt */}
      <Text size="sm" color={siteColors.text.secondary} lineClamp={3}>
        {post.excerpt}
      </Text>

      {/* Meta Info */}
      <Group position="apart" mt="md">
        <Badge color="gray" variant="light">
          {post.read_time} min read
        </Badge>
      </Group>

      {/* Read More Link */}
      <Text
        size="sm"
        color="red"
        mt="md"
        style={{ cursor: "pointer", fontWeight: 500 }}
      >
        Read note →
      </Text>
    </Card>
  );
}

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
  br: (props) => <br className="my-2" {...props} />,
  a: (props) => (
    <Anchor
      className="text-orangered-500 hover:text-orangered-700 transition duration-200"
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
  img: (props) => {
    return (
      <>
        <br />
        <img {...props} src={props.url} />
        <br />
      </>
    );
  },
});

export const ContentSection = ({ content, min_read }) => {
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
        {min_read ? (
          <Badge
            mb={30}
            color={"gray"}
            variant={themeState == "light" ? "light" : "filled"}
          >
            {min_read} min read
          </Badge>
        ) : null}
        <div className="text-lg mx-auto">
          <TinaMarkdown components={components(siteColors)} content={content} />
        </div>
      </div>
    </div>
  );
};

export const BlogBackButton = () => {
  return (
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
  );
};
