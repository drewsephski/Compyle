import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FantasyTeamType, FantasyFighterType, AddFighterToRosterInput, UpdateLineupInput } from '@/lib/types';
import { useUser } from './useUser';

export function useTeam(teamId: string) {
  const queryClient = useQueryClient();
  const { isSignedIn } = useUser();

  const { data: team, isLoading, error } = useQuery<FantasyTeamType & { budgetRemaining: number; roster: FantasyFighterType[] }>({
    queryKey: ['team', teamId],
    queryFn: async () => {
      if (!isSignedIn) throw new Error('Not signed in');
      const response = await fetch(`/api/teams/${teamId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch team data');
      }
      return response.json();
    },
    enabled: isSignedIn && !!teamId,
  });

  const addFighterMutation = useMutation({
    mutationFn: async (fighterData: AddFighterToRosterInput) => {
      const response = await fetch(`/api/teams/${teamId}/roster`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fighterData),
      });
      if (!response.ok) {
        throw new Error('Failed to add fighter to roster');
      }
      return response.json();
    },
    onMutate: async (newFighter) => {
      await queryClient.cancelQueries({ queryKey: ['team', teamId] });
      const previousTeam = queryClient.getQueryData(['team', teamId]);

      queryClient.setQueryData(['team', teamId], (old: any) => {
        if (!old) return old;
        const newRoster = [...old.roster, { ...newFighter, id: 'optimistic', fighter: { id: newFighter.fighterId, name: 'Loading...', octagonId: null, record: null, stats: null, category: null, nickname: null } }];
        return {
          ...old,
          roster: newRoster,
          budgetUsed: old.budgetUsed + newFighter.acquisitionCost,
          budgetRemaining: old.budgetRemaining - newFighter.acquisitionCost,
        };
      });
      return { previousTeam };
    },
    onError: (err, newFighter, context) => {
      queryClient.setQueryData(['team', teamId], context?.previousTeam);
      console.error('Error adding fighter:', err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
    },
  });

  const removeFighterMutation = useMutation({
    mutationFn: async (fighterId: string) => {
      const response = await fetch(`/api/teams/${teamId}/roster`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fighterId }),
      });
      if (!response.ok) {
        throw new Error('Failed to remove fighter from roster');
      }
      return response.json();
    },
    onMutate: async (fighterId) => {
      await queryClient.cancelQueries({ queryKey: ['team', teamId] });
      const previousTeam = queryClient.getQueryData(['team', teamId]);

      queryClient.setQueryData(['team', teamId], (old: any) => {
        if (!old) return old;
        const removedFighter = old.roster.find((f: FantasyFighterType) => f.fighterId === fighterId);
        if (!removedFighter) return old;

        const newRoster = old.roster.filter((f: FantasyFighterType) => f.fighterId !== fighterId);
        return {
          ...old,
          roster: newRoster,
          budgetUsed: old.budgetUsed - removedFighter.acquisitionCost,
          budgetRemaining: old.budgetRemaining + removedFighter.acquisitionCost,
        };
      });
      return { previousTeam };
    },
    onError: (err, fighterId, context) => {
      queryClient.setQueryData(['team', teamId], context?.previousTeam);
      console.error('Error removing fighter:', err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
    },
  });

  const updateLineupMutation = useMutation({
    mutationFn: async (updates: UpdateLineupInput) => {
      const response = await fetch(`/api/teams/${teamId}/lineup`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error('Failed to update lineup');
      }
      return response.json();
    },
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: ['team', teamId] });
      const previousTeam = queryClient.getQueryData(['team', teamId]);

      queryClient.setQueryData(['team', teamId], (old: any) => {
        if (!old) return old;
        const newRoster = old.roster.map((fighter: FantasyFighterType) => {
          const update = updates.find(u => u.fighterId === fighter.fighterId);
          return update ? { ...fighter, position: update.position } : fighter;
        });
        return {
          ...old,
          roster: newRoster,
        };
      });
      return { previousTeam };
    },
    onError: (err, updates, context) => {
      queryClient.setQueryData(['team', teamId], context?.previousTeam);
      console.error('Error updating lineup:', err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
    },
  });

  return {
    team,
    isLoading,
    error,
    addFighter: addFighterMutation.mutate,
    removeFighter: removeFighterMutation.mutate,
    updateLineup: updateLineupMutation.mutate,
  };
}