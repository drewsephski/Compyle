import { useUser as useClerkUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { UserType } from '@/lib/types'; // Assuming UserType is defined in lib/types

export function useUser() {
  const { user: clerkUser, isLoaded, isSignedIn } = useClerkUser();

  const { data: prismaUser, isLoading, error } = useQuery<UserType | null>({
    queryKey: ['currentUser', clerkUser?.id],
    queryFn: async () => {
      if (!clerkUser?.id) return null;
      const response = await fetch(`/api/users/profile`);
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      return response.json();
    },
    enabled: isSignedIn && isLoaded, // Only run if Clerk is loaded and user is signed in
  });

  return {
    clerkUser,
    prismaUser,
    isLoaded,
    isSignedIn,
    isLoading: isLoading || !isLoaded,
    error,
  };
}