'use client'

import { useEffect, useState } from 'react'
import { getFighterDetails } from '@/lib/api'
import { FighterDetails } from '@/lib/types'
import { useToast } from '@/hooks/useToast'
import { Toast } from './Toast'

interface FighterModalProps {
  fighterId: string
  onClose: () => void
}

export function FighterModal({ fighterId, onClose }: FighterModalProps) {
  const [fighterData, setFighterData] = useState<FighterDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toasts, showToast, removeToast } = useToast()

  useEffect(() => {
    const fetchFighter = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getFighterDetails(fighterId)
        setFighterData(data)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unable to load fighter details.'
        setError(errorMessage)
        showToast(errorMessage, 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchFighter()

    // Handle escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [fighterId, onClose, showToast])

  // Disable body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal Content */}
        <div
          className="bg-white dark:bg-dark-card rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ufc-red mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading fighter details...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-ufc-red text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Fighter Data */}
          {fighterData && !loading && !error && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {fighterData.name}
              </h2>

              {/* Display all available fighter data dynamically */}
              <div className="space-y-4">
                {Object.entries(fighterData).map(([key, value]) => {
                  // Skip rendering the id and name (name is already shown as heading)
                  if (key === 'id' || key === 'name') return null

                  return (
                    <div key={key} className="border-b border-gray-200 dark:border-gray-700 pb-3">
                      <dt className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </dt>
                      <dd className="text-base text-gray-900 dark:text-white">
                        {typeof value === 'object' && value !== null
                          ? JSON.stringify(value, null, 2)
                          : String(value)}
                      </dd>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </>
  )
}
