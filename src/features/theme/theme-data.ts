import {
  breakpointsTypes,
  colorThemeByTheme,
  siteColorsType,
  Theme,
} from "./theme-types";

export const breakpoints: breakpointsTypes = {
  xs: 480, // Extra Small: Typical phone screens
  sm: 768, // Small: Tablets (e.g., iPads in portrait mode)
  md: 992, // Medium: Small laptops and larger tablets
  lg: 1200, // Large: Standard desktop screens
  xl: 1600, // Extra Large: Large desktop screens
};

export const colorTheme: colorThemeByTheme = {
  light: {
    primary: {
      main: "#fff176",
      variantLight: "#ffffa8",
      variantDark: "#cabf45",
    },
    secondary: {
      main: "#ff8a65",
      variantLight: "#ffbb93",
      variantDark: "#c75b39",
    },
    background: "#FFFFFF",
    surface: "#FFFFFF",
    error: "#B00020",
    placeholder: "#F0F0F0",
    on: {
      on_primary: "#000000",
      on_secondary: "#000000",
      on_background: "000000",
      on_surface: "#000000",
      on_error: "#FFFFFF",
    },
  },
  dark: {
    primary: {
      main: "#fff176",
      variantLight: "#ffffa8",
      variantDark: "#cabf45",
    },
    secondary: {
      main: "#ff8a65",
      variantLight: "#ffbb93",
      variantDark: "#c75b39",
    },
    background: "#0e0e0e",
    surface: "#161616",
    error: "#B00020",
    placeholder: "#F0F0F0",
    on: {
      on_primary: "#FFFFFF",
      on_secondary: "#FFFFFF",
      on_background: "FFFFFF",
      on_surface: "#FFFFFF",
      on_error: "#FFFFFF",
    },
  },
};

export const siteColors = (theme: Theme): siteColorsType => {
  const color = colorTheme[theme];
  return {
    header: color.surface,
    background: color.background,
    navbar: color.surface,
    text: {
      primary: color.on.on_primary,
      secondary: "grey",
      error: color.error,
      links: theme == "light" ? "blue" : "#71a2c7",
    },
  };
};
