import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DiscussionCommentType } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageSquare } from 'lucide-react';
import { Button } from './ui/button'; // Assuming Button component exists

interface CommentItemProps {
  comment: DiscussionCommentType & {
    author: { id: string; displayName?: string | null; username?: string | null; avatar?: string | null };
    likesCount: number;
    hasLiked?: boolean;
    replies?: (DiscussionCommentType & {
      author: { id: string; displayName?: string | null; username?: string | null; avatar?: string | null };
      likesCount: number;
      hasLiked?: boolean;
    })[];
  };
  onLike?: (commentId: string) => void;
  onReply?: (parentId: string) => void;
  onEdit?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
  currentUserId?: string;
  level?: number;
}

export function CommentItem({
  comment,
  onLike,
  onReply,
  onEdit,
  onDelete,
  currentUserId,
  level = 0,
}: CommentItemProps) {
  const isAuthor = currentUserId === comment.author.id;

  const handleLike = () => {
    if (onLike) onLike(comment.id);
  };

  const handleReply = () => {
    if (onReply) onReply(comment.id);
  };

  // Placeholder for actual edit/delete logic
  const handleEdit = () => {
    if (onEdit) onEdit(comment.id, comment.content);
  };

  const handleDelete = () => {
    if (onDelete) onDelete(comment.id);
  };

  return (
    <div className={`flex gap-3 py-4 ${level > 0 ? 'ml-6 border-l pl-3 border-gray-700' : ''}`}>
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.author.avatar || undefined} />
        <AvatarFallback>{comment.author.displayName?.charAt(0) || comment.author.username?.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">
            {comment.author.displayName || comment.author.username}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{comment.content}</p>
        <div className="flex items-center gap-3 mt-2">
          <Button variant="ghost" size="sm" onClick={handleLike} className="flex items-center gap-1 text-muted-foreground hover:text-primary">
            <Heart className={comment.hasLiked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'} size={16} />
            {comment.likesCount > 0 && <span>{comment.likesCount}</span>}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleReply} className="flex items-center gap-1 text-muted-foreground hover:text-primary">
            <MessageSquare size={16} /> Reply
          </Button>
          {isAuthor && (
            <>
              <Button variant="ghost" size="sm" onClick={handleEdit} className="text-muted-foreground hover:text-primary">
                Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-500 hover:text-red-400">
                Delete
              </Button>
            </>
          )}
        </div>
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onLike={onLike}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                currentUserId={currentUserId}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}