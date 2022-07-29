import { Anchor, Navbar } from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/router";
import { CSSProperties } from "react";
import anchorData from "../../data/data-links";
import useTheme from "../hooks/useTheme";
import { anchorTitles, routes } from "../types/types-site";
import { Burger, Header, MediaQuery } from "@mantine/core";
import React from "react";
import RectangleTitle from "./components-branding";

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
    <Anchor style={{ margin: 20 }}>
      <Link href={anchorRoute} passHref>
        <a
          style={{
            textDecoration:
              anchorRoute == route.pathname ? "underline" : "none",
            color: siteColors.text.primary,
          }}
        >
          {title}
        </a>
      </Link>
    </Anchor>
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
  const { siteColors, colorTheme, classes } = useTheme();
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
            <RectangleTitle widthSize={200} type={"default"} />
          </a>
        </Link>
        <Link href="/" passHref>
          <a>
            <div></div>
          </a>
        </Link>
        {/* <ToggleTheme color={colors.text.text_on_p.color} size={24} /> */}
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
