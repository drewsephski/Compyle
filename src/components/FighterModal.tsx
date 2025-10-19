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
  const [imageError, setImageError] = useState(false)
  const { toasts, showToast, removeToast } = useToast()

  useEffect(() => {
    const fetchFighter = async () => {
      try {
        setLoading(true)
        setError(null)
        setImageError(false)
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

  const formatRecord = (wins?: string, losses?: string, draws?: string) => {
    if (!wins && !losses && !draws) return 'N/A'
    return `${wins || '0'}-${losses || '0'}-${draws || '0'}`
  }

  const formatHeight = (height?: string) => {
    if (!height) return 'N/A'
    const inches = parseFloat(height)
    if (isNaN(inches)) return height
    const feet = Math.floor(inches / 12)
    const remainingInches = inches % 12
    return `${feet}'${remainingInches}"`
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal Content */}
        <div
          className="bg-white dark:bg-dark-card rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors z-10"
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
            <div className="flex flex-col items-center justify-center py-16">
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
            <div className="p-6">
              {/* Header Section with Image and Basic Info */}
              <div className="flex flex-col lg:flex-row gap-6 mb-8">
                {/* Fighter Image */}
                <div className="flex-shrink-0">
                  {fighterData.imgUrl && !imageError ? (
                    <img
                      src={fighterData.imgUrl}
                      alt={fighterData.name}
                      className="w-48 h-64 object-cover rounded-lg shadow-lg"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-48 h-64 bg-gray-300 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500 dark:text-gray-400 text-sm text-center px-4">
                        Image not available
                      </span>
                    </div>
                  )}
                </div>

                {/* Basic Information */}
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {fighterData.name}
                  </h2>

                  {fighterData.nickname && (
                    <p className="text-xl text-ufc-red font-semibold mb-3">
                      "{fighterData.nickname}"
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <dt className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">
                        Status
                      </dt>
                      <dd className="text-base text-gray-900 dark:text-white">
                        {fighterData.status || 'N/A'}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">
                        Division
                      </dt>
                      <dd className="text-base text-gray-900 dark:text-white">
                        {fighterData.category || 'N/A'}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">
                        Record
                      </dt>
                      <dd className="text-base text-gray-900 dark:text-white">
                        {formatRecord(fighterData.wins, fighterData.losses, fighterData.draws)}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">
                        Age
                      </dt>
                      <dd className="text-base text-gray-900 dark:text-white">
                        {fighterData.age ? `${fighterData.age} years` : 'N/A'}
                      </dd>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Physical Attributes */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                    Physical Attributes
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <dt className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">
                        Height
                      </dt>
                      <dd className="text-base text-gray-900 dark:text-white">
                        {formatHeight(fighterData.height)}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">
                        Weight
                      </dt>
                      <dd className="text-base text-gray-900 dark:text-white">
                        {fighterData.weight ? `${fighterData.weight} lbs` : 'N/A'}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">
                        Reach
                      </dt>
                      <dd className="text-base text-gray-900 dark:text-white">
                        {fighterData.reach ? `${fighterData.reach}"` : 'N/A'}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">
                        Leg Reach
                      </dt>
                      <dd className="text-base text-gray-900 dark:text-white">
                        {fighterData.legReach ? `${fighterData.legReach}"` : 'N/A'}
                      </dd>
                    </div>
                  </div>
                </div>

                {/* Career Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                    Career Information
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <dt className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">
                        Fighting Style
                      </dt>
                      <dd className="text-base text-gray-900 dark:text-white">
                        {fighterData.fightingStyle || 'N/A'}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">
                        Trains At
                      </dt>
                      <dd className="text-base text-gray-900 dark:text-white">
                        {fighterData.trainsAt || 'N/A'}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">
                        Place of Birth
                      </dt>
                      <dd className="text-base text-gray-900 dark:text-white">
                        {fighterData.placeOfBirth || 'N/A'}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">
                        Octagon Debut
                      </dt>
                      <dd className="text-base text-gray-900 dark:text-white">
                        {fighterData.octagonDebut || 'N/A'}
                      </dd>
                    </div>
                  </div>
                </div>
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
