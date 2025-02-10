import { Anchor, Button, Navbar, Text } from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/router";
import { CSSProperties, useEffect, useState } from "react";
import { Burger, Header, MediaQuery } from "@mantine/core";
import React from "react";
import useTheme from "../../common/hooks/useTheme";
import anchorData, { footerData } from "./site-data";
import RectangleTitle from "../../common/components/components-branding";
import { anchorTitles, routes } from "./site-types";
import ToggleThemeButton from "../theme/theme-components";
import { useThemeReturnType } from "../theme/theme-types";
import useGlobalMediaQuery from "../../common/hooks/useGlobalMediaQueries";
import { AboutProfileIcon } from "../about/about-components";
import { faceImageSrc } from "../about/about-data";
import { breakpoints } from "../theme/theme-data";
import {
  IconCaretDown,
  IconChevronDown,
  IconChevronsDown,
} from "@tabler/icons";

export function MyNavbar({
  openControl,
}: {
  openControl: {
    opened: boolean;
    setOpened: React.Dispatch<React.SetStateAction<boolean>>;
  };
}) {
  const { classes, siteColors } = useTheme();
  return (
    <Navbar
      className={`${classes.navbar}`}
      style={{ backgroundColor: siteColors.navbar }}
      width={{ base: "100%", sm: 0 }}
      hidden={!openControl.opened}
    >
      <AnchorLinks isSmall openControl={openControl} />
    </Navbar>
  );
}

export function AnchorLinks({
  isSmall,
  openControl,
}: {
  isSmall: boolean;
  openControl?: {
    opened: boolean;
    setOpened: React.Dispatch<React.SetStateAction<boolean>>;
  };
}) {
  const { siteColors } = useTheme();
  const router = useRouter();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: isSmall ? "column" : "row",
        backgroundColor: !isSmall ? "transparent" : siteColors.background,
        height: isSmall ? "100vh" : undefined,
      }}
    >
      {anchorData.map((item) => {
        return (
          <CustomAnchor
            key={item.anchorRoute}
            title={item.title}
            anchorRoute={item.anchorRoute}
            openControl={openControl}
          />
        );
      })}
    </div>
  );
}

export function CustomAnchor({
  title,
  anchorRoute,
  openControl,
  extraTextStyles,
}: {
  title: anchorTitles;
  anchorRoute: routes;
  openControl?: {
    opened: boolean;
    setOpened: React.Dispatch<React.SetStateAction<boolean>>;
  };
  extraTextStyles?: CSSProperties | undefined;
}) {
  const { siteColors } = useTheme();
  const route = useRouter();
  return (
    <Link href={anchorRoute} passHref>
      <Anchor
        onClick={openControl ? () => openControl.setOpened(false) : undefined}
        style={{
          margin: 20,
          // textDecoration: anchorRoute == route.pathname ? "underline" : "none",
          color:
            anchorRoute == route.pathname ? "red" : siteColors.text.primary,
          ...extraTextStyles,
        }}
      >
        {title}
      </Anchor>
    </Link>
  );
}

export function MyFooter({ extraStyles }: { extraStyles?: CSSProperties }) {
  const { siteColors: colors } = useTheme();
  const { sm } = useGlobalMediaQuery();
  return (
    <section
      id="FOOTER"
      style={{
        backgroundColor: colors.header,
        width: "100vw",
        height: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        paddingTop: sm ? 20 : 0,
        ...extraStyles,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: sm ? "column" : "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {footerData.map((item) => {
          return (
            <CustomAnchor
              key={item.title}
              title={item.title}
              anchorRoute={item.anchorRoute}
              extraTextStyles={{ color: colors.text.secondary, fontSize: 14 }}
            />
          );
        })}
      </div>
    </section>
  );
}

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
            color={siteColors.text.primary}
            style={{ color: siteColors.text.primary }}
            opened={opened}
            onClick={() => setOpened((o) => !o)}
            size="sm"
            mr="xl"
          />
        </MediaQuery>
        <Link href="/" passHref>
          <a onClick={() => setOpened(false)}>
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

export function MainHeader2({
  openControl,
}: {
  openControl: {
    opened: boolean;
    setOpened: React.Dispatch<React.SetStateAction<boolean>>;
  };
}) {
  const { siteColors, classes, themeState } = useTheme();
  const { opened, setOpened } = openControl;
  const [scrollY, setScrollY] = useState(0); // Tracks current scroll position
  const [isHeaderVisible, setIsHeaderVisible] = useState(true); // Tracks header visibility
  const [isThresholdReached, setIsThresholdReached] = useState(false); // Tracks if threshold is crossed
  const threshold = 40; // Adjust the threshold value as needed
  const { xs, sm } = useGlobalMediaQuery();

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > threshold) {
        setIsThresholdReached(true);

        if (currentScrollY > lastScrollY) {
          // Scrolling down
          setIsHeaderVisible(false);
        } else {
          // Scrolling up
          setIsHeaderVisible(true);
        }
      } else {
        setIsThresholdReached(false);
        setIsHeaderVisible(true); // Always show header above the threshold
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <Header
      height={70}
      p="md"
      style={{
        borderWidth: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center", // Center all content
        backgroundColor: sm && opened ? siteColors.background : "transparent",
        margin: 10,
        position: "fixed",
        top: sm && opened ? 0 : isHeaderVisible ? 0 : "-90px",
        transition: "top 0.3s ease",
      }}
    >
      {/* Centered Wrapper */}
      <div
        style={{
          width: !sm ? "70%" : "100%", // Limit content width to 70%
          maxWidth: breakpoints.lg,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between", // Space out the icon, links, and toggle
        }}
      >
        {/* Left: Icon */}
        <Link href="/" passHref>
          <a onClick={() => setOpened(false)}>
            <AboutProfileIcon
              url={faceImageSrc}
              width={"39px"}
              height={"39px"}
              extraStyles={{ borderRadius: 300 }}
            />
          </a>
        </Link>

        {/* Center: Links */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "50px",
            boxShadow: sm ? undefined : "0 4px 10px rgba(0, 0, 0, 0.1)",
            padding: "10px 30px",
            borderRadius: "100px",
            backgroundColor: sm
              ? "transparent"
              : themeState == "dark"
              ? siteColors.header
              : siteColors.background,
            flexGrow: 1, // Allow the links area to adjust flexibly
            maxWidth: "60%", // Ensure links container doesn't grow too large
            minWidth: sm ? 0 : 420,
            width: sm ? "10px" : undefined,
            marginLeft: 4,
            marginRight: 4,
          }}
        >
          <div className={classes.links}>
            <AnchorLinks isSmall={sm} openControl={openControl} />
          </div>
        </div>

        {sm && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Button component="a" href="/blog" color="orange">
              Blog
            </Button>
            <Button
              color="orange"
              onClick={() => setOpened((o) => !o)}
              variant={"subtle"}
              size={"sm"}
            >
              <Burger
                size="sm"
                opened={opened}
                color={siteColors.text.primary}
              />
            </Button>
            <ToggleThemeButton color={siteColors.text.primary} size={24} />
          </div>
        )}

        {/* Right: Toggle Theme Button */}
        {!sm && <ToggleThemeButton color={siteColors.text.primary} size={24} />}
      </div>
    </Header>
  );
}
