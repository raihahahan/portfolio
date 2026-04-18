import { GetStaticProps } from "next";
import Seo from "../common/components/components-seo";
import ProjectsContents from "../features/projects/projects-contents";
import { getProjectsAsync } from "../features/projects/project-data";
import Error from "next/error";

export default function ProjectsPage({ projects }: { projects: any }) {
  return (
    <>
      <Seo
        title="Projects"
        description="Projects across backend systems, developer tools, mobile apps, and product engineering."
        path="/projects"
        keywords={[
          "software projects",
          "backend projects",
          "mobile app projects",
          "developer tools",
          "Raihan Rizqullah projects",
        ]}
      />
      <ProjectsContents projects={projects} />
    </>
  );
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
