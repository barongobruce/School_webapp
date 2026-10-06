import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit'
import { getMyAnnouncements } from '../../lib/announcement.requests'
import { clearUser } from './userSlice'

const seenStorageKey = (userId) => `adesua:announcements:seen:${userId}`

const readSeenIds = (userId) => {
  if (!userId || typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(seenStorageKey(userId))
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return [
      ...new Set(parsed.map((id) => String(id)).filter(Boolean)),
    ]
  } catch {
    return []
  }
}

const writeSeenIds = (userId, ids) => {
  if (!userId || typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      seenStorageKey(userId),
      JSON.stringify([...new Set(ids.map((id) => String(id)).filter(Boolean))]),
    )
  } catch {
    // Ignore quota / private-mode failures
  }
}

const announcementId = (item) => String(item?._id || item?.id || '')

export const fetchAnnouncements = createAsyncThunk(
  'announcements/fetchAnnouncements',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getMyAnnouncements()
      return data.announcements || []
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to load announcements')
    }
  },
)

const initialState = {
  items: [],
  seenIds: [],
  status: 'idle',
  error: null,
  lastFetchedAt: null,
  userId: null,
}

const announcementsSlice = createSlice({
  name: 'announcements',
  initialState,
  reducers: {
    /** Hydrate seen ids for the logged-in user (from localStorage). */
    hydrateAnnouncementSeen: (state, action) => {
      const userId = action.payload ? String(action.payload) : null
      if (state.userId !== userId) {
        state.items = []
        state.status = 'idle'
        state.error = null
        state.lastFetchedAt = null
      }
      state.userId = userId
      state.seenIds = userId ? readSeenIds(userId) : []
    },
    /** Mark every currently loaded announcement as seen. */
    markAllAnnouncementsSeen: (state) => {
      const ids = state.items.map(announcementId).filter(Boolean)
      state.seenIds = [...new Set([...state.seenIds, ...ids])]
      writeSeenIds(state.userId, state.seenIds)
    },
    /**
     * Sync list payload into the store and mark those notices as seen.
     * Used when the user opens the announcements page.
     */
    syncAnnouncementsAsSeen: (state, action) => {
      const items = Array.isArray(action.payload) ? action.payload : []
      state.items = items
      state.status = 'succeeded'
      state.error = null
      state.lastFetchedAt = Date.now()
      const ids = items.map(announcementId).filter(Boolean)
      state.seenIds = [...new Set([...state.seenIds, ...ids])]
      writeSeenIds(state.userId, state.seenIds)
    },
    /** Mark a single announcement as seen (details page). */
    markAnnouncementSeen: (state, action) => {
      const id = String(action.payload || '')
      if (!id || state.seenIds.includes(id)) return
      state.seenIds.push(id)
      writeSeenIds(state.userId, state.seenIds)
    },
    clearAnnouncements: () => ({ ...initialState }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnnouncements.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchAnnouncements.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.error = null
        state.items = Array.isArray(action.payload) ? action.payload : []
        state.lastFetchedAt = Date.now()
      })
      .addCase(fetchAnnouncements.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Failed to load announcements'
      })
      .addCase(clearUser, () => ({ ...initialState }))
  },
})

export const {
  hydrateAnnouncementSeen,
  markAllAnnouncementsSeen,
  syncAnnouncementsAsSeen,
  markAnnouncementSeen,
  clearAnnouncements,
} = announcementsSlice.actions

export const selectAnnouncementsState = (state) => state.announcements

export const selectAnnouncementItems = (state) =>
  state.announcements.items || []

export const selectAnnouncementTotalCount = (state) =>
  (state.announcements.items || []).length

export const selectUnreadAnnouncementCount = createSelector(
  [
    (state) => state.announcements.items,
    (state) => state.announcements.seenIds,
  ],
  (items, seenIds) => {
    const seen = new Set((seenIds || []).map(String))
    return (items || []).reduce((count, item) => {
      const id = announcementId(item)
      if (!id) return count
      return seen.has(id) ? count : count + 1
    }, 0)
  },
)

export default announcementsSlice.reducer
