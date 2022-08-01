import { Text } from "@mantine/core";
import Image from "next/image";
import useGlobalMediaQuery from "../../common/hooks/useGlobalMediaQueries";
import useTheme from "../../common/hooks/useTheme";
import { aboutDataType } from "./about-types";
import { siteColorsType } from "../../styles/styles-types";
import { aboutImageSrc } from "./about-data";
import rehypeRaw from "rehype-raw";
import ReactMarkdown from "react-markdown";
import ContactMethods from "../contact/contact-components";

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
      {item.id == "contact" ? (
        <AboutWrapper>
          <ContactMethods />
        </AboutWrapper>
      ) : (
        <AboutWrapper>
          <ReactMarkdown children={item.body} rehypePlugins={[rehypeRaw]} />
        </AboutWrapper>
      )}
      <br />
    </section>
  );
}

export function AboutProfileIcon({ size }: { size?: number | string }) {
  return (
    <Image
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
