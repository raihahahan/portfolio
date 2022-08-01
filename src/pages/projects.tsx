import { GetStaticProps } from "next";
import ProjectsContents from "../features/projects/projects-contents";
import { getProjectsAsync } from "../features/projects/project-data";

export default function ProjectsPage({ projects }: { projects: any }) {
  if (projects.length == 0) {
    alert("An error occurred while fetching data.");
  }
  return <ProjectsContents projects={projects} />;
}

export const getStaticProps: GetStaticProps = async (context) => {
  try {
    const projects = await getProjectsAsync();
    return {
      props: { projects },
      revalidate: 10,
    };
  } catch (error) {
    return { props: { projects: [] }, revalidate: 10 };
  }
};
