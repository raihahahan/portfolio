import { routes } from "./site-types";

export const siteTitleNames: Record<routes, string> = {
  "/": "",
  "/about": "About",
  "/projects": "Projects",
  "/contact": "Contact",
};

export function makeSiteTitle(title: string) {
  if (title == "" || !title) {
    return "M.Raihan";
  } else {
    return title + " | M.Raihan";
  }
}
