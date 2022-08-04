import { siteColorsType } from "../theme/theme-types";

export type contactDataType = {
  id: string;
  title: string;
  link: string;
  icon: (colors: siteColorsType) => JSX.Element;
};
