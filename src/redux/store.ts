import { configureStore } from '@reduxjs/toolkit';
import userReducer from '@redux/reducers/user.reducer';
import storeReducer from '@redux/reducers/store.reducer';
import layoutReducer from '@redux/reducers/layout.reducer';
import userSessionReducer from '@redux/reducers/userSession.reducer';

export const store = configureStore({
	middleware: getDefaultMiddleware =>
		getDefaultMiddleware({
			serializableCheck: false,
		}),
	reducer: {
		userReducer,
		storeReducer,
		layoutReducer,
		userSessionReducer
	}
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
