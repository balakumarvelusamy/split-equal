// src/store/userSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  friends: [],
  expenses: [],
  loggedInUser: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setFriends(state, action) {
      state.friends = action.payload;
    },
    setExpenses(state, action) {
      state.expenses = action.payload;
    },
    setLoggedInUser(state, action) {
      state.loggedInUser = action.payload;
    },
  },
});

export const { setFriends, setExpenses, setLoggedInUser } = userSlice.actions;
export default userSlice.reducer;
