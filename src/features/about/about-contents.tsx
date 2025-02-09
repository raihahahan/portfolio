import useGlobalMediaQuery from "../../common/hooks/useGlobalMediaQueries";
import useTheme from "../../common/hooks/useTheme";
import { AboutSection } from "./about-components";
import { aboutDataType } from "./about-types";
import HomeContentLayout from "../home/home-layout";
import { useState } from "react";
import FilmStrip from "./about-components";

export default function AboutContents({ about }: { about: aboutDataType[] }) {
  const { siteColors: colors } = useTheme();
  const mediaQueries = useGlobalMediaQuery();
  const [isFlipped, setIsFlipped] = useState(false);
  return (
    <HomeContentLayout id="ABOUT">
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        {!mediaQueries.sm && <FilmStrip />}

        <div style={{ width: !mediaQueries.md ? "60vw" : "100vw" }}>
          {about.map((item) => {
            return (
              <AboutSection
                key={item.id.toString()}
                item={item}
                colors={colors}
              />
            );
          })}
        </div>
      </div>
    </HomeContentLayout>
  );
}
