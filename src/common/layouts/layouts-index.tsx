import React, { useState } from "react";
import { AppShell, Footer } from "@mantine/core";

// import BackToHomeButton from "../components/buttons/back-to-home";
// import HomeFooter from "../contents/home/home-footer";
import useTheme from "../hooks/useTheme";
import MainHeader, { MyNavbar } from "../components/components-global";

export const siteTitle = "M.Raihan";

export default function MainLayout({
  children,
  home,
}: {
  children: any;
  home: boolean;
}) {
  const [opened, setOpened] = useState(false);
  const { siteColors, colorTheme } = useTheme();

  return (
    <>
      <AppShell
        styles={{
          main: {
            borderWidth: 0,
          },
        }}
        style={{ backgroundColor: siteColors.background }}
        navbarOffsetBreakpoint="sm"
        asideOffsetBreakpoint="sm"
        padding={0}
        fixed
        navbar={<MyNavbar opened={opened} />}
        header={<MainHeader openControl={{ opened, setOpened }} />}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            justifyContent: "center",
            marginBottom: 0,
            color: siteColors.text.primary,
            overflow: "hidden",
          }}
        >
          {children}
        </div>
        {/* <BackToHomeButton home={home} /> */}
      </AppShell>
      {/* <HomeFooter stylesArr={[myTheme, classes, colors]} /> */}
    </>
  );
}
