import { anchorTitles, routes } from "../common/types/types-site";

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
  // {
  //   title: "Contact",
  //   anchorRoute: "/contact",
  // },
];

export default anchorData;

export const footerData: { title: anchorTitles; anchorRoute: routes }[] = [
  {
    title: "hello@melonbase.com" as any,
    anchorRoute: "mailto:hello@melonbase.com" as any,
  },
];
