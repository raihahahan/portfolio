import { Anchor, Navbar } from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/router";
import { CSSProperties } from "react";
import { Burger, Header, MediaQuery } from "@mantine/core";
import React from "react";
import useTheme from "../../common/hooks/useTheme";
import anchorData from "./site-data";
import RectangleTitle from "../../common/components/components-branding";
import { anchorTitles, routes } from "./site-types";
import ToggleThemeButton from "../theme/theme-components";

export function MyNavbar({ opened }: { opened: boolean }) {
  const { classes, siteColors } = useTheme();
  return (
    <Navbar
      className={`${classes.navbar}`}
      style={{ backgroundColor: siteColors.navbar }}
      width={{ base: "100%", sm: 0 }}
      hidden={!opened}
    >
      <AnchorLinks isSmall />
    </Navbar>
  );
}

export function AnchorLinks({ isSmall }: { isSmall: boolean }) {
  const router = useRouter();
  return (
    <div style={{ display: "flex", flexDirection: isSmall ? "column" : "row" }}>
      {anchorData.map((item) => {
        return (
          <CustomAnchor
            key={item.anchorRoute}
            title={item.title}
            anchorRoute={item.anchorRoute}
            isSmall={isSmall}
          />
        );
      })}
    </div>
  );
}

export function CustomAnchor({
  title,
  anchorRoute,
  isSmall,
  extraTextStyles,
}: {
  title: anchorTitles;
  anchorRoute: routes;
  isSmall: boolean;
  extraTextStyles?: CSSProperties | undefined;
}) {
  const { colorTheme, siteColors, classes } = useTheme();
  const route = useRouter();
  return (
    // <Anchor style={{ margin: 20 }}>
    <Link href={anchorRoute} passHref>
      <Anchor
        style={{
          margin: 20,
          textDecoration: anchorRoute == route.pathname ? "underline" : "none",
          color: siteColors.text.primary,
        }}
      >
        {title}
      </Anchor>
    </Link>
    // </Anchor>
  );
}

export function MyFooter() {}

export default function MainHeader({
  openControl,
}: {
  openControl: {
    opened: boolean;
    setOpened: React.Dispatch<React.SetStateAction<boolean>>;
  };
}) {
  const { siteColors, classes, themeState } = useTheme();
  const { opened, setOpened } = openControl;
  return (
    <Header
      height={70}
      p="md"
      style={{ borderWidth: 0, backgroundColor: siteColors.header }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: "100%",
        }}
      >
        <MediaQuery largerThan="sm" styles={{ display: "none" }}>
          <Burger
            style={{ color: siteColors.text.primary }}
            opened={opened}
            onClick={() => setOpened((o) => !o)}
            size="sm"
            mr="xl"
          />
        </MediaQuery>
        <Link href="/" passHref>
          <a>
            <RectangleTitle
              widthSize={200}
              type={themeState == "light" ? "default" : "dark"}
            />
          </a>
        </Link>
        <Link href="/" passHref>
          <a>
            <div></div>
          </a>
        </Link>
        <ToggleThemeButton color={siteColors.text.primary} size={24} />
        <div
          className={classes.links}
          style={{
            position: "absolute",
            right: 0,
          }}
        >
          <AnchorLinks isSmall={false} />
        </div>
      </div>
    </Header>
  );
}
