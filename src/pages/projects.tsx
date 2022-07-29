import { Grid } from "@mantine/core";
import ProjectComponent from "../common/components/components-project";
import useTheme from "../common/hooks/useTheme";
import HomeContentLayout from "../common/layouts/layouts-home";
import MainLayout from "../common/layouts/layouts-index";
import { projectData } from "../data/data-projects";

export default function ProjectsPage() {
  const { siteColors } = useTheme();
  return (
    <MainLayout home={false}>
      <Grid gutter="lg" grow justify={"center"}>
        {projectData.map((item) => {
          return (
            <Grid.Col key={item.id} sm={6} lg={4}>
              <ProjectComponent item={item} />
            </Grid.Col>
          );
        })}
      </Grid>
    </MainLayout>
  );
}
