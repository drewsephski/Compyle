'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DiscussionThreadType } from '@/lib/types';
import { DiscussionCard } from '@/components/DiscussionCard'; // Assuming DiscussionCard component exists
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SkeletonCard } from '@/components/SkeletonCard';
import Link from 'next/link';
import { useUser } from '@/hooks/useUser';

export default function DiscussionsPage() {
  const { isSignedIn } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('GENERAL'); // Default to General or All

  const { data: threads, isLoading, error } = useQuery<DiscussionThreadType[]>({
    queryKey: ['discussionThreads', activeCategory, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeCategory !== 'ALL') {
        params.append('category', activeCategory);
      }
      if (searchTerm) {
        params.append('search', searchTerm); // Assuming API supports search
      }
      const response = await fetch(`/api/discussions?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch discussion threads');
      }
      return response.json();
    },
  });

  return (
    <div className="container mx-auto p-4 py-8">
      <h1 className="text-4xl font-bold text-white mb-8 text-center">Discussions</h1>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <Input
          placeholder="Search discussions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value)}>
          <TabsList>
            <TabsTrigger value="ALL">All</TabsTrigger>
            <TabsTrigger value="GENERAL">General</TabsTrigger>
            <TabsTrigger value="FIGHTER">Fighters</TabsTrigger>
            <TabsTrigger value="EVENT">Events</TabsTrigger>
            <TabsTrigger value="FANTASY">Fantasy</TabsTrigger>
          </TabsList>
        </Tabs>
        {isSignedIn && (
          <Link href="/discussions/new">
            <Button>New Discussion</Button>
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <p className="text-red-500 text-center">Error loading discussions: {error.message}</p>
      ) : threads && threads.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {threads.map((thread) => (
            <DiscussionCard key={thread.id} thread={thread} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">No discussion threads found.</p>
      )}
    </div>
  );
}