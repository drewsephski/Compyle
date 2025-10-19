import { getRankings } from '@/lib/api'
import { FighterGrid } from '@/components/FighterGrid'

export default async function Home() {
  // Fetch rankings data server-side
  const divisions = await getRankings()

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
          UFC Fighter Rankings
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Real-time data from Octagon API
        </p>
      </header>

      {/* Fighter Grid with Search and Filter */}
      <FighterGrid divisions={divisions} />
    </main>
  )
}
