'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Link from 'next/link';
import { FighterCard } from '@/components/FighterCard'; // Assuming FighterCard exists
import { useFavorites } from '@/hooks/useFavorites';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UpdateProfileInput } from '@/lib/types';
import { updateProfileSchema } from '@/lib/validations';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function ProfilePage() {
  const { isSignedIn, prismaUser, isLoaded } = useUser();
  const { isFavorited, toggleFavorite } = useFavorites();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      displayName: prismaUser?.displayName || '',
      bio: prismaUser?.bio || '',
      avatar: prismaUser?.avatar || '',
    },
  });

  // Reset form with prismaUser data when it loads or changes
  useEffect(() => {
    if (isLoaded && prismaUser) {
      reset({
        displayName: prismaUser.displayName || '',
        bio: prismaUser.bio || '',
        avatar: prismaUser.avatar || '',
      });
    }
  }, [isLoaded, prismaUser, reset]);


  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateProfileInput) => {
      const response = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      alert('Profile updated successfully!');
    },
    onError: (err) => {
      alert(err.message);
    },
  });

  const onSubmit = (data: UpdateProfileInput) => {
    updateProfileMutation.mutate(data);
  };

  if (!isLoaded) return <div className="text-center text-white py-8">Loading user data...</div>;
  if (!isSignedIn || !prismaUser) return <div className="text-center text-red-500 py-8">Please sign in to view your profile.</div>;

  return (
    <div className="container mx-auto p-4 py-8 max-w-4xl">
      <div className="flex items-center gap-6 mb-8">
        <Avatar className="h-24 w-24">
          <AvatarImage src={prismaUser.avatar || undefined} />
          <AvatarFallback className="text-4xl">{prismaUser.displayName?.charAt(0) || prismaUser.username?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-4xl font-bold text-white">{prismaUser.displayName || prismaUser.username}</h1>
          <p className="text-muted-foreground">@{prismaUser.username}</p>
          <p className="text-muted-foreground mt-2">{prismaUser.bio || 'No bio yet.'}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="info">{prismaUser.subscription}</Badge>
            <span className="text-sm text-muted-foreground">Joined: {format(new Date(prismaUser.joinDate), 'MMM dd, yyyy')}</span>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader><CardTitle>Profile Overview</CardTitle></CardHeader>
            <CardContent>
              <p>Total Leagues: {prismaUser.leagues?.length || 0}</p>
              <p>Total Teams: {prismaUser.teams?.length || 0}</p>
              <p>Favorite Fighters: {prismaUser.favorites?.length || 0}</p>
              {/* Add more stats like best ranking, etc. */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="favorites">
          <Card>
            <CardHeader><CardTitle>Favorite Fighters</CardTitle></CardHeader>
            <CardContent>
              {prismaUser.favorites && prismaUser.favorites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {prismaUser.favorites.map((fav) => (
                    <FighterCard
                      key={fav.fighter.id}
                      fighter={fav.fighter}
                      onClick={() => console.log('View fighter')} // Replace with actual navigation
                      isFavorited={isFavorited(fav.fighter.id)}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">You haven't favorited any fighters yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams">
          <Card>
            <CardHeader><CardTitle>My Teams</CardTitle></CardHeader>
            <CardContent>
              {prismaUser.teams && prismaUser.teams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {prismaUser.teams.map((team) => (
                    <Link href={`/teams/${team.id}`} key={team.id}>
                      <div className="p-4 border rounded-lg hover:bg-gray-800 transition-colors">
                        <h3 className="font-semibold text-white">{team.name}</h3>
                        <p className="text-sm text-muted-foreground">Score: {team.totalScore.toFixed(2)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">You are not part of any teams yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements">
          <Card>
            <CardHeader><CardTitle>Achievements</CardTitle></CardHeader>
            <CardContent>
              {prismaUser.achievements && prismaUser.achievements.length > 0 ? (
                <ul className="list-disc list-inside text-white">
                  {prismaUser.achievements.map((ua) => (
                    <li key={ua.id} className="mb-1">
                      <span className="font-semibold">{ua.achievement.icon} {ua.achievement.name}</span>: {ua.achievement.description} (Earned: {format(new Date(ua.earnedAt), 'MMM dd, yyyy')})
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No achievements earned yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader><CardTitle>Profile Settings</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input id="displayName" {...register('displayName')} />
                  {errors.displayName && <p className="text-red-500 text-sm mt-1">{errors.displayName.message}</p>}
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" {...register('bio')} rows={4} />
                  {errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>}
                </div>
                <div>
                  <Label htmlFor="avatar">Avatar URL</Label>
                  <Input id="avatar" {...register('avatar')} />
                  {errors.avatar && <p className="text-red-500 text-sm mt-1">{errors.avatar.message}</p>}
                </div>
                <Button type="submit" disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}