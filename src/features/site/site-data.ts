import { anchorTitles, routes } from "./site-types";

const anchorData: { title: anchorTitles; anchorRoute: routes }[] = [
  { title: "Home", anchorRoute: "/" },
  {
    title: "Projects",
    anchorRoute: "/projects",
  },
  {
    title: "About",
    anchorRoute: "/about",
  },
];

export default anchorData;

export const footerData: { title: anchorTitles; anchorRoute: routes }[] = [
  {
    title: "M.Raihan" as any,
    anchorRoute: "/about",
  },
  {
    title: "Github" as any,
    anchorRoute: "https://www.github.com/raihahahan" as any,
  },
  {
    title: "mraihandev@gmail.com" as any,
    anchorRoute: "mailto:mraihandev@gmail.com" as any,
  },

  {
    title: "Privacy Policy",
    anchorRoute: "/privacy-policy",
  },
];
