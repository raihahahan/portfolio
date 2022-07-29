import { routes } from "../types/types-site";

export const siteTitleNames: Record<routes, string> = {
  "/": "",
  "/about": "About",
  "/projects": "Projects",
};

export function makeSiteTitle(title: string) {
  if (title == "" || !title) {
    return "M.Raihan";
  } else {
    return title + " | M.Raihan";
  }
}
