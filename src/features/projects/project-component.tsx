import { Badge, Button, Card, Group, Image, Text } from "@mantine/core";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { LinkText } from "../../common/components/components-utils";
import useTheme from "../../common/hooks/useTheme";
import { stringToBackTick } from "../../common/utils/strings";
import { projectDataType } from "./project-types";

export default function ProjectComponent({
  item,
  width,
}: {
  item: projectDataType;
  width?: string;
}) {
  const { siteColors, colorTheme, themeState } = useTheme();
  const { projectCondition } = item.projectAnalysis;

  return (
    <Card
      shadow="sm"
      p="lg"
      radius="md"
      withBorder
      style={{
        marginTop: 10,
        width: width ?? "90vw",
        backgroundColor: colorTheme.surface,
        borderWidth: 0,
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
            fontSize: 16,
            marginTop: 10,
            textAlign: "center",
            color: siteColors.text.primary,
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
        style={{
          marginTop: 10,
          marginLeft: 0,
          marginBottom: 10,
          backgroundColor:
            themeState == "dark"
              ? projectCondition == "stable"
                ? "#1B371C"
                : projectCondition == "needs refactor"
                ? "#362D02"
                : "#3A0B01"
              : undefined,
          color:
            themeState == "dark"
              ? projectCondition == "stable"
                ? "#9cd402"
                : projectCondition == "needs refactor"
                ? "#d7ff69"
                : "#E34D54"
              : undefined,
        }}
      >
        {projectCondition}
      </Badge>

      <br />
      <div
        style={{
          color: siteColors.text.primary,
          fontSize: "1em",
        }}
      >
        <ReactMarkdown rehypePlugins={[rehypeRaw] as any}>
          {stringToBackTick(item.description, siteColors.text.links)}
        </ReactMarkdown>
      </div>
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
            <Text key={c}>
              <LinkText
                text={c}
                link={`https://github.com/${c}`}
                extraTextStyles={{ fontSize: 14, marginRight: 5 }}
              />
            </Text>
          ))}
        </Text>
      ) : null}
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
                style={{
                  borderTopLeftRadius: 0,
                  borderTopRightRadius: 0,
                }}
                key={btn.title}
                disabled={projectCondition == "not maintained"}
                variant={themeState == "light" ? "light" : "filled"}
                color={themeState == "light" ? "orange" : "dark"}
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
