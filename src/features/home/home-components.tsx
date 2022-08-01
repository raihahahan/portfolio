import { Text } from "@mantine/core";
import Image from "next/image";
import { useRouter } from "next/router";
import GenericButton from "../../common/components/components-buttons";
import useTheme from "../../common/hooks/useTheme";
import { homeBannerImgSrc, homeIntroTextData } from "./home-data";

export function HomeBannerImage({ customHeight }: { customHeight?: 2000 }) {
  const WIDTH = 1880;
  const HEIGHT = 422;
  const RATIO = HEIGHT / WIDTH;

  return (
    <Image
      priority
      src={homeBannerImgSrc}
      alt="raihahahan"
      width={2000}
      height={customHeight ? RATIO * customHeight : RATIO * 2000}
    />
  );
}

export function HomeIntroText() {
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
      {homeIntroTextData}
    </Text>
  );
}

export function HomeViewProjectsButton() {
  const router = useRouter();

  return (
    <GenericButton
      text="View Projects"
      onClick={() => router.push("/projects")}
      color="dark"
    />
  );
}
