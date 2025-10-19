import { Division, FighterDetails } from './types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.octagon-api.com'

/**
 * Fetch all rankings data from the Octagon API
 * @returns Promise<Division[]> - Array of all divisions with fighters
 */
export async function getRankings(): Promise<Division[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/rankings`, {
      next: { revalidate: 86400 } // 24 hours cache
    })

    if (!response.ok) {
      throw new Error('Failed to fetch rankings data')
    }

    const data = await response.json()
    return data
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch rankings: ${error.message}`)
    }
    throw new Error('Failed to fetch rankings data')
  }
}

/**
 * Fetch single fighter details from the Octagon API
 * @param fighterId - The ID of the fighter to fetch
 * @returns Promise<FighterDetails> - Fighter details
 */
export async function getFighterDetails(fighterId: string): Promise<FighterDetails> {
  try {
    const response = await fetch(`${API_BASE_URL}/fighter/${fighterId}`, {
      next: { revalidate: 86400 } // 24 hours cache
    })

    if (!response.ok) {
      throw new Error('Failed to fetch fighter details')
    }

    const data = await response.json()
    return data
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch fighter details: ${error.message}`)
    }
    throw new Error('Failed to fetch fighter details')
  }
}
