'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createLeagueSchema } from '@/lib/validations';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useMutation } from '@tanstack/react-query';
import { useUser } from '@/hooks/useUser';
import { FantasyLeagueType } from '@/lib/types';

type CreateLeagueForm = Zod.infer<typeof createLeagueSchema>;

export default function CreateLeaguePage() {
  const router = useRouter();
  const { isSignedIn, prismaUser } = useUser();
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreateLeagueForm>({
    resolver: zodResolver(createLeagueSchema),
  });

  const createLeagueMutation = useMutation({
    mutationFn: async (data: CreateLeagueForm) => {
      const response = await fetch('/api/leagues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create league');
      }
      return response.json();
    },
    onSuccess: (data: FantasyLeagueType) => {
      router.push(`/leagues/${data.id}`);
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const onSubmit = (data: CreateLeagueForm) => {
    createLeagueMutation.mutate(data);
  };

  if (!isSignedIn) {
    return (
      <div className="container mx-auto p-4 text-center text-white">
        <p>You need to be signed in to create a league.</p>
        <Link href="/sign-in">
          <Button className="mt-4">Sign In</Button>
        </Link>
      </div>
    );
  }

  // Example: Check for premium subscription (if implemented)
  // if (prismaUser && prismaUser.subscription !== 'PREMIUM') {
  //   return (
  //     <div className="container mx-auto p-4 text-center text-white">
  //       <p>Premium subscription required to create a league.</p>
  //       <Link href="/upgrade">
  //         <Button className="mt-4">Upgrade to Premium</Button>
  //       </Link>
  //     </div>
  //   );
  // }

  const watchedFields = watch();

  return (
    <div className="container mx-auto p-4 py-8 max-w-2xl">
      <h1 className="text-4xl font-bold text-white mb-8 text-center">Create New League</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">League Name</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register('description')} rows={4} />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
            </div>
            <div>
              <Label htmlFor="maxMembers">Maximum Members</Label>
              <Input id="maxMembers" type="number" {...register('maxMembers', { valueAsNumber: true })} />
              {errors.maxMembers && <p className="text-red-500 text-sm mt-1">{errors.maxMembers.message}</p>}
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" type="datetime-local" {...register('startDate')} />
                {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>}
              </div>
              <div className="flex-1">
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" type="datetime-local" {...register('endDate')} />
                {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate.message}</p>}
              </div>
            </div>
            <Button type="button" onClick={() => setStep(2)}>Next: Rules</Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">League Rules</h2>
            <div>
              <Label htmlFor="entryFee">Entry Fee ($)</Label>
              <Input id="entryFee" type="number" step="0.01" {...register('entryFee', { valueAsNumber: true })} />
              {errors.entryFee && <p className="text-red-500 text-sm mt-1">{errors.entryFee.message}</p>}
            </div>
            <div>
              <Label htmlFor="prizePool">Prize Pool ($)</Label>
              <Input id="prizePool" type="number" step="0.01" {...register('prizePool', { valueAsNumber: true })} />
              {errors.prizePool && <p className="text-red-500 text-sm mt-1">{errors.prizePool.message}</p>}
            </div>
            {/* More rule settings can go here */}
            <Button type="button" variant="outline" onClick={() => setStep(1)} className="mr-4">Previous</Button>
            <Button type="submit" disabled={createLeagueMutation.isPending}>
              {createLeagueMutation.isPending ? 'Creating...' : 'Create League'}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}