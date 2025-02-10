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
import { fetchBlogs } from "../features/blog/blog-data";
import { Post } from "../../tina/__generated__/types";

export default function Home({
  tagline,
  projects,
  resume,
  education,
  blog,
}: {
  tagline: string;
  projects: projectDataType[];
  resume: ResumeItem[];
  education: ResumeItem[];
  blog: Post[];
}) {
  return (
    <HomeContents
      tagline={tagline}
      projects={projects}
      resume={resume}
      education={education}
      blog={blog}
    />
  );
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    const tagline = await getTaglineAsync();
    const projects = await getProjectsAsync(1);
    const resume = await getResumeAsync();
    const education = await getEducationAsync();
    const blog = await fetchBlogs(2);

    return {
      props: { tagline, projects, resume, education, blog },
      revalidate: 10,
    };
  } catch (error) {
    return {
      props: {
        tagline: homeIntroTextData,
        projects: [],
        resume: [],
        education: [],
        blog: [],
      },
      revalidate: 10,
    };
  }
};
