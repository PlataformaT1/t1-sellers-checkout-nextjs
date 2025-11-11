import { configureStore } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'

// Import your slices here
import counterSlice from './slices/counterSlice'
import userSlice from './slices/userSlice'

export const store = configureStore({
  reducer: {
    // Add your reducers here
    counter: counterSlice,
    user: userSlice,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
