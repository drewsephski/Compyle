import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, HeartIcon, PlusIcon } from '@heroicons/react/24/outline'; // Adjust import for lucide-react if used elsewhere
import { OctagonFighter } from '@/lib/types';
import Image from 'next/image';
import { Tab } from '@headlessui/react';
import { useFavorites } from '@/hooks/useFavorites';
import { useUser } from '@/hooks/useUser';
import { cn } from '@/lib/utils';


interface FighterModalProps {
  isOpen: boolean;
  onClose: () => void;
  fighter: OctagonFighter | null;
  onAddToFantasyTeam?: (fighterId: string) => void;
  relatedDiscussions?: any[]; // Placeholder for actual discussion type
}

export function FighterModal({
  isOpen,
  onClose,
  fighter,
  onAddToFantasyTeam,
  relatedDiscussions,
}: FighterModalProps) {
  const { isSignedIn } = useUser();
  const { isFavorited, toggleFavorite } = useFavorites();

  if (!fighter) return null;

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSignedIn) {
      toggleFavorite(fighter.id);
    } else {
      alert('Please sign in to favorite fighters.');
    }
  };

  const handleAddToTeam = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSignedIn && onAddToFantasyTeam) {
      onAddToFantasyTeam(fighter.id);
    } else if (!isSignedIn) {
      alert('Please sign in to add fighters to your team.');
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-gray-900 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-gray-900 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-2xl font-semibold leading-6 text-white flex justify-between items-center">
                      {fighter.name}
                      <div className="flex items-center space-x-2">
                        {isSignedIn && onAddToFantasyTeam && (
                          <button
                            onClick={handleAddToTeam}
                            className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors flex items-center gap-1"
                          >
                            <PlusIcon className="h-4 w-4" /> Add to Team
                          </button>
                        )}
                        {isSignedIn && (
                          <button
                            onClick={handleToggleFavorite}
                            className="p-1 rounded-full bg-gray-800 text-red-500 hover:text-red-400"
                            aria-label="Toggle Favorite"
                          >
                            <HeartIcon className="h-5 w-5" fill={isFavorited(fighter.id) ? 'currentColor' : 'none'} />
                          </button>
                        )}
                      </div>
                    </Dialog.Title>
                    {fighter.nickname && (
                      <p className="text-sm text-gray-400 italic">"{fighter.nickname}"</p>
                    )}
                    {fighter.image && (
                      <div className="relative w-64 h-64 mx-auto">
                        <Image
                          src={fighter.image}
                          alt={fighter.name}
                          layout="fill"
                          objectFit="contain"
                          className="rounded-sm"
                        />
                      </div>
                    )}
                    <div className="mt-2 space-y-2">
                      {fighter.wins && fighter.losses && (
                        <p className="text-sm text-gray-300">
                          Record: {fighter.wins}-{fighter.losses}
                          {fighter.draws && fighter.draws !== '0' ? `-${fighter.draws}` : ''}
                        </p>
                      )}
                      {fighter.ranking && (
                        <p className="text-sm text-gray-300">Rank: #{fighter.ranking}</p>
                      )}
                      {fighter.category && (
                        <p className="text-sm text-gray-300">Division: {fighter.category}</p>
                      )}
                      {fighter.status && (
                        <p className="text-sm text-gray-300">Status: {fighter.status}</p>
                      )}
                    </div>

                    <Tab.Group>
                      <Tab.List className="flex space-x-1 rounded-xl bg-gray-700 p-1 mt-4">
                        <Tab
                          className={({ selected }) =>
                            cn(
                              'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-white',
                              'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                              selected
                                ? 'bg-white text-gray-900 shadow'
                                : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                            )
                          }
                        >
                          Stats
                        </Tab>
                        <Tab
                          className={({ selected }) =>
                            cn(
                              'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-white',
                              'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                              selected
                                ? 'bg-white text-gray-900 shadow'
                                : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                            )
                          }
                        >
                          Discussions
                        </Tab>
                      </Tab.List>
                      <Tab.Panels className="mt-2">
                        <Tab.Panel
                          className={cn(
                            'rounded-xl bg-gray-800 p-3',
                            'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
                          )}
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Physical Stats */}
                            <div>
                              <h4 className="text-lg font-bold text-white mb-3">Physical Stats</h4>
                              <div className="space-y-2">
                                {fighter.age && (
                                  <p className="text-sm text-gray-300">Age: {fighter.age} years</p>
                                )}
                                {fighter.height && (
                                  <p className="text-sm text-gray-300">Height: {fighter.height}"</p>
                                )}
                                {fighter.weight && (
                                  <p className="text-sm text-gray-300">Weight: {fighter.weight} lbs</p>
                                )}
                                {fighter.reach && (
                                  <p className="text-sm text-gray-300">Reach: {fighter.reach}"</p>
                                )}
                                {fighter.legReach && (
                                  <p className="text-sm text-gray-300">Leg Reach: {fighter.legReach}"</p>
                                )}
                              </div>
                            </div>

                            {/* Career Stats */}
                            <div>
                              <h4 className="text-lg font-bold text-white mb-3">Career Info</h4>
                              <div className="space-y-2">
                                {fighter.fightingStyle && (
                                  <p className="text-sm text-gray-300">Fighting Style: {fighter.fightingStyle}</p>
                                )}
                                {fighter.trainsAt && (
                                  <p className="text-sm text-gray-300">Trains At: {fighter.trainsAt}</p>
                                )}
                                {fighter.placeOfBirth && (
                                  <p className="text-sm text-gray-300">Place of Birth: {fighter.placeOfBirth}</p>
                                )}
                                {fighter.octagonDebut && (
                                  <p className="text-sm text-gray-300">UFC Debut: {fighter.octagonDebut}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </Tab.Panel>
                        <Tab.Panel
                          className={cn(
                            'rounded-xl bg-gray-800 p-3',
                            'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
                          )}
                        >
                          {/* Related discussions content */}
                          <h4 className="text-lg font-bold text-white mb-2">Related Discussions</h4>
                          {relatedDiscussions && relatedDiscussions.length > 0 ? (
                            <ul>
                              {relatedDiscussions.map((discussion) => (
                                <li key={discussion.id} className="text-sm text-gray-300 mb-1">
                                  <a href={`/discussions/${discussion.id}`} className="hover:underline">
                                    {discussion.title} by {discussion.author.displayName}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-400">No discussions found for this fighter.</p>
                          )}
                          <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                            Start New Discussion
                          </button>
                        </Tab.Panel>
                      </Tab.Panels>
                    </Tab.Group>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
