export function SkeletonCard() {
  return (
    <div className="p-6 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-dark-card animate-pulse">
      {/* Rank/Badge placeholder */}
      <div className="h-16 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>

      {/* Fighter name placeholder */}
      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded mt-4"></div>

      {/* Division placeholder */}
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mt-2 w-2/3"></div>
    </div>
  )
}
