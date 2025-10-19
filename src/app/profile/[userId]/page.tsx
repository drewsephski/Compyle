'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { UserType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Link from 'next/link';
import { useState } from 'react';

export default function PublicProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const [activeTab, setActiveTab] = useState('overview');

  const { data: user, isLoading, error } = useQuery<UserType & {
    totalLeagues: number;
    totalTeams: number;
    achievements: { achievement: { name: string; icon: string; description: string } }[];
  }>({
    queryKey: ['publicProfile', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      return response.json();
    },
    enabled: !!userId,
  });

  if (isLoading) return <div className="text-center text-white py-8">Loading user profile...</div>;
  if (error) return <div className="text-red-500 text-center py-8">Error: {error.message}</div>;
  if (!user) return <div className="text-center text-white py-8">User not found.</div>;

  return (
    <div className="container mx-auto p-4 py-8 max-w-4xl">
      <div className="flex items-center gap-6 mb-8">
        <Avatar className="h-24 w-24">
          <AvatarImage src={user.avatar || undefined} />
          <AvatarFallback className="text-4xl">{user.displayName?.charAt(0) || user.username?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-4xl font-bold text-white">{user.displayName || user.username}</h1>
          <p className="text-muted-foreground">@{user.username}</p>
          <p className="text-muted-foreground mt-2">{user.bio || 'No bio yet.'}</p>
          <span className="text-sm text-muted-foreground">Joined: {format(new Date(user.joinDate), 'MMM dd, yyyy')}</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader><CardTitle>Profile Overview</CardTitle></CardHeader>
            <CardContent>
              <p>Total Leagues: {user.totalLeagues || 0}</p>
              <p>Total Teams: {user.totalTeams || 0}</p>
              {/* Add more public stats */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams">
          <Card>
            <CardHeader><CardTitle>Teams</CardTitle></CardHeader>
            <CardContent>
              {user.teams && user.teams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.teams.map((team) => (
                    <Link href={`/teams/${team.id}`} key={team.id}>
                      <div className="p-4 border rounded-lg hover:bg-gray-800 transition-colors">
                        <h3 className="font-semibold text-white">Team {team.id}</h3> {/* Team name would be better */}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">This user is not part of any teams yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements">
          <Card>
            <CardHeader><CardTitle>Achievements</CardTitle></CardHeader>
            <CardContent>
              {user.achievements && user.achievements.length > 0 ? (
                <ul className="list-disc list-inside text-white">
                  {user.achievements.map((ua) => (
                    <li key={ua.achievement.name} className="mb-1">
                      <span className="font-semibold">{ua.achievement.icon} {ua.achievement.name}</span>: {ua.achievement.description}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No achievements earned yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}