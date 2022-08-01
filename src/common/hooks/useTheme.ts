import { createStyles } from "@mantine/core";
import { useSelector } from "react-redux";
import { colorTheme, siteColors } from "../../features/theme/theme-data";
import { Theme } from "../../features/theme/theme-types";
import { selectTheme } from "../../features/theme/themeSlice";

export default function useTheme() {
  const theme: Theme = useSelector(selectTheme);

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

  return {
    siteColors: colors,
    colorTheme: myColorTheme,
    classes,
    themeState: theme as Theme,
  };
}
