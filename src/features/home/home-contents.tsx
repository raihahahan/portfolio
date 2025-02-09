import useGlobalMediaQuery from "../../common/hooks/useGlobalMediaQueries";
import useTheme from "../../common/hooks/useTheme";
import HomeContentLayout from "./home-layout";
import { ActionIcon, Anchor, Grid, Title, Tooltip } from "@mantine/core";
import { projectDataType } from "../projects/project-types";
import ProjectComponent from "../projects/project-component";
import { breakpoints } from "../theme/theme-data";
import { links } from "./home-data";
import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconMail,
  IconPaperclip,
} from "@tabler/icons";
import { ResumeItem } from "../resume/resume-types";
import { Resume } from "../resume/resume-components";

export default function HomeContents({
  tagline,
  projects,
  resume,
  education,
}: {
  tagline: string;
  projects: projectDataType[];
  resume: ResumeItem[];
  education: ResumeItem[];
}) {
  const { siteColors, colorTheme } = useTheme();
  const { sm, md, xs } = useGlobalMediaQuery();
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
    <HomeContentLayout id="ABOUT">
      <Grid grow style={{ width: "100%", marginTop: 30 }}>
        {/* Profile Section */}
        <Grid.Col span={12} style={{ marginBottom: 10 }}>
          <Title
            order={1}
            sx={{
              color: siteColors.text.primary,
              marginTop: 10,
              marginBottom: 10,
            }}
          >
            Raihan Rizqullah
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
            {tagline}
          </Title>
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
        </Grid.Col>

        {/* Projects Section */}

        <Grid.Col
          span={sm ? 12 : 6}
          style={{ width: xs ? "80%" : sm ? "60%" : "50%" }}
        >
          <Grid
            gutter="lg"
            style={{
              maxWidth: breakpoints.lg + 100,
            }}
          >
            <Grid.Col span={12} style={{ display: "flex" }}>
              <Title sx={{ color: siteColors.text.primary }} order={4}>
                📌 Featured Project{" "}
                <Anchor href="/projects">(View more)</Anchor>
              </Title>
            </Grid.Col>
            {projects.map((item) => (
              <Grid.Col
                style={{
                  display: "flex",
                  justifyContent: "center",
                }}
                key={item.id}
                span={12}
              >
                <ProjectComponent item={item} />
              </Grid.Col>
            ))}
          </Grid>
        </Grid.Col>

        {/* Resume Section */}
        <Grid.Col
          span={sm ? 12 : 6}
          style={{ width: xs ? "80%" : sm ? "60%" : "50%" }}
        >
          <Grid
            gutter="lg"
            style={{
              maxWidth: breakpoints.lg + 100,
            }}
          >
            <Grid.Col span={12} style={{ display: "flex" }}>
              <Title sx={{ color: siteColors.background }} order={4}>
                {"."}
              </Title>
            </Grid.Col>
            <Grid.Col key={"resume"} span={12}>
              <Resume resume={resume} type="Work" />
            </Grid.Col>
            <Grid.Col key={"resume"} span={12}>
              <Resume resume={education} type="Education" hideDownload />
            </Grid.Col>
          </Grid>
        </Grid.Col>
      </Grid>
    </HomeContentLayout>
  );
}
