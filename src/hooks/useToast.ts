import { useState, useCallback } from 'react'

export interface Toast {
  id: string
  message: string
  type: 'error' | 'success'
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: 'error' | 'success' = 'error') => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: Toast = { id, message, type }

    setToasts((prevToasts) => {
      // Maximum 3 toasts visible at once
      const updatedToasts = [...prevToasts, newToast]
      if (updatedToasts.length > 3) {
        return updatedToasts.slice(-3) // Keep only the last 3
      }
      return updatedToasts
    })

    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeToast(id)
    }, 5000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }, [])

  return { toasts, showToast, removeToast }
}
