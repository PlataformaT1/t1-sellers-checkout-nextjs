import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createStoreThunk, verifyStoreThunk } from '@redux/thunks/store.thunk';

interface AsyncState {
	status: 'idle' | 'loading' | 'succeeded' | 'failed';
	error: string | null;
}

interface StoreState {
	createStore: AsyncState;
	verifyStore: AsyncState;
	currentStoreId: string | null;
	verificationData: any | null;
}

const initialState: StoreState = {
	createStore: {
		status: 'idle',
		error: null
	},
	verifyStore: {
		status: 'idle',
		error: null
	},
	currentStoreId: null,
	verificationData: null
};

export const storeSlice = createSlice({
	name: 'store',
	initialState,
	reducers: {
		clearStoreError: (state) => {
			state.createStore.error = null;
		},
		resetCreateStore: (state) => {
			state.createStore = initialState.createStore;
		},
		clearVerifyStoreError: (state) => {
			state.verifyStore.error = null;
		},
		resetVerifyStore: (state) => {
			state.verifyStore = initialState.verifyStore;
			state.verificationData = null;
		},
		setCurrentStoreId: (state, action: PayloadAction<string>) => {
			state.currentStoreId = action.payload;
		},
		clearCurrentStoreId: (state) => {
			state.currentStoreId = null;
		}
	},

	extraReducers(builder) {
		// CREATE STORE
		builder.addCase(createStoreThunk.pending, (state) => {
			state.createStore.status = 'loading';
			state.createStore.error = null;
		});
		builder.addCase(createStoreThunk.rejected, (state, action) => {
			state.createStore.status = 'failed';
			state.createStore.error = action.payload || 'Failed to create store';
		});
		builder.addCase(createStoreThunk.fulfilled, (state, action) => {
			state.createStore.status = 'succeeded';
			state.createStore.error = null;
			state.currentStoreId = action.payload.storeId;
		});

		// VERIFY STORE
		builder.addCase(verifyStoreThunk.pending, (state) => {
			state.verifyStore.status = 'loading';
			state.verifyStore.error = null;
			state.verificationData = null;
		});
		builder.addCase(verifyStoreThunk.rejected, (state, action) => {
			state.verifyStore.status = 'failed';
			state.verifyStore.error = action.payload || 'Failed to verify store';
		});
		builder.addCase(verifyStoreThunk.fulfilled, (state, action) => {
			state.verifyStore.status = 'succeeded';
			state.verifyStore.error = null;
			state.verificationData = action.payload;
		});
	},
});

export const { 
	clearStoreError, 
	resetCreateStore, 
	clearVerifyStoreError,
	resetVerifyStore,
	setCurrentStoreId, 
	clearCurrentStoreId 
} = storeSlice.actions;

export default storeSlice.reducer;
