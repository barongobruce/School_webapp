import React, { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'
import { X } from 'lucide-react'
import { closeModal } from '../../../store/slices/uiSlice'

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-[min(96vw,56rem)]',
}

const panelRadius = { borderRadius: '1.8rem 0.6rem 1.8rem 0.6rem' }
const closeRadius = { borderRadius: '0.85rem 0.25rem 0.85rem 0.25rem' }

const Modal = () => {
  const dispatch = useDispatch()
  const {
    isOpen,
    title,
    description,
    size,
    content,
    closeOnBackdrop,
    showCloseButton,
  } = useSelector((state) => state.ui.modal)

  const titleId = useId()
  const descriptionId = useId()
  const panelRef = useRef(null)
  const previouslyFocused = useRef(null)

  useEffect(() => {
    if (!isOpen) return undefined

    previouslyFocused.current = document.activeElement
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const frame = window.requestAnimationFrame(() => {
      panelRef.current?.focus()
    })

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        dispatch(closeModal())
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      window.cancelAnimationFrame(frame)
      document.body.style.overflow = originalOverflow
      document.removeEventListener('keydown', onKeyDown)
      previouslyFocused.current?.focus?.()
    }
  }, [dispatch, isOpen])

  if (!isOpen) return null

  return createPortal(
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4'
      role='presentation'
    >
      <button
        type='button'
        aria-label='Close modal'
        className='absolute inset-0 bg-black/50 transition-opacity dark:bg-black/60'
        onClick={closeOnBackdrop ? () => dispatch(closeModal()) : undefined}
        tabIndex={-1}
      />

      <div
        ref={panelRef}
        role='dialog'
        aria-modal='true'
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={`relative z-10 flex max-h-[min(90vh,52rem)] w-full flex-col overflow-hidden bg-white outline-none dark:bg-[#0c1528] ${
          sizeClasses[size] ?? sizeClasses.md
        }`}
        style={panelRadius}
      >
        {(title || showCloseButton) && (
          <header className='brand-gradient flex shrink-0 items-start justify-between gap-3 px-5 py-4'>
            <div className='min-w-0 pt-0.5'>
              {title ? (
                <h2
                  id={titleId}
                  className='text-[15px] font-semibold tracking-tight text-white'
                >
                  {title}
                </h2>
              ) : null}
              {description ? (
                <p
                  id={descriptionId}
                  className='mt-1 text-[13px] leading-relaxed text-white/75'
                >
                  {description}
                </p>
              ) : null}
            </div>

            {showCloseButton ? (
              <button
                type='button'
                aria-label='Close'
                onClick={() => dispatch(closeModal())}
                className='grid size-10 shrink-0 place-items-center text-white/85 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
                style={closeRadius}
              >
                <X className='size-8' strokeWidth={1.75} />
              </button>
            ) : null}
          </header>
        )}

        <div className='modal-scrollbar min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-5 py-4'>
          {content}
        </div>
      </div>

      <style>{`
        .modal-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #20509b transparent;
        }

        .modal-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .modal-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          margin-block: 4px;
        }

        .modal-scrollbar::-webkit-scrollbar-thumb {
          background-color: #20509b;
          border-radius: 999px;
        }

        .modal-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #3d76c6;
        }

        .dark .modal-scrollbar {
          scrollbar-color: #3d76c6 transparent;
        }

        .dark .modal-scrollbar::-webkit-scrollbar-thumb {
          background-color: #3d76c6;
        }

        .dark .modal-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #6394d6;
        }
      `}</style>
    </div>,
    document.body,
  )
}

export default Modal
