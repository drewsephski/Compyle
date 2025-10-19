'use client'

import { Fighter } from '@/lib/types'

interface FighterCardProps {
  fighter: Fighter
  divisionName: string
  rank: number | 'champion'
  onClick: () => void
}

export function FighterCard({ fighter, divisionName, rank, onClick }: FighterCardProps) {
  return (
    <div
      onClick={onClick}
      className="p-6 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-dark-card cursor-pointer transition-all hover:scale-105 hover:shadow-xl"
    >
      {/* Rank or Champion Badge */}
      {rank === 'champion' ? (
        <div className="inline-block bg-ufc-red text-white text-xs font-bold px-3 py-1 rounded mb-3">
          CHAMPION
        </div>
      ) : (
        <div className="text-4xl font-bold text-gray-400 dark:text-gray-600">
          #{rank}
        </div>
      )}

      {/* Fighter Name */}
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-3 truncate">
        {fighter.name}
      </h3>

      {/* Division Name */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
        {divisionName}
      </p>
    </div>
  )
}
