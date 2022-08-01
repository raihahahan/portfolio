import { Grid } from "@mantine/core";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../redux/store";
import { breakpoints } from "../theme/theme-data";
import ProjectComponent from "./project-component";
import { projectDataType } from "./project-types";
import { getProjects, selectProjects } from "./projectsSlice";

export default function ProjectsContents() {
  const [displayedProjects, setDisplayedProjects] = useState<projectDataType[]>(
    []
  );
  const dispatch = useDispatch<AppDispatch>();
  const allProjects = useSelector(selectProjects);

  useEffect(() => {
    dispatch(getProjects());
    setDisplayedProjects(allProjects);
  }, [, displayedProjects]);

  return (
    <Grid
      gutter="lg"
      align="center"
      style={{ maxWidth: breakpoints.xl * 0.8, margin: 10 }}
    >
      {displayedProjects.map((item, index) => {
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
