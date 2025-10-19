'use client'

import { Division } from '@/lib/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
      <div className="flex items-center gap-3">
        <label
          htmlFor="division-select"
          className="text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap"
        >
          Division:
        </label>
        <Select value={selectedDivision} onValueChange={onDivisionChange}>
          <SelectTrigger className="w-[200px] bg-white dark:bg-dark-card border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-ufc-red">
            <SelectValue placeholder="Select a division" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-dark-card border-gray-300 dark:border-gray-700">
            <SelectItem value="all" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800">
              All Divisions
            </SelectItem>
            {divisions.map((division) => (
              <SelectItem
                key={division.id}
                value={division.id}
                className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800"
              >
                {division.categoryName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
