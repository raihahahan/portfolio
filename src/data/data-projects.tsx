import { Text } from "@mantine/core";
import Link from "next/link";
import { LinkText } from "../common/components/components-utils";
import { projectDataType } from "../common/types/types-project";

export const projectData: projectDataType[] = [
  {
    id: "0",
    title: "ParkMyBike SG",
    imgSrc: "/images/pmb-feature-graphic.png",
    shortDescription: "Bicycle Parking Locator App",
    description: (
      <Text>
        I’m the creator of{" "}
        <LinkText
          text="ParkMyBike SG"
          link="https://www.melonbase.com/projects/park-my-bike-sg"
          extraTextStyles={{ fontWeight: "bold" }}
        />
        , an Android app that shows bicycle parking locations around Singapore.
        As of the time of writing, the app is still under Play Store review. An
        iOS version will soon be released. I did everything myself including the
        logo and the UX design using Figma.
      </Text>
    ),
    lastUpdated: new Date(2022, 6, 28),
    importance: 0.98,
    frameworks: ["React Native"],
    skills: [
      "TypeScript",
      "React Native",
      "Java",
      "Google Analytics",
      "Supabase",
      "Figma",
      "Google Admob",
      "Mapbox SDK",
      "NodeJS",
    ],
    projectAnalysis: {
      projectType: "Mobile App",
      projectCondition: "stable",
      languageUsePercentage: [
        {
          title: "TypeScript",
          perc: 0.909,
        },
        {
          title: "Java",
          perc: 0.051,
        },
        {
          title: "C++",
          perc: 0.021,
        },
        {
          title: "Others",
          perc: 0.019,
        },
      ],
    },
    buttons: [
      {
        title: "Learn More",
        link: "https://www.melonbase.com/projects/park-my-bike-sg",
      },
      {
        title: "Play Store",
        link: "#",
      },
      {
        title: "App Store",
        link: "#",
      },
    ],
  },
  {
    id: "1",
    title: "Green App",
    imgSrc: "/images/greenapp-header.png",
    shortDescription: "Environmental Habit App",
    description: (
      <Text>
        I'm the creator of the team project called{" "}
        <LinkText
          text="Green App"
          link="https://docs.google.com/presentation/d/1PspER53O7RmHBPSRTn1fTjN4_VwW28T-9jVlQHpVhYE/edit#slide=id.g11c3002af2c_0_321"
          extraTextStyles={{ fontWeight: "bold" }}
        />{" "}
        (see contributors below). It is a mobile app that incentivises users to
        pick up environmentally friendly habits through rewards and incentives.
        As this was my first React Native project, I plan to refactor this app
        in the future. This app was used as submission for the{" "}
        <LinkText
          text="Climate Hack Hackathon 2022"
          link="https://drive.google.com/file/d/1jlcl4GeVKO9uDDEL84r6sRBut8pUvD4B/view?usp=sharing"
          extraTextStyles={{ fontWeight: "bold" }}
        />
        .
      </Text>
    ),
    lastUpdated: new Date(2022, 4, 17),
    importance: 0.97,
    contributors: ["riamundhra02", "apollo-tan", "Jaynon"],
    frameworks: ["React Native"],
    skills: [
      "JavaScript",
      "React Native",
      "Firebase",
      "Google Analytics",
      "NodeJS",
    ],
    projectAnalysis: {
      projectType: "Mobile App",
      projectCondition: "needs refactor",
      languageUsePercentage: [
        {
          title: "JavaScript",
          perc: 1,
        },
      ],
    },
    buttons: [
      {
        title: "Learn More",
        link: "https://docs.google.com/presentation/d/1PspER53O7RmHBPSRTn1fTjN4_VwW28T-9jVlQHpVhYE/edit#slide=id.g11c3002af2c_0_321",
      },
      {
        title: "Live Demo",
        link: "#",
      },
    ],
  },
  {
    id: "2",
    title: "Melonbase",
    imgSrc: "/images/melonbase-header.png",
    shortDescription: "Landing Page",
    description:
      "Landing page for Melonbase, the informal entity created to house my monetised app projects.",
    lastUpdated: new Date(2022, 6, 27),
    importance: 0.96,
    frameworks: ["React", "NextJS"],
    skills: ["React", "NextJS", "Figma"],
    projectAnalysis: {
      projectType: "Web Development",
      projectCondition: "stable",
      languageUsePercentage: [
        {
          title: "TypeScript",
          perc: 0.937,
        },
        {
          title: "CSS",
          perc: 0.061,
        },
        {
          title: "JavaScript",
          perc: 0.02,
        },
      ],
    },
    buttons: [
      {
        title: "Live Demo",
        link: "https://www.melonbase.com",
      },
    ],
  },
  {
    id: "3",
    title: "SICP Progress",
    shortDescription: "Progress Tracker Repo",
    description:
      "A project that tracks my progress in the Computer Science textbook: Structure and Interpretation of Computer Programs",
    lastUpdated: new Date(2022, 4, 23),
    importance: 0.95,
    skills: ["Racket", "Programming Methodologies"],
    projectAnalysis: {
      projectType: "Computer Science study",
      projectCondition: "stable",
      languageUsePercentage: [
        {
          title: "Racket",
          perc: 1,
        },
      ],
    },
    buttons: [
      {
        title: "View on Github",
        link: "https://github.com/raihahahan/SICP",
      },
    ],
  },
  {
    id: "4",
    title: "SG Locations",
    shortDescription: "Python CLI Program",
    description:
      "A CLI program that gives you names of places in Singapore in different data structures.",
    lastUpdated: new Date(2022, 5, 14),
    importance: 0.9,
    skills: ["Python", "CLI"],
    projectAnalysis: {
      projectType: "Command-line interface",
      projectCondition: "stable",
      languageUsePercentage: [
        {
          title: "Python",
          perc: 0.624,
        },
        {
          title: "JavaScript",
          perc: 0.376,
        },
      ],
    },
    buttons: [
      {
        title: "View on Github",
        link: "https://github.com/raihahahan/singapore-places-names",
      },
    ],
  },
  {
    id: "5",
    title: "Anon App",
    shortDescription: "Anonymous Chat App",
    description: "A mobile app that lets you chat with people anonymously",
    lastUpdated: new Date(2022, 2, 6),
    importance: 0.5,
    frameworks: ["React Native"],
    skills: ["JavaScript", "React Native", "Firebase"],
    projectAnalysis: {
      projectType: "Mobile App",
      projectCondition: "not maintained",
      languageUsePercentage: [
        {
          title: "JavaScript",
          perc: 1,
        },
      ],
    },
    buttons: [
      {
        title: "Learn More",
        link: "#",
      },
    ],
  },
];
