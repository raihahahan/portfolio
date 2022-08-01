import { createSlice } from "@reduxjs/toolkit";
import { Theme } from "./theme-types";

export const themeSlice = createSlice({
  name: "theme",
  initialState: "light" as Theme,
  reducers: {
    toggleTheme: (state: Theme) => {
      return state == "dark" ? "light" : "dark";
    },
  },
});

export const { toggleTheme } = themeSlice.actions;
export const selectTheme = (state: { theme: Theme }): Theme => state.theme;
const themeReducer = themeSlice.reducer;
export default themeReducer;
