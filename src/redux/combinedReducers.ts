import { combineReducers } from "@reduxjs/toolkit";
import themeReducer from "../features/theme/themeSlice";

export const rootReducer = combineReducers({
  theme: themeReducer,
});
