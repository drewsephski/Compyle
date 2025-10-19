import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserFavoriteType } from '@/lib/types'; // Assuming UserFavoriteType is defined
import { useUser } from './useUser';

export function useFavorites() {
  const queryClient = useQueryClient();
  const { isSignedIn } = useUser();

  const { data: favorites, isLoading, error } = useQuery<UserFavoriteType[]>({
    queryKey: ['favorites'],
    queryFn: async () => {
      if (!isSignedIn) return [];
      const response = await fetch('/api/favorites');
      if (!response.ok) {
        throw new Error('Failed to fetch favorites');
      }
      return response.json();
    },
    enabled: isSignedIn, // Only run if user is signed in
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (fighterId: string) => {
      const isCurrentlyFavorited = favorites?.some(fav => fav.fighterId === fighterId);
      const method = isCurrentlyFavorited ? 'DELETE' : 'POST';

      const response = await fetch('/api/favorites', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fighterId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to toggle favorite: ${response.statusText}`);
      }
      return response.json();
    },
    onMutate: async (fighterId) => {
      await queryClient.cancelQueries({ queryKey: ['favorites'] });

      const previousFavorites = queryClient.getQueryData<UserFavoriteType[]>(['favorites']);
      const isCurrentlyFavorited = previousFavorites?.some(fav => fav.fighterId === fighterId);

      queryClient.setQueryData<UserFavoriteType[]>(['favorites'], (old) => {
        if (!old) return [];
        if (isCurrentlyFavorited) {
          return old.filter(fav => fav.fighterId !== fighterId);
        } else {
          // Optimistically add a new favorite. Fighter details will be fetched on refetch.
          return [...old, { fighterId, id: 'optimistic', userId: 'optimistic', createdAt: new Date(), fighter: { id: fighterId, name: 'Loading...', octagonId: null, record: null, stats: null, category: null, nickname: null } as any }];
        }
      });
      return { previousFavorites };
    },
    onError: (err, fighterId, context) => {
      queryClient.setQueryData(['favorites'], context?.previousFavorites);
      console.error('Error toggling favorite:', err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const isFavorited = (fighterId: string) => favorites?.some(fav => fav.fighterId === fighterId) || false;

  return {
    favorites,
    isLoading,
    error,
    toggleFavorite: toggleFavoriteMutation.mutate,
    isFavorited,
  };
}