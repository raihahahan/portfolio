import { ActionIcon, Anchor, Card, Grid, Title, Tooltip } from "@mantine/core";
import { CSSProperties } from "react";
import useTheme from "../../common/hooks/useTheme";
import { breakpoints } from "../theme/theme-data";
import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconMail,
  IconPaperclip,
} from "@tabler/icons";
import { links } from "./home-data";
import useGlobalMediaQuery from "../../common/hooks/useGlobalMediaQueries";
import ScrollToTopFAB from "../../common/components/components-utils";

export function LayoutAnchorLinks() {
  const iconMap = {
    GitHub: {
      icon: <IconBrandGithub />,
      tooltip: "GitHub",
    },
    LinkedIn: {
      icon: <IconBrandLinkedin />,
      tooltip: "LinkedIn",
    },
    Email: {
      icon: <IconMail />,
      tooltip: "Email",
    },
    Resume: {
      icon: <IconPaperclip />,
      tooltip: "Resume",
    },
  };
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-start",
        gap: "10px",
      }}
    >
      {links.map((l) => {
        const { icon, tooltip } = (iconMap as any)[l.title] || {};
        if (!icon || !tooltip) return null;
        return (
          <Tooltip label={tooltip} key={l.title}>
            <Anchor href={l.link} target="_blank">
              <ActionIcon>{icon}</ActionIcon>
            </Anchor>
          </Tooltip>
        );
      })}
    </div>
  );
}

export default function HomeContentLayout({
  children,
  id,
  extraStyles,
  headerTitle,
  headerDescription,
  align,
}: {
  children: any;
  id: string;
  extraStyles?: CSSProperties | undefined;
  headerTitle?: string;
  headerDescription?: string;
  align?: string;
}) {
  const { colorTheme, siteColors } = useTheme();
  const { sm } = useGlobalMediaQuery();

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
          alignItems: align ?? "center",
          justifyContent: "center",
          flexDirection: "column",
          backgroundColor: colorTheme.background,
          borderWidth: 0,
          borderRadius: "0px",
          width: "100%",
          maxWidth: breakpoints.lg - 20,
        }}
      >
        <Grid
          grow
          style={{
            width: "100%",
            marginTop: 30,
          }}
        >
          {headerTitle && headerDescription && (
            <Grid.Col
              span={12}
              style={{ marginBottom: 10, maxWidth: sm ? "100vw" : "50vw" }}
            >
              <Title
                order={1}
                sx={{
                  color: siteColors.text.primary,
                  marginTop: 10,
                  marginBottom: 10,
                }}
              >
                {headerTitle}
              </Title>

              <Title
                color={"white"}
                order={4}
                sx={{
                  color: siteColors.text.primary,
                  fontWeight: "lighter",
                  marginTop: 10,
                  marginBottom: 10,
                }}
              >
                {headerDescription}
              </Title>
              <LayoutAnchorLinks />
            </Grid.Col>
          )}
        </Grid>
        {children}
      </Card>
      <ScrollToTopFAB />
    </section>
  );
}
