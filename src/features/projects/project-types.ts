export interface projectTypeSmall {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  lastUpdated: string;
  importance: number; // 0 to 1
  skills: skillsType[];
  imgSrc?: string;
  frameworks?: frameworksType[];
  contributors?: string[];
  isAbandoned?: boolean;
}

export type skillsType =
  | "JavaScript"
  | "TypeScript"
  | "HTML"
  | "CSS"
  | "Python"
  | "Scheme"
  | "Racket"
  | "Java"
  | "C++"
  | "Figma"
  | "Firebase"
  | "MongoDB"
  | "Supabase"
  | "React"
  | "React Native"
  | "Netlify"
  | "NodeJS"
  | "Express"
  | "Google Analytics"
  | "NextJS"
  | "Google Play Console"
  | "Expo"
  | "Mapbox SDK"
  | "Programming Methodologies"
  | "CLI"
  | "Google Admob"
  | "Web scraping"
  | "Lisp"
  | "Object-oriented Programming"
  | "Functional Programming";

export interface projectDataType extends projectTypeSmall {
  projectAnalysis: projectAnalysisType;
  buttons: projectButtonDataType[];
}

export type projectTypes =
  | "Mobile App"
  | "Command-line interface"
  | "Web Development"
  | "Computer Science study";

export type projectConditions = "stable" | "not maintained" | "needs refactor";

export type projectAnalysisType = {
  projectType: projectTypes;
  projectCondition: projectConditions;
  languageUsePercentage: languageUseAnalysisType[];
};

export type projectButtonDataType = {
  title:
    | "Live Demo"
    | "Run Locally"
    | "View on Github"
    | "App Store"
    | "Play Store"
    | "Learn More";
  link: string;
  color?: string;
};

export type languageUseAnalysisType = {
  title: progLanguages;
  perc: number;
};

export type frameworksType = "React" | "React Native" | "NextJS";

export type progLanguages =
  | "JavaScript"
  | "TypeScript"
  | "HTML"
  | "CSS"
  | "Python"
  | "Scheme"
  | "Racket"
  | "Java"
  | "C++"
  | "Others";

export type projectState = {
  project: {
    projects: projectDataType[];
  };
};
