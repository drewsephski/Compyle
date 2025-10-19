'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DiscussionThreadType, DiscussionCommentType } from '@/lib/types';
import { useUser } from '@/hooks/useUser';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { CommentItem } from '@/components/CommentItem'; // Assuming CommentItem component exists
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCommentSchema } from '@/lib/validations';
import { useState } from 'react';
import Link from 'next/link';

type CreateCommentForm = Zod.infer<typeof createCommentSchema>;

export default function DiscussionThreadPage() {
  const params = useParams();
  const threadId = params.threadId as string;
  const { isSignedIn, prismaUser } = useUser();
  const queryClient = useQueryClient();
  const [replyingTo, setReplyingTo] = useState<string | null>(null); // State to manage which comment is being replied to

  const { data: thread, isLoading, error } = useQuery<DiscussionThreadType & {
    author: { id: string; displayName?: string | null; username?: string | null; avatar?: string | null };
    comments: (DiscussionCommentType & {
      author: { id: string; displayName?: string | null; username?: string | null; avatar?: string | null };
      likes: { userId: string }[];
      likesCount: number;
    })[];
  }>({
    queryKey: ['discussionThread', threadId],
    queryFn: async () => {
      const response = await fetch(`/api/discussions/${threadId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch discussion thread');
      }
      return response.json();
    },
    enabled: !!threadId,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCommentForm>({
    resolver: zodResolver(createCommentSchema),
  });

  const postCommentMutation = useMutation({
    mutationFn: async (data: CreateCommentForm) => {
      const response = await fetch(`/api/discussions/${threadId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to post comment');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussionThread', threadId] });
      reset();
      setReplyingTo(null); // Clear reply state
    },
    onError: (err) => {
      alert(err.message);
    },
  });

  const toggleLikeMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const response = await fetch(`/api/discussions/${threadId}/comments/${commentId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error('Failed to toggle like');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussionThread', threadId] });
    },
    onError: (err) => {
      alert(err.message);
    },
  });

  const handlePostComment = (data: CreateCommentForm) => {
    postCommentMutation.mutate({ ...data, parentId: replyingTo });
  };

  const handleLikeComment = (commentId: string) => {
    if (!isSignedIn) {
      alert('Please sign in to like comments.');
      return;
    }
    toggleLikeMutation.mutate(commentId);
  };

  const handleReply = (parentId: string) => {
    setReplyingTo(parentId);
    // Optionally scroll to comment form
  };

  // Helper to build nested comments
  const buildNestedComments = (comments: (DiscussionCommentType & {
    author: { id: string; displayName?: string | null; username?: string | null; avatar?: string | null };
    likes: { userId: string }[];
    likesCount: number;
  })[], parentId: string | null = null): (DiscussionCommentType & {
    author: { id: string; displayName?: string | null; username?: string | null; avatar?: string | null };
    likes: { userId: string }[];
    likesCount: number;
    replies: (DiscussionCommentType & {
      author: { id: string; displayName?: string | null; username?: string | null; avatar?: string | null };
      likes: { userId: string }[];
      likesCount: number;
      replies: (DiscussionCommentType & {
        author: { id: string; displayName?: string | null; username?: string | null; avatar?: string | null };
        likes: { userId: string }[];
        likesCount: number;
      })[];
    })[];
  })[] => {
    return comments
      .filter((comment) => comment.parentId === parentId)
      .map((comment) => ({
        ...comment,
        hasLiked: prismaUser ? comment.likes.some(like => like.userId === prismaUser.id) : false,
        replies: buildNestedComments(comments, comment.id),
      }));
  };

  const nestedComments = thread ? buildNestedComments(thread.comments) : [];

  if (isLoading) return <div className="text-center text-white py-8">Loading discussion...</div>;
  if (error) return <div className="text-red-500 text-center py-8">Error: {error.message}</div>;
  if (!thread) return <div className="text-center text-white py-8">Discussion not found.</div>;

  return (
    <div className="container mx-auto p-4 py-8 max-w-3xl">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-white mb-2">{thread.title}</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Avatar className="h-8 w-8">
              <AvatarImage src={thread.author.avatar || undefined} />
              <AvatarFallback>{thread.author.displayName?.charAt(0) || thread.author.username?.charAt(0)}</AvatarFallback>
            </Avatar>
            <span>by {thread.author.displayName || thread.author.username}</span>
            <span>- {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}</span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-white leading-relaxed">{thread.content}</p>
          {/* Display associated fighter, event, league if available */}
          {thread.fighter && <p className="text-sm text-muted-foreground mt-4">Fighter: {thread.fighter.name}</p>}
          {thread.event && <p className="text-sm text-muted-foreground">Event: {thread.event.name}</p>}
          {thread.league && <p className="text-sm text-muted-foreground">League: {thread.league.name}</p>}
        </CardContent>
      </Card>

      <h2 className="text-2xl font-bold text-white mb-4">Comments ({thread.comments.length})</h2>
      <div className="space-y-4 mb-8">
        {nestedComments.length > 0 ? (
          nestedComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onLike={handleLikeComment}
              onReply={handleReply}
              currentUserId={prismaUser?.id}
            />
          ))
        ) : (
          <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
        )}
      </div>

      {isSignedIn ? (
        <Card>
          <CardHeader>
            <CardTitle>{replyingTo ? `Replying to Comment` : 'Post a Comment'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handlePostComment)} className="space-y-4">
              <Textarea
                placeholder="Write your comment here..."
                rows={4}
                {...register('content')}
              />
              {errors.content && <p className="text-red-500 text-sm">{errors.content.message}</p>}
              <Button type="submit" disabled={postCommentMutation.isPending}>
                {postCommentMutation.isPending ? 'Posting...' : 'Post Comment'}
              </Button>
              {replyingTo && (
                <Button variant="outline" onClick={() => setReplyingTo(null)} className="ml-2">
                  Cancel Reply
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      ) : (
        <p className="text-center text-muted-foreground">
          <Link href="/sign-in" className="text-primary hover:underline">Sign in</Link> to post comments.
        </p>
      )}
    </div>
  );
}