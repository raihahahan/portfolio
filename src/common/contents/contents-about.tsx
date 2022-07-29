import { Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import Image from "next/image";
import Link from "next/link";
import GenericButton from "../components/buttons";
import useTheme from "../hooks/useTheme";
import { List, ThemeIcon } from "@mantine/core";
import {
  IconBrandGithub,
  IconCircleCheck,
  IconCircleDashed,
  IconMessage,
  IconRecordMail,
} from "@tabler/icons";
export default function AboutContents() {
  const { siteColors: colors, colorTheme } = useTheme();
  const isMed = useMediaQuery("(max-width: 895px)");
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <Image
        priority
        src="/images/pixil-icon.png"
        width={"100vw"}
        height={"100vw"}
      />
      <br style={{ height: 60 }} />
      <Text
        style={{ color: colors.text.primary, fontSize: 24, marginBottom: 30 }}
      >
        ABOUT
      </Text>

      <div style={{ width: !isMed ? "60vw" : "100vw" }}>
        {/* MYSELF */}
        <section>
          <Text
            style={{
              color: colors.text.primary,
              paddingRight: 40,
              paddingLeft: 40,
              fontSize: 26,
              marginTop: 20,
              fontWeight: "bold",
            }}
          >
            Myself
          </Text>

          <Text
            style={{
              color: colors.text.primary,
              paddingRight: 40,
              paddingLeft: 40,
              fontSize: isMed ? 14 : 20,
              marginTop: 20,
            }}
          >
            I am Raihan and I am a newbie developer who is just starting out.
            <br />
            <br />I use this place as a portfolio site to showcase my past
            projects. I currently focus on building Android and iOS apps with
            React Native and Expo EAS. I created an informal entity called{" "}
            <Link passHref href="https://www.melonbase.com">
              <a target="_blank" style={{ color: "blue" }}>
                Melonbase
              </a>
            </Link>{" "}
            for the sole purpose of curating my mobile app(s) that are published
            to the store into a single entity.
            <br />
            <br />
            I hope to expand my skillsets beyond React and React Native to areas
            such as native mobile app development (Java / Swift) and Data
            Science/Analytics.
            <br />
            <br />
            I will be pursuing Computer Science in late 2023. In the meantime, I
            work on self projects, take online courses and try to keep up with
            the latest tech.
            <br />
            <br />I do not have relevant work experience yet, but I am willing
            to take on an internship before my university starts. You may
            contact me via the different sources below:
            <br />
            <br />
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
          </Text>
        </section>
        <br />
        <br />
        {/* The site */}
        <section>
          <Text
            style={{
              color: colors.text.primary,
              paddingRight: 40,
              paddingLeft: 40,
              fontSize: 26,
              marginTop: 20,
              fontWeight: "bold",
            }}
          >
            Miscellaneous
          </Text>

          <Text
            style={{
              color: colors.text.primary,
              paddingRight: 40,
              paddingLeft: 40,
              fontSize: isMed ? 14 : 20,
              marginTop: 20,
            }}
          >
            This site was built with React and NextJS. Coincidentally, this site
            is my first React NextJS project.
          </Text>
        </section>
      </div>
      <br />
      <br />
      {/* <GenericButton
        color="orange"
        text="Support Melonbase"
        isLinkable
        href={"https://www.buymeacoffee.com/melonbasedev"}
        extraStyles={{ marginBottom: 20 }}
        newTab
      /> */}
      {/* <GithubButtonMain /> */}
    </div>
  );
}
