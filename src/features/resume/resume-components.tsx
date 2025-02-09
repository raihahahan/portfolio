import { Avatar, Button, Card, Group, Stack, Text } from "@mantine/core";
import { ResumeItem } from "./resume-types";
import { IconDownload } from "@tabler/icons";
import useTheme from "../../common/hooks/useTheme";

export function Resume({
  resume,
  type,
  hideDownload,
}: {
  resume: ResumeItem[];
  type: string;
  hideDownload?: boolean;
}) {
  const { siteColors, themeState } = useTheme();
  return (
    <Card
      withBorder
      radius="md"
      mt={10}
      shadow="sm"
      p="lg"
      style={{
        backgroundColor: siteColors.header,
        border: 0,
        height: "100%",
      }}
    >
      <Group mb="md">
        <Text color={siteColors.text.primary} weight={600} size="lg">
          {type}
        </Text>
      </Group>

      <Stack spacing="lg">
        {resume.map((item, index) => (
          <Group key={index} align="center" spacing="sm">
            <Avatar src={item.iconUrl} radius="xl" size="lg" />
            <Stack spacing={0} style={{ flex: 1 }}>
              <Text color={siteColors.text.primary} weight={500} size="sm">
                {item.company}
              </Text>
              <Text color="dimmed" size="sm">
                {item.position}
              </Text>
            </Stack>
            <Text color="dimmed" size="sm">
              {item.start} — {item.end}
            </Text>
          </Group>
        ))}
      </Stack>
      {!hideDownload && (
        <Button
          component="a"
          href={process.env.NEXT_PUBLIC_RESUME}
          style={{ justifySelf: "flex-end", marginTop: 20 }}
          color="orange"
          variant={themeState == "dark" ? "filled" : "light"}
        >
          <IconDownload style={{ marginRight: 10 }} /> Download Resume
        </Button>
      )}
    </Card>
  );
}
