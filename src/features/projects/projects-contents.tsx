import { Grid } from "@mantine/core";
import { breakpoints } from "../../styles/styles-constants";
import ProjectComponent from "./project-component";
import { projectData } from "./project-data";

export default function ProjectsContents() {
  return (
    <Grid
      gutter="lg"
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
            <ProjectComponent item={item} key={item.id} />
          </Grid.Col>
        );
      })}
    </Grid>
  );
}
