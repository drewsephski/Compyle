'use client'

interface ToastProps {
  message: string
  type: 'error' | 'success'
  onClose: () => void
}

export function Toast({ message, type, onClose }: ToastProps) {
  const bgColor = type === 'error' ? 'bg-red-600' : 'bg-green-600'

  return (
    <div className={`${bgColor} text-white rounded-lg p-4 shadow-lg max-w-md flex items-start justify-between gap-3 animate-slide-in`}>
      <p className="flex-1 text-sm">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-white hover:text-gray-200 transition-colors"
        aria-label="Close notification"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
