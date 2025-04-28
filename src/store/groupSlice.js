import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  groups: [], // groups and their expenses
};

const groupSlice = createSlice({
  name: "groups",
  initialState,
  reducers: {
    setGroups(state, action) {
      state.groups = action.payload;
    },
    updateGroup(state, action) {
      const updatedGroup = action.payload;
      state.groups = state.groups.map((g) => (g.id === updatedGroup.id ? updatedGroup : g));
    },
    clearGroups(state) {
      state.groups = [];
    },
  },
});

export const { setGroups, updateGroup, clearGroups } = groupSlice.actions;
export default groupSlice.reducer;
