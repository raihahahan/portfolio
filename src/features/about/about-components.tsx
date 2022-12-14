import { Text } from "@mantine/core";
import Image from "next/image";
import useGlobalMediaQuery from "../../common/hooks/useGlobalMediaQueries";
import useTheme from "../../common/hooks/useTheme";
import { aboutDataType } from "./about-types";
import { siteColorsType } from "../theme/theme-types";
import { aboutImageSrc } from "./about-data";
import rehypeRaw from "rehype-raw";
import ReactMarkdown from "react-markdown";
import { stringToBackTick } from "../../common/utils/strings";

export function AboutSection({
  item,
  colors,
  center,
}: {
  item: aboutDataType;
  colors: siteColorsType;
  center?: boolean;
}) {
  return (
    <section
      id={item.id}
      key={item.id}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: center ? "center" : "flex-start",
      }}
    >
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
        {item.title}
      </Text>

      <AboutWrapper>
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>
          {stringToBackTick(item.body, colors.text.links)}
        </ReactMarkdown>
      </AboutWrapper>

      <br />
    </section>
  );
}

export function AboutProfileIcon({ size }: { size?: number | string }) {
  return (
    <Image
      alt="profile-icon"
      priority
      src={aboutImageSrc}
      width={size ?? "100vw"}
      height={size ?? "100vw"}
    />
  );
}

export function AboutWrapper({ children }: { children: JSX.Element }) {
  const { siteColors: colors } = useTheme();
  const { md: isMed } = useGlobalMediaQuery();
  return (
    <Text
      style={{
        color: colors.text.primary,
        paddingRight: 40,
        paddingLeft: 40,
        fontSize: isMed ? 16 : 20,
        marginTop: 20,
      }}
    >
      {children}
    </Text>
  );
}
