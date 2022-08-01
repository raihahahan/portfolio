import { Grid } from "@mantine/core";
import { breakpoints } from "../theme/theme-data";
import ProjectComponent from "./project-component";
import { projectDataType } from "./project-types";

export default function ProjectsContents({
  projects,
}: {
  projects: projectDataType[];
}) {
  return (
    <Grid
      gutter="lg"
      align="center"
      style={{ maxWidth: breakpoints.xl * 0.8, margin: 10 }}
    >
      {projects.map((item, index) => {
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
            <ProjectComponent item={item} key={item.id} />
          </Grid.Col>
        );
      })}
    </Grid>
  );
}
