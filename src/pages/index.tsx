import { GetStaticProps } from "next";
import HomeContents from "../features/home/home-contents";
import { getTaglineAsync, homeIntroTextData } from "../features/home/home-data";
import { projectDataType } from "../features/projects/project-types";
import { getProjectsAsync } from "../features/projects/project-data";
import {
  getEducationAsync,
  getResumeAsync,
} from "../features/resume/resume-data";
import { ResumeItem } from "../features/resume/resume-types";

export default function Home({
  tagline,
  projects,
  resume,
  education,
}: {
  tagline: string;
  projects: projectDataType[];
  resume: ResumeItem[];
  education: ResumeItem[];
}) {
  return (
    <HomeContents
      tagline={tagline}
      projects={projects}
      resume={resume}
      education={education}
    />
  );
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    const tagline = await getTaglineAsync();
    const projects = await getProjectsAsync(1);
    const resume = await getResumeAsync();
    const education = await getEducationAsync();

    return {
      props: { tagline, projects, resume, education },
      revalidate: 10,
    };
  } catch (error) {
    return {
      props: {
        tagline: homeIntroTextData,
        projects: [],
        resume: [],
        education: [],
      },
      revalidate: 10,
    };
  }
};
