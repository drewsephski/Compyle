// api.ts

'use server'; // Ensure these functions run server-side in Next.js App Router

import { Division, FighterDetails, OctagonFighter } from './types';

const API_BASE_URL = 'https://api.octagon-api.com';

// Helper to read an error body safely without blowing the stack
async function readErrorBody(resp: Response): Promise<string> {
  try {
    const text = await resp.text();
    return text.slice(0, 1000); // cap to 1k chars
  } catch {
    return '';
  }
}

// Normalize category names: "Lightweight Division" → "lightweight"
const normalizeCategory = (c?: string) =>
  (c ?? '').toLowerCase().replace(/\s+division$/, '').replace(/\s/g, '-').trim();

/**
 * Fetch all rankings data from the Octagon API
 * @returns Promise<Division[]> - Array of all divisions with fighters
 */
export async function getRankings(): Promise<Division[]> {
  const url = `${API_BASE_URL}/rankings`;

  const response = await fetch(url, {
    // Next.js App Router caching (server-side only)
    next: { revalidate: 86400 }
  });

  if (!response.ok) {
    const body = await readErrorBody(response);
    throw new Error(
      `Failed to fetch rankings: ${response.status} ${response.statusText}. URL=${url}. Body=${body}`
    );
  }

  const data = (await response.json()) as Division[];

  if (!Array.isArray(data)) {
    throw new Error(`Unexpected rankings payload: expected array, got ${typeof data}`);
  }

  return data;
}

/**
 * Fetch all fighters data from the Octagon API
 * Maps API object keyed by fighterId -> OctagonFighter[]
 */
export async function getFighters(
  searchTerm?: string,
  category?: string
): Promise<OctagonFighter[]> {
  const url = `${API_BASE_URL}/fighters`;

  const response = await fetch(url, {
    // Next.js App Router caching (server-side only)
    next: { revalidate: 86400 }
  });

  if (!response.ok) {
    const body = await readErrorBody(response);
    throw new Error(
      `Failed to fetch fighters: ${response.status} ${response.statusText}. URL=${url}. Body=${body}`
    );
  }

  const data = (await response.json()) as Record<string, FighterDetails>;

  // Guard: API should return an object with fighter IDs as keys
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error(`Unexpected fighters payload: expected object keyed by fighterId`);
  }

  let allFighters: OctagonFighter[] = Object.entries(data).map(([fighterId, fighterDetail]) => {
    // Minimal runtime validation
    const name = fighterDetail?.name ?? fighterId;
    return {
      ...fighterDetail,
      id: fighterId,
      image: fighterDetail?.imgUrl
    };
  });

  // Optional: remove clearly invalid entries (no name)
  allFighters = allFighters.filter(f => !!f.name && typeof f.name === 'string');

  // Client-side search filter
  if (searchTerm && searchTerm.trim()) {
    const q = searchTerm.toLowerCase().trim();
    allFighters = allFighters.filter(f =>
      f.name.toLowerCase().includes(q) ||
      (!!f.nickname && f.nickname.toLowerCase().includes(q)) ||
      (!!f.category && f.category.toLowerCase().includes(q))
    );
  }

  // Category filter with normalization ("Lightweight" matches "Lightweight Division")
  if (category && category !== 'All') {
    // Special handling for pound-for-pound divisions
    if (category.includes('Pound-for-Pound')) {
      try {
        // Get rankings to find which fighters are in this pound-for-pound division
        const rankingsResponse = await fetch(`${API_BASE_URL}/rankings`, {
          next: { revalidate: 86400 }
        });

        if (rankingsResponse.ok) {
          const rankings = await rankingsResponse.json() as Division[];
          const p4pDivision = rankings.find(d => d.categoryName === category);

          if (p4pDivision && p4pDivision.fighters) {
            // Filter fighters to only include those ranked in this division
            const rankedFighterIds = new Set(p4pDivision.fighters.map(f => f.id));
            allFighters = allFighters.filter(f => rankedFighterIds.has(f.id));
          }
        }
      } catch (error) {
        console.error('Failed to fetch rankings for pound-for-pound filtering:', error);
        // If rankings fetch fails, fall back to showing all fighters
      }
    } else {
      const target = normalizeCategory(category);
      allFighters = allFighters.filter(f => {
        const fighterCategory = normalizeCategory(f.category);
        return fighterCategory === target;
      });
    }
  }

  return allFighters;
}

/**
 * Fetch single fighter details from the Octagon API
 */
export async function getFighterDetails(fighterId: string): Promise<FighterDetails> {
  if (!fighterId || typeof fighterId !== 'string') {
    throw new Error('fighterId is required');
  }

  const url = `${API_BASE_URL}/fighter/${encodeURIComponent(fighterId)}`;

  const response = await fetch(url, {
    next: { revalidate: 86400 }
  });

  if (!response.ok) {
    const body = await readErrorBody(response);
    throw new Error(
      `Failed to fetch fighter details: ${response.status} ${response.statusText}. URL=${url}. Body=${body}`
    );
  }

  const data = (await response.json()) as FighterDetails;

  // Minimal guard: ensure name exists
  if (!data || typeof data !== 'object' || !data.name) {
    throw new Error(`Unexpected fighter payload for ${fighterId}`);
  }

  return data;
}
