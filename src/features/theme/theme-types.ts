export type breakpointsTypes = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
};

export type globalMediaQueriesType = {
  xs: boolean;
  sm: boolean;
  md: boolean;
  lg: boolean;
  xl: boolean;
};

export type colorGroup = {
  main: string;
  variantLight: string;
  variantDark: string;
};

export type onColors = {
  on_primary: string;
  on_secondary: string;
  on_background: string; // appears behind scrollable content
  on_surface: string; // affect surfaces of components, such as cards, sheets, and menus
  on_error: string;
};

export type colorThemeType = {
  primary: colorGroup;
  secondary: colorGroup;
  background: string;
  surface: string;
  error: string;
  placeholder: string;
  on: onColors;
};

export type colorThemeByTheme = {
  light: colorThemeType;
  dark: colorThemeType;
};

export type siteColorsType = {
  header: string;
  background: string;
  navbar: string;
  text: {
    primary: string;
    secondary: string;
    error: string;
    links: string;
  };
};

export type useThemeReturnType = {
  siteColors: siteColorsType;
  colorTheme: colorThemeType;
  classes: Record<"navbar" | "links", string>;
  themeState: Theme;
};

export type Theme = "light" | "dark";
