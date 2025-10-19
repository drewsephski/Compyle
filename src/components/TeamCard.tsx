import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { FantasyTeamType, FantasyFighterType } from '@/lib/types';

interface TeamCardProps {
  team: FantasyTeamType & {
    league: { name: string };
    roster: FantasyFighterType[];
    user: { displayName?: string | null; username?: string | null };
  };
}

export function TeamCard({ team }: TeamCardProps) {
  return (
    <Link href={`/teams/${team.id}`}>
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader>
          <CardTitle>{team.name}</CardTitle>
          <CardDescription>League: {team.league.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Owner: {team.user.displayName || team.user.username}</p>
          <p className="text-lg font-bold text-primary">Score: {team.totalScore.toFixed(2)}</p>
          <div className="flex items-center -space-x-2 mt-3">
            {team.roster.slice(0, 3).map((fighter) => (
              <Avatar key={fighter.id} className="border-2 border-background">
                <AvatarImage src={fighter.fighter.octagonId ? `https://octagon-api.vercel.app/api/fighters/${fighter.fighter.octagonId}/image` : undefined} alt={fighter.fighter.name} />
                <AvatarFallback>{fighter.fighter.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
            {team.roster.length > 3 && (
              <Avatar className="border-2 border-background">
                <AvatarFallback>+{team.roster.length - 3}</AvatarFallback>
              </Avatar>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}