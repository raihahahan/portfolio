import { Text } from "@mantine/core";
import Image from "next/image";
import { useRouter } from "next/router";
import GenericButton from "../../common/components/components-buttons";
import useGlobalMediaQuery from "../../common/hooks/useGlobalMediaQueries";
import useTheme from "../../common/hooks/useTheme";
import { homeIntroTextData } from "./home-data";

export function HomeBannerImage({ customHeight }: { customHeight?: number }) {
  const WIDTH = 1677;
  const HEIGHT = 421;
  const RATIO = HEIGHT / WIDTH;
  const { themeState } = useTheme();
  const { xs, md, sm } = useGlobalMediaQuery();

  const WIDTH_SM = 1166;
  const HEIGHT_SM = 830;
  const RATIO_SM = HEIGHT_SM / WIDTH_SM;

  const BREAK = sm;

  const FINAL_HEIGHT = customHeight
    ? BREAK
      ? RATIO_SM * customHeight
      : RATIO * customHeight
    : BREAK
    ? RATIO_SM * 2000
    : RATIO * 2000;

  const FINAL_SRC = BREAK
    ? themeState == "dark"
      ? "/images/final-xs-dark-1.png"
      : "/images/final-xs-light.png"
    : themeState == "dark"
    ? "/images/final-lg-dark.png"
    : "/images/bg-component-light-lg-final.png";

  return (
    <Image
      priority
      src={FINAL_SRC}
      alt="raihahahan"
      width={2000}
      height={FINAL_HEIGHT}
    />
  );
}

export function HomeIntroText({ text }: { text: string }) {
  const TEXT_PADDING = 40;
  const { siteColors } = useTheme();

  return (
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
      {text}
    </Text>
  );
}

export function HomeViewProjectsButton() {
  const router = useRouter();
  const { themeState } = useTheme();
  const { xs, sm } = useGlobalMediaQuery();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: xs ? "column" : "row",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <GenericButton
        text="Projects"
        onClick={() => router.push("/projects")}
        color={"yellow"}
        customVariant={themeState == "light" ? "filled" : "outline"}
        extraStyles={{ margin: 5 }}
      />

      <GenericButton
        text="Linkedin"
        href={process.env.NEXT_PUBLIC_LINKEDIN}
        color={"blue"}
        customVariant={themeState == "light" ? "filled" : "outline"}
        extraStyles={{ margin: 5 }}
        isLinkable
        newTab
      />

      <GenericButton
        text="Resume"
        href={process.env.NEXT_PUBLIC_RESUME}
        color={"cyan"}
        customVariant={themeState == "light" ? "filled" : "outline"}
        extraStyles={{ margin: 5 }}
        isLinkable
        newTab
      />
    </div>
  );
}
