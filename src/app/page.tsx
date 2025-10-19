import { getRankings, getFighters } from '@/lib/api'
import { FighterGrid } from '@/components/FighterGrid'
import { OctagonFighter, Division } from '@/lib/types'; // Explicitly import Division and OctagonFighter

export default async function Home() {
  let divisions: Division[] = [];
  let errorMessage: string | null = null;

  try {
    divisions = await getRankings();
  } catch (error) {
    console.error("Failed to fetch rankings:", error);
    // Continue even if rankings fail, as fighters are the primary focus of this task
  }

  try {
    // Call getFighters to prime the cache for the client-side FighterGrid
    await getFighters();
  } catch (error) {
    console.error("Failed to fetch fighters:", error);
    errorMessage = "Failed to load fighter data. Please try again later.";
  }

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

      {errorMessage ? (
        <div className="text-red-500 text-center text-lg">{errorMessage}</div>
      ) : (
        <FighterGrid divisions={divisions} />
      )}
    </main>
  )
}
