'use client'

import { useState, useMemo, useEffect } from 'react'
import { Division, Fighter, FightersCollection, FighterDetails } from '@/lib/types'
import { FighterCard } from './FighterCard'
import { FighterModal } from './FighterModal'
import { SearchFilter } from './SearchFilter'
import { getFighters } from '@/lib/api'

interface FighterGridProps {
  divisions: Division[]
}

interface DisplayItem {
  fighter: Fighter
  divisionName: string
  rank: number | 'champion'
  divisionId: string
  fighterDetails?: FighterDetails
}

export function FighterGrid({ divisions }: FighterGridProps) {
  const [selectedDivision, setSelectedDivision] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedFighter, setSelectedFighter] = useState<string | null>(null)
  const [fightersData, setFightersData] = useState<FightersCollection | null>(null)
  const [fightersLoading, setFightersLoading] = useState(false)

  // Fetch all fighters data for enriched information
  useEffect(() => {
    const fetchFighters = async () => {
      try {
        setFightersLoading(true)
        const data = await getFighters()
        setFightersData(data)
      } catch (error) {
        console.error('Failed to fetch fighters data:', error)
        // Continue without enriched data - basic functionality will still work
      } finally {
        setFightersLoading(false)
      }
    }

    fetchFighters()
  }, [])

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
        const fighterDetails = fightersData?.[division.champion.id]
        items.push({
          fighter: {
            id: division.champion.id,
            name: division.champion.championName,
          },
          divisionName: division.categoryName,
          rank: 'champion',
          divisionId: division.id,
          fighterDetails: fighterDetails,
        })
      }

      // Add ranked fighters
      division.fighters.forEach((fighter, index) => {
        const fighterDetails = fightersData?.[fighter.id]
        items.push({
          fighter: fighter,
          divisionName: division.categoryName,
          rank: index + 1,
          divisionId: division.id,
          fighterDetails: fighterDetails,
        })
      })
    })

    // Apply search filter
    if (searchQuery.trim()) {
      return items.filter((item) =>
        item.fighter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.fighterDetails?.nickname && item.fighterDetails.nickname.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    return items
  }, [divisions, selectedDivision, searchQuery, fightersData])

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

      {/* Loading indicator for fighters data */}
      {fightersLoading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-ufc-red"></div>
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            Loading fighter details...
          </span>
        </div>
      )}

      {/* Empty State */}
      {displayItems.length === 0 && !fightersLoading && (
        <div className="text-center py-16">
          <p className="text-xl text-gray-600 dark:text-gray-400">
            No fighters found. Try different search terms.
          </p>
        </div>
      )}

      {/* Fighter Cards Grid */}
      {displayItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayItems.map((item, index) => (
            <FighterCard
              key={`${item.fighter.id}-${index}`}
              fighter={item.fighter}
              divisionName={item.divisionName}
              rank={item.rank}
              onClick={() => setSelectedFighter(item.fighter.id)}
              fighterDetails={item.fighterDetails}
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
