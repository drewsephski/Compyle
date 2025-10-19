import React from 'react';
import { FantasyFighterType } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Trash2, ArrowLeftRight } from 'lucide-react';
import { FighterPosition } from '@prisma/client';

interface RosterTableProps {
  roster: FantasyFighterType[];
  onRemoveFighter: (fighterId: string) => void;
  onTogglePosition: (fighterId: string, currentPosition: FighterPosition) => void;
  budgetUsed: number;
  totalBudget: number;
}

export function RosterTable({
  roster,
  onRemoveFighter,
  onTogglePosition,
  budgetUsed,
  totalBudget,
}: RosterTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Roster</CardTitle>
        <p className="text-sm text-muted-foreground">
          Budget Used: ${budgetUsed.toFixed(2)} / ${totalBudget.toFixed(2)} (Remaining: ${(totalBudget - budgetUsed).toFixed(2)})
        </p>
      </CardHeader>
      <CardContent>
        {roster.length === 0 ? (
          <p className="text-muted-foreground">Your roster is empty. Add some fighters!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr className="bg-gray-800">
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Fighter
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Position
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Cost
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Weekly Score
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-gray-700">
                {roster.map((fantasyFighter) => (
                  <tr key={fantasyFighter.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={fantasyFighter.fighter.octagonId ? `https://octagon-api.vercel.app/api/fighters/${fantasyFighter.fighter.octagonId}/image` : undefined} alt={fantasyFighter.fighter.name} />
                          <AvatarFallback>{fantasyFighter.fighter.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-foreground">{fantasyFighter.fighter.name}</div>
                          <div className="text-sm text-muted-foreground">{fantasyFighter.fighter.nickname}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {fantasyFighter.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      ${fantasyFighter.acquisitionCost.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {fantasyFighter.weeklyScore.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onTogglePosition(fantasyFighter.fighterId, fantasyFighter.position)}
                        className="mr-2"
                        title="Toggle Position"
                      >
                        <ArrowLeftRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onRemoveFighter(fantasyFighter.fighterId)}
                        title="Remove Fighter"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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