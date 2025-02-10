import { routes } from "./site-types";

export const siteTitleNames: Record<routes, string> = {
  "/": "",
  "/about": "About",
  "/projects": "Projects",
  "/contact": "Contact",
  "/privacy-policy": "Privacy Policy",
  "/terms-of-use": "Terms of Use",
  "/blog": "Blog",
  "#": "",
};

export function makeSiteTitle(title: string) {
  if (title == "" || !title) {
    return "Raihan Rizqullah";
  } else {
    return title + " | Raihan Rizqullah";
  }
}
