import { combineReducers } from "@reduxjs/toolkit";
import projectsReducer from "../features/projects/projectsSlice";
import themeReducer from "../features/theme/themeSlice";

export const combinedProjectsReducer = combineReducers({
  projects: projectsReducer,
});

export const rootReducer = combineReducers({
  theme: themeReducer,
  project: combinedProjectsReducer,
});
