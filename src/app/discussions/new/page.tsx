'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createDiscussionSchema } from '@/lib/validations';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useMutation } from '@tanstack/react-query';
import { useUser } from '@/hooks/useUser';
import { DiscussionThreadType, DiscussionCategory } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'; // Assuming this Select component exists

type CreateDiscussionForm = Zod.infer<typeof createDiscussionSchema>;

export default function NewDiscussionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialLeagueId = searchParams.get('leagueId') || '';
  const { isSignedIn } = useUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateDiscussionForm>({
    resolver: zodResolver(createDiscussionSchema),
    defaultValues: {
      leagueId: initialLeagueId,
      category: DiscussionCategory.GENERAL, // Default category
    },
  });

  const createDiscussionMutation = useMutation({
    mutationFn: async (data: CreateDiscussionForm) => {
      const response = await fetch('/api/discussions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create discussion');
      }
      return response.json();
    },
    onSuccess: (data: DiscussionThreadType) => {
      router.push(`/discussions/${data.id}`);
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const onSubmit = (data: CreateDiscussionForm) => {
    createDiscussionMutation.mutate(data);
  };

  if (!isSignedIn) {
    return (
      <div className="container mx-auto p-4 text-center text-white">
        <p>You need to be signed in to create a discussion.</p>
        <Link href="/sign-in">
          <Button className="mt-4">Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 py-8 max-w-2xl">
      <h1 className="text-4xl font-bold text-white mb-8 text-center">Start New Discussion</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" {...register('title')} />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
        </div>
        <div>
          <Label htmlFor="content">Content</Label>
          <Textarea id="content" {...register('content')} rows={8} />
          {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select onValueChange={(value) => setValue('category', value as DiscussionCategory)} defaultValue={watch('category')}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(DiscussionCategory).map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0) + category.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
        </div>
        {initialLeagueId && (
          <div>
            <Label htmlFor="leagueId">Associated League ID</Label>
            <Input id="leagueId" {...register('leagueId')} disabled className="bg-gray-700 cursor-not-allowed" />
          </div>
        )}
        {/* Optional fields for fighterId, eventId */}
        <Button type="submit" disabled={createDiscussionMutation.isPending}>
          {createDiscussionMutation.isPending ? 'Posting...' : 'Post Discussion'}
        </Button>
      </form>
    </div>
  );
}