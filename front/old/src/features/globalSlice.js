import { createSlice } from '@reduxjs/toolkit';
const initialState = {
};
export const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    logout: (state) => {
      console.log("GLOBAL LOGOUT CALLED")
    }
  }
});
export const { logout } = globalSlice.actions;
export default globalSlice.reducer;
