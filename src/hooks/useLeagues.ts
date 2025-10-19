import { useQuery } from '@tanstack/react-query';
import { FantasyLeagueType } from '@/lib/types'; // Assuming FantasyLeagueType is defined
import { useUser } from './useUser';

interface UseLeaguesOptions {
  filter?: 'my-leagues' | 'public' | 'all';
  enabled?: boolean;
}

export function useLeagues(options?: UseLeaguesOptions) {
  const { isSignedIn } = useUser();
  const { filter = 'all', enabled = true } = options || {};

  const { data: leagues, isLoading, error, refetch } = useQuery<FantasyLeagueType[]>({
    queryKey: ['leagues', filter],
    queryFn: async () => {
      if (!isSignedIn && (filter === 'my-leagues' || filter === 'all')) return []; // Don't fetch private leagues if not signed in

      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('filter', filter);
      }

      const response = await fetch(`/api/leagues?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch leagues');
      }
      return response.json();
    },
    enabled: enabled,
  });

  return {
    leagues,
    isLoading,
    error,
    refetch,
  };
}