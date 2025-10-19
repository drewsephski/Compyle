import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { FantasyLeagueType } from '@/lib/types';
import { format } from 'date-fns';

interface LeagueCardProps {
  league: FantasyLeagueType & {
    memberCount: number;
    commissioner: { displayName?: string | null; username?: string | null };
  };
}

export function LeagueCard({ league }: LeagueCardProps) {
  return (
    <Link href={`/leagues/${league.id}`}>
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle>{league.name}</CardTitle>
            <Badge variant="info">{league.status}</Badge>
          </div>
          <CardDescription>
            {league.description || 'No description provided.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Members: {league.memberCount}/{league.maxMembers}
          </p>
          <p className="text-sm text-muted-foreground">
            Commissioner: {league.commissioner?.displayName || league.commissioner?.username || 'N/A'}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Starts: {format(new Date(league.startDate), 'MMM dd, yyyy')}
          </p>
          <p className="text-xs text-muted-foreground">
            Ends: {format(new Date(league.endDate), 'MMM dd, yyyy')}
          </p>
        </CardContent>
        <CardFooter className="justify-end">
          <Badge variant="secondary">Entry Fee: ${league.entryFee}</Badge>
        </CardFooter>
      </Card>
    </Link>
  );
}