import { Grid } from "@mantine/core";
import ProjectComponent from "./project-component";
import { projectDataType } from "./project-types";

export default function ProjectsContents({
  projects,
}: {
  projects: projectDataType[];
}) {
  return (
    <Grid gutter="lg" align="stretch" style={{ margin: 10 }}>
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
