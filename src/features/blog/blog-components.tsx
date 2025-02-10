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
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useRouter } from "next/router";

export const Codeblock = ({ children, language }) => {
  return (
    <div className="w-full overflow-x-auto">
      <SyntaxHighlighter
        code={children || ""}
        language={language || "jsx"}
        style={atomOneDark}
        wrapLongLines
        showInlineLineNumbers={true}
        lineProps={{
          style: { wordBreak: "break-all", whiteSpace: "pre-wrap" },
        }}
        wrapLines={true}
      />
    </div>
  );
};

export const NavigationButtons = ({ prev, next }: { prev: any; next: any }) => {
  const { siteColors, themeState } = useTheme();
  const NavButton = ({ type, post, icon }) => (
    <Button
      color="red"
      variant="default"
      rightIcon={icon}
      component="a"
      href={`/blog/${post._sys.filename}`}
      styles={{
        root: {
          backgroundColor: siteColors.header,
          borderRadius: "8px",
          padding: "20px 24px",
          height: "auto",
          border: themeState == "dark" ? 0 : undefined,
        },
        inner: {
          gap: "12px",
        },
        label: {
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "4px",
        },
      }}
    >
      <div>
        <div
          style={{
            color: siteColors.text.primary,
            fontSize: "16px",
            marginBottom: 4,
          }}
        >
          {type}
        </div>
        <div
          style={{
            color: siteColors.text.secondary,
            fontSize: "14px",
            fontWeight: "lighter",
          }}
        >
          {post.title}
        </div>
      </div>
    </Button>
  );

  return (
    <Group p="md">
      {prev && (
        <NavButton
          type="Previous"
          post={prev}
          icon={<IconArrowLeft size={16} />}
        />
      )}

      {next && (
        <NavButton
          type="Next"
          post={next}
          icon={<IconArrowRight size={16} />}
        />
      )}
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
                    e.preventDefault();
                    toggleExpand(heading.id);
                    document
                      .getElementById(heading.id)
                      ?.scrollIntoView({ behavior: "smooth" });
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

export function BlogCard({ post }) {
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
  );
}
