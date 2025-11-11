// src/store/userSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  friends: [],
  expenses: [],
  loggedInUser: null,
  userInfo: null,
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
    setUserInfo(state, action) {
      state.userInfo = action.payload;
    },
    logoutUser(state, action) {
      state.loggedInUser = null;
      state.friends = [];
      state.expenses = [];
    },
  },
});

export const { setFriends, setExpenses, setLoggedInUser, setUserInfo, logoutUser } = userSlice.actions;
export default userSlice.reducer;
