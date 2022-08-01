import useGlobalMediaQuery from "../../common/hooks/useGlobalMediaQueries";
import useTheme from "../../common/hooks/useTheme";
import HomeContentLayout from "./home-layout";
import {
  HomeBannerImage,
  HomeIntroText,
  HomeViewProjectsButton,
} from "./home-components";

export default function HomeContents() {
  const { siteColors } = useTheme();
  const { md } = useGlobalMediaQuery();

  return (
    <HomeContentLayout
      id="ABOUT"
      height={"calc(100vh - 70px)"}
      backgroundColor={siteColors.background}
    >
      <HomeBannerImage customHeight={2000} />
      <div style={{ width: !md ? "40vw" : "100vw" }}>
        <HomeIntroText />
      </div>
      <div style={{ marginTop: 60 }}>
        <HomeViewProjectsButton />
      </div>
    </HomeContentLayout>
  );
}