import { GetStaticProps } from "next";
import ProjectsContents from "../features/projects/projects-contents";
import { getProjectsAsync } from "../features/projects/project-data";
import Error from "next/error";

export default function ProjectsPage({ projects }: { projects: any }) {
  return <ProjectsContents projects={projects} />;
}

export const getStaticProps: GetStaticProps = async () => {
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
