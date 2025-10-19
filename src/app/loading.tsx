import { SkeletonCard } from '@/components/SkeletonCard'

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          UFC Fighter Rankings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Real-time data from Octagon API
        </p>
      </div>

      {/* Skeleton grid matching main page layout */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </div>
  )
}
