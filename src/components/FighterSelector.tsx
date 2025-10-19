'use client';

import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { ExtendedFighter } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import { getFighters } from '@/lib/api'; // Assuming this function exists
import { FighterCard } from './FighterCard';
import { SkeletonCard } from './SkeletonCard';

interface FighterSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFighter: (fighterId: string, acquisitionCost: number) => void;
  teamBudgetRemaining: number;
  rosterFighterIds: string[];
}

export function FighterSelector({
  isOpen,
  onClose,
  onSelectFighter,
  teamBudgetRemaining,
  rosterFighterIds,
}: FighterSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: fighters, isLoading, error } = useQuery<ExtendedFighter[]>({
    queryKey: ['fighters', searchTerm],
    queryFn: () => getFighters(searchTerm, ''), // Empty string for category to get all
  });

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleSelect = (fighter: ExtendedFighter) => {
    // Placeholder for actual cost calculation
    const acquisitionCost = fighter.ranking ? fighter.ranking * 1000 : 5000; // Example cost calculation
    if (acquisitionCost <= teamBudgetRemaining) {
      onSelectFighter(fighter.id, acquisitionCost);
      onClose();
    } else {
      alert('Not enough budget to acquire this fighter!');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Select Fighter for Roster</DialogTitle>
          <DialogDescription>
            Search for fighters and add them to your team. Budget remaining: ${teamBudgetRemaining.toFixed(2)}
          </DialogDescription>
        </DialogHeader>
        <Input
          placeholder="Search fighters..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="mb-4"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto">
          {isLoading ? (
            [...Array(6)].map((_, index) => <SkeletonCard key={index} />)
          ) : error ? (
            <div className="col-span-full text-red-500 text-center">Failed to load fighters.</div>
          ) : (
            fighters?.map((fighter) => {
              const acquisitionCost = fighter.ranking ? fighter.ranking * 1000 : 5000;
              const isDisabled = rosterFighterIds.includes(fighter.id) || acquisitionCost > teamBudgetRemaining;

              return (
                <FighterCard
                  key={fighter.id}
                  fighter={fighter}
                  onClick={() => !isDisabled && handleSelect(fighter)}
                  className={isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                  // Optionally show cost on card
                  // footer={
                  //   <div className="text-sm">Cost: ${acquisitionCost.toFixed(2)}</div>
                  // }
                />
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}