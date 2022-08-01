import { Grid } from "@mantine/core";
import useTheme from "../../common/hooks/useTheme";
import { breakpoints } from "../theme/theme-data";
import ProjectComponent from "./project-component";
import { projectData } from "./project-data";

export default function ProjectsContents() {
  const { siteColors } = useTheme();
  return (
    <Grid
      gutter="lg"
      align="center"
      style={{ maxWidth: breakpoints.xl * 0.8, margin: 10 }}
    >
      {projectData(siteColors).map((item, index) => {
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
