import { configureStore } from '@reduxjs/toolkit'
import uiReducer from './slices/uiSlice'
import userReducer from './slices/userSlice'
import announcementsReducer from './slices/announcementsSlice'

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    user: userReducer,
    announcements: announcementsReducer,
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
