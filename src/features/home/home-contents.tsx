import useGlobalMediaQuery from "../../common/hooks/useGlobalMediaQueries";
import useTheme from "../../common/hooks/useTheme";
import HomeContentLayout from "./home-layout";
import { Anchor, Grid, Group, Title } from "@mantine/core";
import { projectDataType } from "../projects/project-types";
import ProjectComponent from "../projects/project-component";
import { breakpoints } from "../theme/theme-data";
import { ResumeItem } from "../resume/resume-types";
import { Resume } from "../resume/resume-components";
import { Post } from "../../../tina/__generated__/types";
import { BlogCard } from "../blog/blog-components";

export default function HomeContents({
  tagline,
  projects,
  resume,
  education,
  blog,
}: {
  tagline: string;
  projects: projectDataType[];
  resume: ResumeItem[];
  education: ResumeItem[];
  blog: Post[];
}) {
  const { siteColors, colorTheme } = useTheme();
  const { sm, md, xs } = useGlobalMediaQuery();

  return (
    <HomeContentLayout
      id="ABOUT"
      headerTitle="Raihan Rizqullah"
      headerDescription={tagline}
    >
      <Grid grow style={{ width: "100%", marginTop: 30 }}>
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
              <Group>
                <Title sx={{ color: siteColors.text.primary }} order={4}>
                  📌 Featured Project{" "}
                </Title>
                <Anchor href="/projects" color="orange">
                  View all
                </Anchor>
              </Group>
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
            {!sm && (
              <Grid.Col span={12} style={{ display: "flex" }}>
                <Title sx={{ color: siteColors.background }} order={4}>
                  {"."}
                </Title>
              </Grid.Col>
            )}
            <Grid.Col key={"resume"} span={12}>
              <Resume resume={resume} type="💼 Work" />
            </Grid.Col>
            {blog.map((p) => {
              return (
                <Grid.Col key={p.title} span={12}>
                  <BlogCard post={p} />
                </Grid.Col>
              );
            })}
          </Grid>
        </Grid.Col>
      </Grid>
    </HomeContentLayout>
  );
}
