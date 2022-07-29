import { useMediaQuery } from "@mantine/hooks";
import AboutContents from "../common/contents/contents-about";
import useTheme from "../common/hooks/useTheme";
import HomeContentLayout from "../common/layouts/layouts-home";
import MainLayout from "../common/layouts/layouts-index";

export default function About() {
  const { siteColors: colors } = useTheme();
  const isMed = useMediaQuery("(max-width: 895px)");
  return (
    <MainLayout home={false}>
      <div
        style={{
          width: "100vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          padding: 40,
        }}
      >
        <AboutContents />
      </div>
    </MainLayout>
  );
}
