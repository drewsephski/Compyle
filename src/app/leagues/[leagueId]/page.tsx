'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { FantasyLeagueType, LeagueRole } from '@/lib/types';
import { useUser } from '@/hooks/useUser';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Leaderboard } from '@/components/Leaderboard'; // Assuming Leaderboard component exists
import Link from 'next/link';

export default function LeagueDetailPage() {
  const params = useParams();
  const leagueId = params.leagueId as string;
  const router = useRouter();
  const { isSignedIn, prismaUser } = useUser();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: league, isLoading, error, refetch } = useQuery<FantasyLeagueType & {
    isMember: boolean;
    isCommissioner: boolean;
    memberCount: number;
    teamCount: number;
    commissioner: { displayName?: string | null; username?: string | null };
    members: { user: { displayName?: string | null; username?: string | null; avatar?: string | null } }[];
  }>({
    queryKey: ['league', leagueId],
    queryFn: async () => {
      const response = await fetch(`/api/leagues/${leagueId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch league details');
      }
      return response.json();
    },
    enabled: !!leagueId,
  });

  const { data: standings, isLoading: isLoadingStandings } = useQuery({
    queryKey: ['leagueStandings', leagueId],
    queryFn: async () => {
      const response = await fetch(`/api/leagues/${leagueId}/standings`);
      if (!response.ok) {
        throw new Error('Failed to fetch league standings');
      }
      return response.json();
    },
    enabled: !!leagueId && activeTab === 'standings',
  });

  const handleJoinLeaveLeague = async () => {
    if (!isSignedIn) {
      alert('Please sign in to join or leave a league.');
      return;
    }

    if (!league) return;

    const endpoint = league.isMember ? `/api/leagues/${leagueId}/leave` : `/api/leagues/${leagueId}/join`;
    const method = 'POST'; // Both join and leave are POST requests in this API design

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${league.isMember ? 'leave' : 'join'} league`);
      }

      alert(`Successfully ${league.isMember ? 'left' : 'joined'} the league!`);
      refetch(); // Refetch league data to update membership status
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (isLoading) return <div className="text-center text-white py-8">Loading league details...</div>;
  if (error) return <div className="text-red-500 text-center py-8">Error: {error.message}</div>;
  if (!league) return <div className="text-center text-white py-8">League not found.</div>;

  const isUserCommissioner = league.isCommissioner;
  const isUserMember = league.isMember;

  return (
    <div className="container mx-auto p-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-white">{league.name}</h1>
        <div className="flex items-center gap-2">
          {isUserCommissioner && (
            <Button variant="outline" className="text-white border-white hover:bg-white hover:text-red-800">
              Manage League
            </Button>
          )}
          <Button onClick={handleJoinLeaveLeague}>
            {isUserMember ? 'Leave League' : 'Join League'}
          </Button>
        </div>
      </div>

      <p className="text-muted-foreground mb-4">{league.description}</p>
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
        <Badge variant="info">{league.status}</Badge>
        <span>Commissioner: {league.commissioner?.displayName || league.commissioner?.username || 'N/A'}</span>
        <span>Members: {league.memberCount}/{league.maxMembers}</span>
        <span>Dates: {format(new Date(league.startDate), 'MMM dd, yyyy')} - {format(new Date(league.endDate), 'MMM dd, yyyy')}</span>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="standings">Standings</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="discussions">Discussions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader><CardTitle>League Overview</CardTitle></CardHeader>
            <CardContent>
              <p>Entry Fee: ${league.entryFee?.toFixed(2) || '0.00'}</p>
              <p>Prize Pool: ${league.prizePool?.toFixed(2) || '0.00'}</p>
              {/* Add more overview stats */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="standings">
          {isLoadingStandings ? (
            <div className="text-center text-white">Loading standings...</div>
          ) : (
            <Leaderboard standings={standings || []} highlightTeamId={prismaUser?.teams?.find(t => t.leagueId === league.id)?.id} />
          )}
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardHeader><CardTitle>League Members</CardTitle></CardHeader>
            <CardContent>
              <ul>
                {league.members.map((member) => (
                  <li key={member.user.id} className="flex items-center gap-2 mb-2">
                    <Link href={`/profile/${member.user.id}`} className="flex items-center gap-2 hover:underline">
                      <img src={member.user.avatar || '/placeholder-avatar.png'} alt={member.user.displayName || member.user.username || 'User'} className="w-8 h-8 rounded-full" />
                      <span>{member.user.displayName || member.user.username}</span>
                    </Link>
                    {member.user.id === league.commissionerId && <Badge variant="default">Commissioner</Badge>}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules">
          <Card>
            <CardHeader><CardTitle>League Rules</CardTitle></CardHeader>
            <CardContent>
              {league.rules ? (
                <pre className="bg-gray-800 p-4 rounded-md text-sm text-white overflow-x-auto">
                  {JSON.stringify(league.rules, null, 2)}
                </pre>
              ) : (
                <p className="text-muted-foreground">No specific rules defined for this league.</p>
              )}
              {/* More detailed rule display */}
            </CardContent>
          </Card&gt>
        </TabsContent>

        <TabsContent value="discussions">
          <Card>
            <CardHeader><CardTitle>League Discussions</CardTitle></CardHeader>
            <CardContent>
              {league.discussions && league.discussions.length > 0 ? (
                <ul>
                  {league.discussions.map((discussion) => (
                    <li key={discussion.id} className="mb-2">
                      <Link href={`/discussions/${discussion.id}`} className="text-primary hover:underline">
                        {discussion.title}
                      </Link>
                      <span className="ml-2 text-sm text-muted-foreground">by {discussion.author.displayName}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No discussions for this league yet.</p>
              )}
              <Link href={`/discussions/new?leagueId=${league.id}`}>
                <Button className="mt-4">Start New Discussion</Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}