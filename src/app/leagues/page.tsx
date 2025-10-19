'use client';

import { useState } from 'react';
import { useLeagues } from '@/hooks/useLeagues';
import { LeagueCard } from '@/components/LeagueCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SkeletonCard } from '@/components/SkeletonCard'; // Assuming SkeletonCard is general enough
import Link from 'next/link';
import { useUser } from '@/hooks/useUser';

export default function LeaguesPage() {
  const { isSignedIn } = useUser();
  const [activeTab, setActiveTab] = useState<'all' | 'my-leagues' | 'public'>(isSignedIn ? 'my-leagues' : 'all');
  const [searchTerm, setSearchTerm] = useState('');

  const { leagues, isLoading, error } = useLeagues({ filter: activeTab, enabled: true });

  const filteredLeagues = leagues?.filter(league =>
    league.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4 py-8">
      <h1 className="text-4xl font-bold text-white mb-8 text-center">Fantasy Leagues</h1>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <Input
          placeholder="Search leagues..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList>
            <TabsTrigger value="all">All Leagues</TabsTrigger>
            {isSignedIn && <TabsTrigger value="my-leagues">My Leagues</TabsTrigger>}
            {/* <TabsTrigger value="public">Public Leagues</TabsTrigger> */}
          </TabsList>
        </Tabs>
        <Link href="/leagues/create">
          <Button>Create New League</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <p className="text-red-500 text-center">Error loading leagues: {error.message}</p>
      ) : filteredLeagues && filteredLeagues.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeagues.map((league) => (
            <LeagueCard key={league.id} league={league} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">No leagues found matching your criteria.</p>
      )}
    </div>
  );
}