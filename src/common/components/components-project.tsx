import { Badge, Button, Card, Grid, Group, Image, Text } from "@mantine/core";
import { useRouter } from "next/router";
import useGlobalMediaQuery from "../hooks/useGlobalMediaQueries";
import useTheme from "../hooks/useTheme";
import { projectDataType } from "../types/types-project";
import GenericButton from "./buttons";

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
      style={{ margin: 5, marginTop: 10, height: 350 }}
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

      <Group position="apart" mt="md" mb="xs">
        <Text weight={500}>{item.title}</Text>
        <Badge
          color={
            projectCondition == "stable"
              ? "green"
              : projectCondition == "needs refactor"
              ? "yellow"
              : "red"
          }
          variant="light"
        >
          {projectCondition}
        </Badge>
      </Group>

      <Text size="sm" color="dimmed">
        {item.description}
      </Text>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "row",
        }}
      >
        <Button
          key={item.button.title}
          style={{
            display: "flex",
            justifyContent: "center",
            position: "absolute",
            bottom: 0,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
          }}
          disabled={projectCondition == "not maintained"}
          variant="light"
          color="blue"
          fullWidth
          mt="md"
          radius="md"
          component="a"
          href={item.button.link}
          target="_blank"
        >
          {item.button.title}
        </Button>

        {/* <Button
          style={{
            position: "absolute",
            bottom: 0,
            display: "flex",
            justifyContent: "center",
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
          }}
          disabled={!item.buttons[0]?.title}
          variant="light"
          color="blue"
          fullWidth
          mt="md"
          radius="md"
          component="a"
          href={item.buttons[0]?.link}
        >
          {item.buttons[0]?.title ?? "Not Maintained"}
        </Button> */}
      </div>
    </Card>
  );
}
