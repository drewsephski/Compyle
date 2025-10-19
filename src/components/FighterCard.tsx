'use client'

import { Fighter, FighterDetails } from '@/lib/types'

interface FighterCardProps {
  fighter: Fighter
  divisionName: string
  rank: number | 'champion'
  onClick: () => void
  // Optional enriched fighter data for additional display
  fighterDetails?: FighterDetails
}

export function FighterCard({ fighter, divisionName, rank, onClick, fighterDetails }: FighterCardProps) {
  const formatRecord = (wins?: string, losses?: string, draws?: string) => {
    if (!wins && !losses && !draws) return null
    return `${wins || '0'}-${losses || '0'}-${draws || '0'}`
  }

  const record = fighterDetails ? formatRecord(fighterDetails.wins, fighterDetails.losses, fighterDetails.draws) : null

  return (
    <div
      onClick={onClick}
      className="p-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-dark-card cursor-pointer transition-all hover:scale-105 hover:shadow-xl relative overflow-hidden min-h-[320px] flex flex-col"
    >
      {/* Background gradient for champions */}
      {rank === 'champion' && (
        <div className="absolute inset-0 bg-gradient-to-br from-ufc-red/10 to-transparent pointer-events-none" />
      )}

      {/* Fighter Image */}
      {fighterDetails?.imgUrl && (
        <div className="mb-4 relative flex-shrink-0">
          <img
            src={fighterDetails.imgUrl}
            alt={fighter.name}
            className="w-full h-40 object-contain bg-gray-50 dark:bg-gray-800 rounded-lg"
            onError={(e) => {
              // Hide image on error
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
            }}
          />
        </div>
      )}

      {/* Content section - flex grow to fill remaining space */}
      <div className="flex-grow flex flex-col">
        {/* Rank or Champion Badge */}
        <div className="flex items-center justify-between mb-3">
          {rank === 'champion' ? (
            <div className="inline-block bg-ufc-red text-white text-xs font-bold px-3 py-1 rounded">
              CHAMPION
            </div>
          ) : (
            <div className="text-2xl font-bold text-gray-400 dark:text-gray-600">
              #{rank}
            </div>
          )}

          {/* Status indicator */}
          {fighterDetails?.status && (
            <div className={`text-xs px-2 py-1 rounded-full ${
              fighterDetails.status === 'Active'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
            }`}>
              {fighterDetails.status}
            </div>
          )}
        </div>

        {/* Fighter Name and Nickname */}
        <div className="mb-3 flex-grow">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 leading-tight">
            {fighter.name}
          </h3>
          {fighterDetails?.nickname && (
            <p className="text-sm text-ufc-red font-semibold truncate">
              "{fighterDetails.nickname}"
            </p>
          )}
        </div>

        {/* Division Name */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {divisionName}
        </p>

        {/* Record */}
        {fighterDetails && record && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-auto">
            Record: {record}
          </div>
        )}
      </div>
    </div>
  )
}
