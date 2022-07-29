import { siteColorsType } from "../../styles/styles-types";

export type contactDataType = {
  id: string;
  title: string;
  link: string;
  icon: (colors: siteColorsType) => JSX.Element;
};
