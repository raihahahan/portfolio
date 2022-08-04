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
    title: "mraihandev@gmail.com" as any,
    anchorRoute: "mailto:mraihandev@gmail.com" as any,
  },
  {
    title: "Privacy Policy",
    anchorRoute: "/privacy-policy",
  },
];
