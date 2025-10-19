"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { FighterCard } from "./FighterCard";
import { FighterModal } from "./FighterModal";
import { OctagonFighter, Division } from "@/lib/types";
import { useFavorites } from "@/hooks/useFavorites";
import { useUser } from "@/hooks/useUser";
import { useQuery } from "@tanstack/react-query";
import { SearchFilter } from "./SearchFilter";
import { SkeletonCard } from "./SkeletonCard";
import { getFighters } from "@/lib/api"; // Assuming this function exists or will be created

interface FighterGridProps {
  divisions: Division[];
}

export function FighterGrid({ divisions }: FighterGridProps) {
  const [selectedFighter, setSelectedFighter] =
    useState<OctagonFighter | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("All");

  const { isSignedIn } = useUser();
  const { isFavorited, toggleFavorite } = useFavorites();

  // Get available categories from fighters data
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    // We'll get this from the fighters query data
    return categories;
  }, []);

  // Fetch fighters with React Query
  const {
    data: fighters,
    isLoading,
    error,
  } = useQuery<OctagonFighter[]>({
    queryKey: ["fighters", searchTerm, filterCategory],
    queryFn: () => getFighters(searchTerm, filterCategory),
  });

  // Update available categories when fighters data loads
  useEffect(() => {
    if (fighters && fighters.length > 0) {
      const categories = new Set(fighters.map(f => f.category).filter(Boolean));
      // Update availableCategories if needed
    }
  }, [fighters]);

  const openModal = useCallback((fighter: OctagonFighter) => {
    setSelectedFighter(fighter);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedFighter(null);
  }, []);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleFilter = useCallback((category: string) => {
    setFilterCategory(category);
  }, []);

  // Placeholder for adding to fantasy team - will be implemented later
  const handleAddToFantasyTeam = (fighterId: string) => {
    console.log(`Add fighter ${fighterId} to fantasy team`);
    // Logic to open team selector modal or add to a specific team
  };

  if (error)
    return (
      <div className="text-red-500 text-center">Failed to load fighters.</div>
    );

  return (
    <div className="container mx-auto p-4">
      <SearchFilter
        divisions={divisions} 
        selectedDivision={filterCategory}
        onDivisionChange={handleFilter}
        searchQuery={searchTerm}
        onSearchChange={handleSearch}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {fighters?.map((fighter) => (
            <FighterCard
              key={fighter.id}
              fighter={fighter}
              onClick={openModal}
              // Pass favorite status and toggle function
              // isFavorited={isFavorited(fighter.id)} // This prop is handled internally by FighterCard
              // onToggleFavorite={toggleFavorite} // This prop is handled internally by FighterCard
              // Pass user ID for conditional rendering if needed inside card
              // currentUserId={isSignedIn ? 'user-id-placeholder' : undefined} // Not needed, isSignedIn is sufficient
              showFantasyActions={isSignedIn} // Show fantasy actions if signed in
              onAddToTeam={handleAddToFantasyTeam}
            />
          ))}
        </div>
      )}

      <FighterModal
        isOpen={isModalOpen}
        onClose={closeModal}
        fighter={selectedFighter}
        onAddToFantasyTeam={handleAddToFantasyTeam} // Pass to modal for potential team addition
        // relatedDiscussions={[]} // Placeholder for fetching related discussions
      />
    </div>
  );
}
