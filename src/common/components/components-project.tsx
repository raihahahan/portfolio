import { Badge, Button, Card, Grid, Group, Image, Text } from "@mantine/core";
import { useRouter } from "next/router";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import useGlobalMediaQuery from "../hooks/useGlobalMediaQueries";
import useTheme from "../hooks/useTheme";
import { projectDataType } from "../types/types-project";
import GenericButton from "./buttons";
import { LinkText } from "./components-utils";

export default function ProjectComponent({ item }: { item: projectDataType }) {
  const { xs, sm, md, lg, xl } = useGlobalMediaQuery();
  const { siteColors, colorTheme } = useTheme();
  const { projectCondition } = item.projectAnalysis;
  const router = useRouter();
  return (
    <Card
      shadow="sm"
      p="lg"
      radius="md"
      withBorder
      style={{
        // margin: 5,
        marginTop: 10,
        height: "30vw",
        minHeight: 820,
        width: "90vw",
      }}
    >
      <Card.Section>
        <Image
          src={
            item.imgSrc ??
            "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=720&q=80"
          }
          height={160}
          alt="project-image"
        />
      </Card.Section>

      <Group
        position="apart"
        mt="md"
        mb="xs"
        style={{ display: "flex", justifyContent: "center" }}
      >
        <Text
          weight={"bolder"}
          style={{
            display: "flex",
            justifySelf: "center",
            fontSize: 14,
            marginTop: 10,
            textAlign: "center",
          }}
        >
          {item.title} - {item.shortDescription}
        </Text>
      </Group>
      <Badge
        color={
          projectCondition == "stable"
            ? "green"
            : projectCondition == "needs refactor"
            ? "yellow"
            : "red"
        }
        variant="light"
        style={{ marginTop: 10, marginLeft: 0, marginBottom: 10 }}
      >
        {projectCondition}
      </Badge>

      <br />
      {/* <Text size="sm" color={siteColors.text.primary} style={{ fontSize: 15 }}>
        {item.description}
      </Text> */}
      <ReactMarkdown children={item.description} rehypePlugins={[rehypeRaw]} />
      <br />
      <div style={{ maxWidth: "90%" }}>
        <Text
          style={{
            color: siteColors.text.primary,
            fontSize: 14,
            display: "flex",
            flexDirection: "row",
            marginBottom: 10,
          }}
        >
          <Text color="dimmed" style={{ marginRight: 5 }}>
            Skills: {item.skills.map((i) => ` ${i}`).toString()}
          </Text>
        </Text>
      </div>

      <br />
      {item.contributors ? (
        <Text
          color={siteColors.text.primary}
          style={{
            marginRight: 5,
            fontSize: 14,
            display: "flex",
            flexDirection: "row",
          }}
        >
          <Text style={{ marginRight: 5 }}>Contributors:</Text>
          {item.contributors?.map((c, i) => (
            <Text>
              <LinkText
                text={
                  item?.contributors && i == item.contributors.length - 1
                    ? c
                    : `${c} | `
                }
                link={`https://github.com/${c}`}
                extraTextStyles={{ fontSize: 14, marginRight: 5 }}
              />
            </Text>
          ))}
        </Text>
      ) : null}
      {/* <Badge
        color={
          projectCondition == "stable"
            ? "green"
            : projectCondition == "needs refactor"
            ? "yellow"
            : "red"
        }
        variant="light"
        style={{ marginTop: 10, marginLeft: -7 }}
      >
        {projectCondition}
      </Badge> */}
      <br />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "row",
        }}
      >
        <Button.Group
          style={{
            display: "flex",
            justifyContent: "center",
            position: "absolute",
            bottom: 0,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            width: "100%",
          }}
        >
          {item.buttons.map((btn) => {
            return (
              <Button
                style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
                key={btn.title}
                disabled={projectCondition == "not maintained"}
                variant="light"
                color="blue"
                fullWidth
                mt="md"
                radius="md"
                component={"a"}
                href={
                  projectCondition == "not maintained" ? undefined : btn.link
                }
                target="_blank"
              >
                {btn.title}
              </Button>
            );
          })}
        </Button.Group>
      </div>
    </Card>
  );
}
