import { configureStore } from '@reduxjs/toolkit'
import uiReducer from './slices/uiSlice'
import userReducer from './slices/userSlice'

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Modal content is React nodes (non-serializable by design)
        ignoredActions: ['ui/openModal'],
        ignoredPaths: ['ui.modal.content'],
      },
    }),
})
