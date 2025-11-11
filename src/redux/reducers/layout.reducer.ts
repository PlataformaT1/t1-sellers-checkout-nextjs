import { InitialLayout } from '@interfaces/layout';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: InitialLayout = {
	sidebarReduce: false
};

const snackbarSlice = createSlice({
	name: 'layout',
	initialState,
	reducers: {
		setReduceSidebar: (state, action: PayloadAction<boolean>) => {
			state.sidebarReduce = action.payload;
		}
	}
});

export const { setReduceSidebar } = snackbarSlice.actions;
export default snackbarSlice.reducer;