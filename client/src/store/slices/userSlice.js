import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getCurrentUser } from '../../lib/api'
import { clearToken } from '../../lib/auth'

export const fetchCurrentUser = createAsyncThunk(
  'user/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getCurrentUser()
      return data.user
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to load user profile')
    }
  },
)

const initialState = {
  user: null,
  status: 'idle',
  error: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload
      state.status = 'succeeded'
      state.error = null
    },
    clearUser: (state) => {
      state.user = null
      state.status = 'idle'
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload
        state.status = 'succeeded'
        state.error = null
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.user = null
        state.status = 'failed'
        state.error = action.payload || 'Failed to load user profile'
        clearToken()
      })
  },
})

export const { setUser, clearUser } = userSlice.actions
export default userSlice.reducer
