import { List, ThemeIcon } from "@mantine/core";
import { IconBrandGithub, IconMessage } from "@tabler/icons";
import Link from "next/link";
import { BodyText } from "../components/components-utils";
import useTheme from "../hooks/useTheme";
import { AboutSection } from "./contents-about";

export default function ContactContents() {
  const { siteColors: colors } = useTheme();
  return (
    <AboutSection
      center
      colors={colors}
      item={{
        id: "3",
        title: "Contact",
        body: (
          <BodyText>
            <></>
            <List spacing="xs" size="sm" center>
              <List.Item
                icon={
                  <ThemeIcon color="yellow" size={28} radius="xl">
                    <IconMessage size={16} color={colors.text.primary} />
                  </ThemeIcon>
                }
              >
                <Link href="mailto:mraihandev@gmail.com">
                  <a target="_blank" style={{ color: "blue", fontSize: 16 }}>
                    mraihandev@gmail.com
                  </a>
                </Link>
              </List.Item>

              <List.Item
                icon={
                  <ThemeIcon color="yellow" size={28} radius="xl">
                    <IconBrandGithub size={16} color={colors.text.primary} />
                  </ThemeIcon>
                }
              >
                <Link href="https://www.github.com/raihahahan">
                  <a target="_blank" style={{ color: "blue", fontSize: 16 }}>
                    Github: @raihahahan
                  </a>
                </Link>
              </List.Item>
            </List>
          </BodyText>
        ),
      }}
    />
  );
}
