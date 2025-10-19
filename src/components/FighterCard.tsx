import Image from 'next/image';
import { OctagonFighter } from '@/lib/types';
import { cn } from '@/lib/utils';
import { HeartIcon, PlusIcon } from 'lucide-react'; // Assuming lucide-react is installed, if not, add to package.json
import { useFavorites } from '@/hooks/useFavorites';
import { useUser } from '@/hooks/useUser';

interface FighterCardProps {
  fighter: OctagonFighter;
  onClick: (fighter: OctagonFighter) => void;
  className?: string;
  showFantasyActions?: boolean;
  onAddToTeam?: (fighterId: string) => void;
}

export function FighterCard({
  fighter,
  onClick,
  className,
  showFantasyActions = false,
  onAddToTeam,
}: FighterCardProps) {
  const { isSignedIn } = useUser();
  const { isFavorited, toggleFavorite } = useFavorites();

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSignedIn) {
      toggleFavorite(fighter.id);
    } else {
      // Optionally redirect to sign-in or show a message
      alert('Please sign in to favorite fighters.');
    }
  };

  const handleAddToTeam = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSignedIn && onAddToTeam) {
      onAddToTeam(fighter.id);
    } else if (!isSignedIn) {
      alert('Please sign in to add fighters to your team.');
    }
  };

  return (
    <div
      onClick={() => onClick(fighter)}
      className={cn(
        'relative flex flex-col items-center justify-center p-4 border border-gray-700 rounded-lg shadow-lg cursor-pointer transition-all duration-200 hover:scale-105 bg-gray-800',
        className
      )}
    >
      {isSignedIn && (
        <button
          onClick={handleToggleFavorite}
          className="absolute top-2 right-2 p-1 rounded-full bg-gray-900 bg-opacity-70 text-red-500 hover:text-red-400 z-10"
          aria-label="Toggle Favorite"
        >
          <HeartIcon size={20} fill={isFavorited(fighter.id) ? 'currentColor' : 'none'} />
        </button>
      )}

      {fighter.image && (
        <div className="relative w-44 h-44 mb-4">
          <Image
            src={fighter.image}
            alt={fighter.name}
            layout="fill"
            objectFit="contain"
            className="rounded-full border-2 border-red-500"
          />
        </div>
      )}
      <h3 className="text-xl font-bold text-white text-center">{fighter.name}</h3>
      {fighter.nickname && (
        <p className="text-sm text-gray-400 italic">"{fighter.nickname}"</p>
      )}
      {fighter.wins && fighter.losses && (
        <p className="text-sm text-gray-300 mt-1">
          Record: {fighter.wins}-{fighter.losses}
          {fighter.draws && fighter.draws !== '0' ? `-${fighter.draws}` : ''}
        </p>
      )}
      {fighter.ranking && (
        <p className="text-sm text-gray-300">Rank: #{fighter.ranking}</p>
      )}

      {/* Discussion Count Badge - Placeholder for now, will be implemented with actual data */}
      {/* <span className="absolute bottom-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
        5 Discussions
      </span> */}

      {showFantasyActions && isSignedIn && (
        <button
          onClick={handleAddToTeam}
          className="mt-3 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-1"
        >
          <PlusIcon size={16} /> Add to Team
        </button>
      )}
    </div>
  );
}
