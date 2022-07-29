import { Text } from "@mantine/core";
import Image from "next/image";
import useTheme from "../hooks/useTheme";
import { aboutData } from "../../data/data-about";
import useGlobalMediaQuery from "../hooks/useGlobalMediaQueries";
import { aboutDataType } from "../types/types-about";
import { siteColorsType } from "../../styles/styles-types";

export default function AboutContents() {
  const { siteColors: colors, colorTheme } = useTheme();
  const mediaQueries = useGlobalMediaQuery();
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

      <div style={{ width: !mediaQueries.md ? "60vw" : "100vw" }}>
        {aboutData(colors, mediaQueries).map((item) => {
          return <AboutSection item={item} colors={colors} />;
        })}
      </div>
    </div>
  );
}

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
      {item.body}
      <br />
    </section>
  );
}
