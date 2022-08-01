import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getProjectsAsync } from "./project-data";
import { projectDataType, projectState } from "./project-types";

export const getProjects = createAsyncThunk("projects/get", async () => {
  try {
    const res = await getProjectsAsync();
    return res;
  } catch (error) {
    alert(error);
    return [];
  }
});

export const projectsSlice = createSlice({
  name: "currentProject",
  initialState: [] as projectDataType[],
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      getProjects.fulfilled,
      (state: projectDataType[], action: { payload: projectDataType[] }) => {
        return action.payload;
      }
    );
  },
});

export const selectProjects = (state: projectState): projectDataType[] =>
  state.project.projects;
const projectsReducer = projectsSlice.reducer;
export default projectsReducer;
