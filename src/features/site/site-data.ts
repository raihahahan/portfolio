import { anchorTitles, routes } from "./site-types";

const anchorData: { title: anchorTitles; anchorRoute: routes }[] = [
  { title: "Home", anchorRoute: "/" },
  {
    title: "Projects",
    anchorRoute: "/projects",
  },
  {
    title: "Resume",
    anchorRoute: process.env.NEXT_PUBLIC_RESUME as any,
  },
  {
    title: "About",
    anchorRoute: "/about",
  },
];

export default anchorData;

export const footerData: { title: anchorTitles; anchorRoute: routes }[] = [
  {
    title: "Raihan Rizqullah" as any,
    anchorRoute: "/about",
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
