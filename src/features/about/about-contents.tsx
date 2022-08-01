import { Text } from "@mantine/core";
import useGlobalMediaQuery from "../../common/hooks/useGlobalMediaQueries";
import useTheme from "../../common/hooks/useTheme";
import { AboutProfileIcon, AboutSection } from "./about-components";
import { aboutData } from "./about-data";
import AboutLayout from "./about-layout";

export default function AboutContents() {
  const { siteColors: colors } = useTheme();
  const mediaQueries = useGlobalMediaQuery();
  return (
    <AboutLayout>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <AboutProfileIcon size={"100vw"} />
        <br style={{ height: 60 }} />

        <Text
          style={{ color: colors.text.primary, fontSize: 24, marginBottom: 30 }}
        >
          ABOUT
        </Text>

        <div style={{ width: !mediaQueries.md ? "60vw" : "100vw" }}>
          {aboutData.map((item) => {
            return <AboutSection item={item} colors={colors} />;
          })}
        </div>
      </div>
    </AboutLayout>
  );
}
