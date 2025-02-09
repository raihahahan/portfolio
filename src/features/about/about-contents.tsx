import useGlobalMediaQuery from "../../common/hooks/useGlobalMediaQueries";
import useTheme from "../../common/hooks/useTheme";
import { AboutSection } from "./about-components";
import { aboutDataType } from "./about-types";
import HomeContentLayout from "../home/home-layout";
import { useState } from "react";
import FilmStrip from "./about-components";
import { breakpoints } from "../theme/theme-data";

export default function AboutContents({ about }: { about: aboutDataType[] }) {
  const { siteColors: colors } = useTheme();
  const mediaQueries = useGlobalMediaQuery();
  const [isFlipped, setIsFlipped] = useState(false);
  return (
    <HomeContentLayout
      id="ABOUT"
      headerTitle="Hi, I'm Raihan Rizqullah"
      headerDescription="I enjoy building software."
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        {<FilmStrip />}

        <div
          style={{
            width: mediaQueries.sm
              ? "100vw"
              : mediaQueries.md
              ? "90vw"
              : mediaQueries.lg
              ? "70vw"
              : "70vw",
            maxWidth: breakpoints.lg - 20,
          }}
        >
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
