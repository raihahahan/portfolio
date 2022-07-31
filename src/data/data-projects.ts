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
    description:
      "I’m the creator of <a style='color: blue;' href='https://www.melonbase.com/projects/park-my-bike-sg' target='_blank'>**ParkMyBike SG**</a>, an Android app that shows bicycle parking locations around Singapore. As of the time of writing, the app is still under Play Store review. An iOS version will soon be released. I did everything myself including the logo and the UX design using Figma.\n\nThe app fetches data from the <a href='https://datamall.lta.gov.sg/content/datamall/en.html' style='color: blue;' target='_blank'>**LTA DataMall API**</a> and displays the bicycle parking locations as pressable markers on the app's map with <a href='https://www.mapbox.com/' target='_blank' style='color: blue;'>**Mapbox**</a>. It has several features such as Nearby Search (locations near the user's geolocation), Normal Search, Pin Search (reverse search by placing a pin) and Favourites. It also has dark mode functionality.",
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
    description:
      "I'm the creator of the team project called <a href='https://docs.google.com/presentation/d/1PspER53O7RmHBPSRTn1fTjN4_VwW28T-9jVlQHpVhYE/edit#slide=id.g11c3002af2c_0_321' target='_blank' style='color: blue;'>**Green App**</a>  (see contributors below).\n\nIt is a mobile app that incentivises users to pick up green habits through rewards and incentives. The app allows users to complete tasks and earn `Green Points`. Users are also able to view users' profiles, see their completed tasks and total `Green Points`, and add others as their friend.\n\nAs this was my first React Native project, I plan to refactor this app in the future. This app was used as submission for the <a href='https://drive.google.com/file/d/1jlcl4GeVKO9uDDEL84r6sRBut8pUvD4B/view?usp=sharing' target='_blank' style='color: blue;'>**Climate Hack Hackathon 2022**</a>.",
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
        link: "https://docs.google.com/presentation/d/1PspER53O7RmHBPSRTn1fTjN4_VwW28T-9jVlQHpVhYE/edit#slide=id.g12ad53c495a_1_2",
      },
    ],
  },
  {
    id: "2",
    title: "Melonbase",
    imgSrc: "/images/melonbase-header.png",
    shortDescription: "Landing Page",
    description:
      "This is the landing page for <a href='https://www.melonbase.com' target='_blank' style='color: blue;'>**Melonbase**</a>, the informal entity created to house my monetised app project for formality purposes. I designed everything myself with Figma, while the site was created with React and NextJS. It is hosted with <a href='https://vercel.com' target='_blank' style='color: blue;'>**Vercel**</a>.\n\nCurrently, Melonbase's sole purpose is to only act as a formal entity to upload my mobile apps on the store.",
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
    imgSrc: "/images/SICP.png",
    shortDescription: "Progress Tracker Repo",
    description:
      "This is a <a href='https://github.com/raihahahan/SICP' target='_blank' style='color: blue;'>**Github repository**</a> that tracks my progress in the Computer Science textbook <a href='https://mitpress.mit.edu/sites/default/files/sicp/full-text/book/book.html' target='_blank' style='color: blue;'>**Structure and Interpretation of Computer Programs**</a> by Harold Abelson and Gerald Jay Sussman. It includes most exercises in the textbook from Chapter 1 to 3. It is still a work in progress.\n\nThis book has been instrumental in my programming journey due to the deeper insights of programming methodologies such as procedural and data abstraction, functional programming and object-oriented programming. This helped in my understanding of Java, state management systems such as Redux, and improved the way I write and structure my code.",
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
    imgSrc: "/images/python-cli-sg-places.png",
    shortDescription: "Python CLI Program",
    description:
      "I'm the creator of <a href='https://github.com/raihahahan/singapore-places-names' target='_blank' style='color: blue;'>**SG Locations**</a>. It is a Command-Line Interface (CLI) program that gives you names of places in Singapore in different data structures.\n\nThis was my first Python project. It uses the <a href='https://www.crummy.com/software/BeautifulSoup/bs4/doc/' target='_blank' style='color: blue;'>**BeautifulSoup**</a> library to scrape data from <a href='https://en.wikipedia.org/wiki/List_of_places_in_Singapore' target='_blank' style='color: blue;'>**this Wikipedia page**</a>. The CLI then allows the user to choose a data structure to display the data. This program was originally created for <a href='https://www.melonbase.com/projects/park-my-bike-sg' target='_blank' style='color: blue;'>**ParkMyBike SG's**</a> autocomplete search feature as I did not want to use Google Map's autocomplete API.",
    lastUpdated: new Date(2022, 5, 14),
    importance: 0.9,
    skills: ["Python", "CLI", "Web scraping"],
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
  // {
  //   id: "5",
  //   title: "Anon App",
  //   shortDescription: "Anonymous Chat App",
  //   description: "A mobile app that lets you chat with people anonymously",
  //   lastUpdated: new Date(2022, 2, 6),
  //   importance: 0.5,
  //   frameworks: ["React Native"],
  //   skills: ["JavaScript", "React Native", "Firebase"],
  //   projectAnalysis: {
  //     projectType: "Mobile App",
  //     projectCondition: "not maintained",
  //     languageUsePercentage: [
  //       {
  //         title: "JavaScript",
  //         perc: 1,
  //       },
  //     ],
  //   },
  //   buttons: [
  //     {
  //       title: "Learn More",
  //       link: "#",
  //     },
  //   ],
  // },
];
