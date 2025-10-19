import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DiscussionThreadType } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Pin } from 'lucide-react';
import { Badge } from './ui/badge';

interface DiscussionCardProps {
  thread: DiscussionThreadType & {
    author: { displayName?: string | null; username?: string | null; avatar?: string | null };
    commentCount: number;
  };
}

export function DiscussionCard({ thread }: DiscussionCardProps) {
  return (
    <Link href={`/discussions/${thread.id}`}>
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              {thread.isPinned && <Pin className="h-5 w-5 text-primary" />}
              {thread.title}
            </CardTitle>
            <Badge variant="secondary">{thread.category}</Badge>
          </div>
          <CardDescription className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={thread.author.avatar || undefined} />
              <AvatarFallback>{thread.author.displayName?.charAt(0) || thread.author.username?.charAt(0)}</AvatarFallback>
            </Avatar>
            <span>{thread.author.displayName || thread.author.username}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {thread.content.substring(0, 150)}...
          </p>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span>{thread.commentCount}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}