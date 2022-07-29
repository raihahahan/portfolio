import { Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import Image from "next/image";
import { NextRouter, useRouter } from "next/router";
import useTheme from "../hooks/useTheme";
import HomeContentLayout from "../layouts/layouts-home";
import GenericButton from "./buttons";

export default function HomeIntro({ router }: { router: NextRouter }) {
  const { siteColors } = useTheme();

  const WIDTH = 1880;
  const HEIGHT = 422;
  const RATIO = HEIGHT / WIDTH;

  const isMed = useMediaQuery("(max-width: 1000px)");
  const TEXT_PADDING = 40;
  return (
    <HomeContentLayout
      id="ABOUT"
      height={"calc(100vh - 70px)"}
      backgroundColor={siteColors.background}
    >
      <Image
        priority
        src={"/images/main-bg-component.png"}
        alt="raihahahan"
        width={2000}
        height={RATIO * 2000}
      />
      <div style={{ width: !isMed ? "40vw" : "100vw" }}>
        <Text
          style={{
            textAlign: "center",
            paddingRight: TEXT_PADDING,
            paddingLeft: TEXT_PADDING,
            color: siteColors.text.primary,
            fontSize: 20,
            marginTop: 40,
          }}
        >
          I am a newbie developer who is just starting out.
        </Text>
      </div>
      <div style={{ marginTop: 60 }}>
        <GenericButton
          text="View Projects"
          onClick={() => router.push("/projects")}
          color="dark"
        />
      </div>
    </HomeContentLayout>
  );
}
