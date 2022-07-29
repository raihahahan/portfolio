export interface projectTypeSmall {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  lastUpdated: Date;
  importance: number; // 0 to 1
  imgSrc?: string;
  frameworks?: frameworksType[];
  contributors?: string[];
  isAbandoned?: boolean;
}

export interface projectDataType extends projectTypeSmall {
  projectAnalysis: projectAnalysisType;
  button: projectButtonDataType;
  extraStoreButtons?: projectButtonDataType[];
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
