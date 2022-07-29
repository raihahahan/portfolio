import { projectDataType } from "../common/types/types-project";

export const projectData: projectDataType[] = [
  {
    id: "0",
    title: "ParkMyBike SG",
    imgSrc: "/images/pmb-feature-graphic.png",
    shortDescription:
      "A mobile app to show bicycle parking locations in Singapore.",
    description: "A mobile app to show bicycle parking locations in Singapore.",
    lastUpdated: new Date(2022, 6, 28),
    importance: 0.98,
    frameworks: ["React Native"],
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
    button: {
      title: "Learn More",
      link: "https://www.melonbase.com/projects/park-my-bike-sg",
    },
    extraStoreButtons: [
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
    shortDescription:
      "A mobile app that incentivises users to pick up environmentally friendly habits",
    description:
      "A mobile app that incentivises users to pick up environmentally friendly habits",
    lastUpdated: new Date(2022, 4, 17),
    importance: 0.97,
    contributors: ["riamundhra02", "apollo-tan", "Jaynon"],
    frameworks: ["React Native"],
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
    button: {
      title: "Live Demo",
      link: "#",
    },
  },
  {
    id: "2",
    title: "Melonbase landing page",
    imgSrc: "/images/melonbase-header.png",
    shortDescription:
      "Landing page for Melonbase, the informal entity created to house my monetised app projects.",
    description:
      "Landing page for Melonbase, the informal entity created to house my monetised app projects.",
    lastUpdated: new Date(2022, 6, 27),
    importance: 0.96,
    frameworks: ["React", "NextJS"],
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
    button: {
      title: "Live Demo",
      link: "https://www.melonbase.com",
    },
  },
  {
    id: "3",
    title: "SICP Progress Project",
    shortDescription:
      "A project that tracks my progress in the Computer Science textbook: Structure and Interpretation of Computer Programs",
    description:
      "A project that tracks my progress in the Computer Science textbook: Structure and Interpretation of Computer Programs",
    lastUpdated: new Date(2022, 4, 23),
    importance: 0.95,
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
    button: {
      title: "Run Locally",
      link: "https://github.com/raihahahan/SICP",
    },
  },
  {
    id: "4",
    title: "SG Locations Python CLI",
    shortDescription:
      "A CLI program that gives you names of places in Singapore in different data structures.",
    description:
      "A CLI program that gives you names of places in Singapore in different data structures.",
    lastUpdated: new Date(2022, 5, 14),
    importance: 0.9,
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
    button: {
      title: "Run Locally",
      link: "https://github.com/raihahahan/singapore-places-names",
    },
  },
  {
    id: "5",
    title: "Anononymous Chat App",
    shortDescription: "A mobile app that lets you chat with people anonymously",
    description: "A mobile app that lets you chat with people anonymously",
    lastUpdated: new Date(2022, 2, 6),
    importance: 0.5,
    frameworks: ["React Native"],
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
    button: {
      title: "Learn More",
      link: "#",
    },
  },
];
