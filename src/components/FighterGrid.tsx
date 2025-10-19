'use client'

import { useState, useMemo } from 'react'
import { Division, Fighter } from '@/lib/types'
import { FighterCard } from './FighterCard'
import { FighterModal } from './FighterModal'
import { SearchFilter } from './SearchFilter'

interface FighterGridProps {
  divisions: Division[]
}

interface DisplayItem {
  fighter: Fighter
  divisionName: string
  rank: number | 'champion'
  divisionId: string
}

export function FighterGrid({ divisions }: FighterGridProps) {
  const [selectedDivision, setSelectedDivision] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedFighter, setSelectedFighter] = useState<string | null>(null)

  // Build filtered and searchable display array
  const displayItems = useMemo(() => {
    // Filter divisions first
    const filteredDivisions =
      selectedDivision === 'all'
        ? divisions
        : divisions.filter((div) => div.id === selectedDivision)

    // Build display array from filtered divisions
    const items: DisplayItem[] = []

    filteredDivisions.forEach((division) => {
      // Add champion if exists
      if (division.champion) {
        items.push({
          fighter: {
            id: division.champion.id,
            name: division.champion.championName,
          },
          divisionName: division.categoryName,
          rank: 'champion',
          divisionId: division.id,
        })
      }

      // Add ranked fighters
      division.fighters.forEach((fighter, index) => {
        items.push({
          fighter: fighter,
          divisionName: division.categoryName,
          rank: index + 1,
          divisionId: division.id,
        })
      })
    })

    // Apply search filter
    if (searchQuery.trim()) {
      return items.filter((item) =>
        item.fighter.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return items
  }, [divisions, selectedDivision, searchQuery])

  return (
    <>
      {/* Search and Filter Controls */}
      <SearchFilter
        divisions={divisions}
        selectedDivision={selectedDivision}
        onDivisionChange={setSelectedDivision}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Empty State */}
      {displayItems.length === 0 && (
        <div className="text-center py-16">
          <p className="text-xl text-gray-600 dark:text-gray-400">
            No fighters found. Try different search terms.
          </p>
        </div>
      )}

      {/* Fighter Cards Grid */}
      {displayItems.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {displayItems.map((item, index) => (
            <FighterCard
              key={`${item.fighter.id}-${index}`}
              fighter={item.fighter}
              divisionName={item.divisionName}
              rank={item.rank}
              onClick={() => setSelectedFighter(item.fighter.id)}
            />
          ))}
        </div>
      )}

      {/* Fighter Modal */}
      {selectedFighter && (
        <FighterModal
          fighterId={selectedFighter}
          onClose={() => setSelectedFighter(null)}
        />
      )}
    </>
  )
}
