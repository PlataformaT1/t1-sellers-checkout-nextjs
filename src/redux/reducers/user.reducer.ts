import { UserData, Store, UserI } from '@interfaces/api';
import { getUserStores, getIdentityUser } from '@redux/thunks/user.thunk';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AsyncState {
	status: 'idle' | 'loading' | 'succeeded' | 'failed';
	error: string | null;
}

interface InitialStateUserI {
	getIdentityUser: AsyncState;
	identityUser: any;
	getUserStores: AsyncState;
	stores: Store[];
	userData: UserData | null;
	info: UserI
}

const initialState: InitialStateUserI = {
	getIdentityUser: {
		status: 'idle',
		error: null
	},
	identityUser: null,
	getUserStores: {
		status: 'idle',
		error: null
	},
	stores: [],
	userData: null,
	info: {
		name: '',
		email: '',
		token: '',
		storeId: 0,
	}
};

export const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		clearUserData: (state) => {
			state.userData = null;
			state.stores = [];
			state.identityUser = null;
		},
		clearError: (state) => {
			state.getUserStores.error = null;
			state.getIdentityUser.error = null;
		},
		setUserInfoSuccess: (state, action) => {
			state.info = {
				...state.info,
				name: action.payload.name,
				email: action.payload.email,
				token: action.payload.token,
				storeId: action.payload.storeId
			};
		}
	},

	extraReducers(builder) {
		// GET IDENTITY USER 
		builder.addCase(getIdentityUser.pending, (state) => {
			state.getIdentityUser.status = 'loading';
		});
		builder.addCase(getIdentityUser.rejected, (state, action) => {
			state.getIdentityUser.status = 'failed';
			state.getIdentityUser.error = action.error.message as string;
		});
		builder.addCase(getIdentityUser.fulfilled, (state, action) => {
			state.getIdentityUser.status = 'succeeded';
			state.identityUser = action.payload;
			state.userData = action.payload.data;
		});
		// GET USER STORES
		builder.addCase(getUserStores.pending, (state) => {
			state.getUserStores.status = 'loading';
		});
		builder.addCase(getUserStores.rejected, (state, action) => {
			state.getUserStores.status = 'failed';
			state.getUserStores.error = action.error.message as string;
		});
		builder.addCase(getUserStores.fulfilled, (state, action) => {
			state.getUserStores.status = 'succeeded';
			state.userData = action.payload.data;
			state.stores = action.payload && action.payload.data && action.payload.data ? action.payload.data.stores : [];
		});
	},
});

export const { clearUserData, clearError, setUserInfoSuccess } = userSlice.actions;
export default userSlice.reducer;