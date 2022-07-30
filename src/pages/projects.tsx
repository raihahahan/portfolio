import { Grid } from "@mantine/core";
import ProjectComponent from "../common/components/components-project";
import useGlobalMediaQuery from "../common/hooks/useGlobalMediaQueries";
import useTheme from "../common/hooks/useTheme";
import HomeContentLayout from "../common/layouts/layouts-home";
import MainLayout from "../common/layouts/layouts-index";
import { projectData } from "../data/data-projects";
import { breakpoints } from "../styles/styles-constants";

export default function ProjectsPage() {
  const { siteColors } = useTheme();
  const { xl } = useGlobalMediaQuery();
  return (
    <MainLayout home={false}>
      <Grid
        gutter="lg"
        justify={"center"}
        align="center"
        style={{ maxWidth: breakpoints.xl * 0.8, margin: 10 }}
      >
        {projectData.map((item, index) => {
          return (
            <Grid.Col
              style={{
                display: "flex",
                justifyContent: "center",
              }}
              key={item.id}
              sm={6}
              lg={4}
            >
              <ProjectComponent item={item} />
            </Grid.Col>
          );
        })}
      </Grid>
    </MainLayout>
  );
}
