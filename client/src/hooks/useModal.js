import { useDispatch, useSelector } from 'react-redux'
import { closeModal, openModal } from '../store/slices/uiSlice'

const useModal = () => {
  const dispatch = useDispatch()
  const modal = useSelector((state) => state.ui.modal)

  return {
    isOpen: modal.isOpen,
    title: modal.title,
    description: modal.description,
    size: modal.size,
    content: modal.content,
    open: (options) => dispatch(openModal(options)),
    close: () => dispatch(closeModal()),
  }
}

export default useModal
