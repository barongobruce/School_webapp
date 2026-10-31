import { createSlice } from '@reduxjs/toolkit'

const initialSidebarOpen =
  typeof window === 'undefined'
    ? true
    : window.matchMedia('(min-width: 1024px)').matches

const initialModalState = {
  isOpen: false,
  title: '',
  description: null,
  size: 'md',
  content: null,
  closeOnBackdrop: true,
  showCloseButton: true,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    isSidebarOpen: initialSidebarOpen,
    modal: { ...initialModalState },
  },
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen
    },
    setSidebarOpen: (state, action) => {
      state.isSidebarOpen = action.payload
    },
    openModal: (state, action) => {
      const {
        title = '',
        description = null,
        size = 'md',
        content = null,
        closeOnBackdrop = true,
        showCloseButton = true,
      } = action.payload ?? {}

      state.modal = {
        isOpen: true,
        title,
        description,
        size,
        content,
        closeOnBackdrop,
        showCloseButton,
      }
    },
    closeModal: (state) => {
      state.modal = { ...initialModalState }
    },
  },
})

export const { toggleSidebar, setSidebarOpen, openModal, closeModal } =
  uiSlice.actions
export default uiSlice.reducer
