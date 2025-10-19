'use client'

interface ErrorProps {
  error: Error
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="text-center bg-white dark:bg-dark-card border border-gray-300 dark:border-gray-700 rounded-lg p-8 shadow-lg">
        <div className="mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-16 h-16 mx-auto text-red-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Failed to load rankings data
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {error.message || 'An unexpected error occurred'}
        </p>

        <button
          onClick={reset}
          className="px-6 py-3 bg-ufc-red text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
