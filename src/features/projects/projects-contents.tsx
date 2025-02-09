import { Grid } from "@mantine/core";
import { breakpoints } from "../theme/theme-data";
import ProjectComponent from "./project-component";
import { projectDataType } from "./project-types";
import HomeContentLayout from "../home/home-layout";

export default function ProjectsContents({
  projects,
}: {
  projects: projectDataType[];
}) {
  return (
    <HomeContentLayout
      id="PROJECTS"
      headerTitle="Projects"
      headerDescription="My favourite projects so far. More on my GitHub."
    >
      <Grid
        gutter="lg"
        align="stretch"
        style={{ margin: 10, maxWidth: breakpoints.lg }}
      >
        {projects.map((item, index) => {
          return (
            <Grid.Col
              style={{
                display: "flex",
                justifyContent: "center",
              }}
              key={item.id}
              lg={4} // 3 items per row (large screens)
              md={6} // 2 items per row (medium screens)
              sm={6} // 1 item per row (small screens)
              xs={12} // Ensures 1 item per row on extra small screens
            >
              <ProjectComponent item={item} key={item.id} />
            </Grid.Col>
          );
        })}
      </Grid>
    </HomeContentLayout>
  );
}
