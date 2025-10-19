'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useState } from 'react'; // Import useState

export function Providers({ children }: { children: React.ReactNode }) {
  // Initialize QueryClient inside the component using useState to ensure it's stable across renders
  const [queryClient] = useState(() => new QueryClient());
  return (
    <ClerkProvider>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ClerkProvider>
  );
}