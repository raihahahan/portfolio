import React, { useState } from "react";
import { AppShell, Footer } from "@mantine/core";
import useTheme from "../../common/hooks/useTheme";
import MainHeader, { MainHeader2, MyFooter, MyNavbar } from "./site-components";

export const siteTitle = "Raihan Rizqullah";

export default function SiteLayout({ children }: { children: any }) {
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
        style={{
          backgroundColor: siteColors.background,
        }}
        navbarOffsetBreakpoint="sm"
        asideOffsetBreakpoint="sm"
        padding={0}
        fixed
        navbar={<MyNavbar openControl={{ opened, setOpened }} />}
        header={<MainHeader2 openControl={{ opened, setOpened }} />}
        footer={<MyFooter />}
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
      </AppShell>
    </>
  );
}
