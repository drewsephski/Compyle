'use client'

import { Division } from '@/lib/types'

interface SearchFilterProps {
  divisions: Division[]
  selectedDivision: string
  onDivisionChange: (divisionId: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function SearchFilter({
  divisions,
  selectedDivision,
  onDivisionChange,
  searchQuery,
  onSearchChange,
}: SearchFilterProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      {/* Division Filter */}
      <div className="flex items-center gap-2">
        <label
          htmlFor="division-select"
          className="text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap"
        >
          Division:
        </label>
        <select
          id="division-select"
          value={selectedDivision}
          onChange={(e) => onDivisionChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ufc-red"
        >
          <option value="all">All Divisions</option>
          {divisions.map((division) => (
            <option key={division.id} value={division.id}>
              {division.categoryName}
            </option>
          ))}
        </select>
      </div>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search fighters..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ufc-red"
      />
    </div>
  )
}
