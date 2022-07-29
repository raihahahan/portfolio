import { createStyles } from "@mantine/core";
import { colorTheme, siteColors } from "../../styles/styles-constants";

export default function useTheme() {
  const theme = "light";

  const stylesFunc = createStyles((theme) => ({
    navbar: {
      [theme.fn.largerThan("sm")]: {
        display: "none",
      },
    },
    links: {
      [theme.fn.smallerThan("sm")]: {
        display: "none",
      },
    },
  }));

  const { classes } = stylesFunc();
  const colors = siteColors(theme);
  const myColorTheme = colorTheme[theme];

  return { siteColors: colors, colorTheme: myColorTheme, classes };
}
