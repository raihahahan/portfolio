import { Card } from "@mantine/core";
import { CSSProperties } from "react";
import useTheme from "../../common/hooks/useTheme";
import { breakpoints } from "../theme/theme-data";

export default function HomeContentLayout({
  children,
  id,
  extraStyles,
}: {
  children: any;
  id: string;
  extraStyles?: CSSProperties | undefined;
}) {
  const { colorTheme, siteColors } = useTheme();

  return (
    <section
      id={id}
      style={{
        backgroundColor: siteColors.background,
        width: "100vw",
        minHeight: "calc(100vh - 70px)",
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        ...(extraStyles as object),
      }}
    >
      <Card
        shadow="sm"
        p="lg"
        withBorder
        style={{
          marginTop: 0,
          marginBottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          backgroundColor: colorTheme.background,
          borderWidth: 0,
          borderRadius: "0px",
          width: "100%",
          maxWidth: breakpoints.lg - 20,
        }}
      >
        {children}
      </Card>
    </section>
  );
}
