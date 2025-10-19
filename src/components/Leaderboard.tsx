import { LeagueStanding } from '@/lib/types'; // Assuming LeagueStanding is defined
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface LeaderboardProps {
  standings: LeagueStanding[];
  highlightTeamId?: string;
}

export function Leaderboard({ standings, highlightTeamId }: LeaderboardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>League Standings</CardTitle>
      </CardHeader>
      <CardContent>
        {standings.length === 0 ? (
          <p className="text-muted-foreground">No standings available yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr className="bg-gray-800">
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Rank
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Team Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Owner
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Total Score
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Weekly Score
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-gray-700">
                {standings.map((standing) => (
                  <tr key={standing.teamId} className={standing.teamId === highlightTeamId ? 'bg-primary/10' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                      {standing.rank}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {standing.teamName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {standing.ownerDisplayName || standing.ownerUsername}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {standing.totalScore.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {standing.weeklyScore.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}