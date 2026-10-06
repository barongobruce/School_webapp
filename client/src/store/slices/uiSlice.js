import { createSlice } from '@reduxjs/toolkit'

/** @typedef {'student' | 'parent' | 'guardian' | 'teacher'} UserRole */

/** @type {Readonly<{ STUDENT: 'student'; PARENT: 'parent'; GUARDIAN: 'guardian'; TEACHER: 'teacher' }>} */
export const USER_ROLES = Object.freeze({
  STUDENT: 'student',
  PARENT: 'parent',
  GUARDIAN: 'guardian',
  TEACHER: 'teacher',
})

/** @type {readonly UserRole[]} */
export const USER_ROLE_VALUES = Object.freeze(Object.values(USER_ROLES))

/**
 * @param {unknown} role
 * @returns {role is UserRole}
 */
export const isValidUserRole = (role) => USER_ROLE_VALUES.includes(/** @type {UserRole} */ (role))

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
    isSidebarOpen: true,
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

export const { toggleSidebar, setSidebarOpen, openModal, closeModal } = uiSlice.actions
export default uiSlice.reducer
