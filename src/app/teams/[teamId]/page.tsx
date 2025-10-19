'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTeam } from '@/hooks/useTeam';
import { useUser } from '@/hooks/useUser';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RosterTable } from '@/components/RosterTable'; // Assuming RosterTable component exists
import { FighterSelector } from '@/components/FighterSelector'; // Assuming FighterSelector component exists
import Link from 'next/link';
import { FighterPosition } from '@prisma/client';

export default function TeamDetailPage() {
  const params = useParams();
  const teamId = params.teamId as string;
  const { isSignedIn, prismaUser } = useUser();
  const { team, isLoading, error, addFighter, removeFighter, updateLineup } = useTeam(teamId);
  const [activeTab, setActiveTab] = useState('roster');
  const [isFighterSelectorOpen, setIsFighterSelectorOpen] = useState(false);

  const handleAddFighter = (fighterId: string, acquisitionCost: number) => {
    addFighter({ fighterId, acquisitionCost, position: FighterPosition.BENCH });
  };

  const handleRemoveFighter = (fighterId: string) => {
    removeFighter(fighterId);
  };

  const handleTogglePosition = (fighterId: string, currentPosition: FighterPosition) => {
    const newPosition = currentPosition === FighterPosition.MAIN ? FighterPosition.BENCH : FighterPosition.MAIN;
    updateLineup([{ fighterId, position: newPosition }]);
  };

  if (isLoading) return <div className="text-center text-white py-8">Loading team details...</div>;
  if (error) return <div className="text-red-500 text-center py-8">Error: {error.message}</div>;
  if (!team) return <div className="text-center text-white py-8">Team not found.</div>;

  if (!isSignedIn || prismaUser?.id !== team.userId) {
    return <div className="text-center text-red-500 py-8">You do not have permission to view this team.</div>;
  }

  const rosterFighterIds = team.roster.map(f => f.fighterId);

  return (
    <div className="container mx-auto p-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-white">{team.name}</h1>
        <Link href={`/leagues/${team.league.id}`}>
          <Button variant="outline">View League: {team.league.name}</Button>
        </Link>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
        <span>Owner: {team.user.displayName || team.user.username}</span>
        <span>Total Score: {team.totalScore.toFixed(2)}</span>
        <span>Weekly Score: {team.weeklyScore.toFixed(2)}</span>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="roster">Roster</TabsTrigger>
          <TabsTrigger value="lineup">Lineup</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="roster">
          <RosterTable
            roster={team.roster}
            onRemoveFighter={handleRemoveFighter}
            onTogglePosition={handleTogglePosition}
            budgetUsed={team.budgetUsed}
            totalBudget={team.budget}
          />
          <Button onClick={() => setIsFighterSelectorOpen(true)} className="mt-4">
            Add Fighter
          </Button>
        </TabsContent>

        <TabsContent value="lineup">
          <Card>
            <CardHeader><CardTitle>Set Weekly Lineup</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Drag and drop fighters between Main and Bench, or use the toggle buttons in the roster.</p>
              {/* Further UI for drag and drop lineup management */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader><CardTitle>Team Performance</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Detailed score breakdown by week and fighter contributions will appear here.</p>
              {/* Chart or table for performance history */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader><CardTitle>Transaction History</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Recent fighter adds, drops, and trades will be listed here.</p>
              {/* List of transactions */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <FighterSelector
        isOpen={isFighterSelectorOpen}
        onClose={() => setIsFighterSelectorOpen(false)}
        onSelectFighter={handleAddFighter}
        teamBudgetRemaining={team.budget - team.budgetUsed}
        rosterFighterIds={rosterFighterIds}
      />
    </div>
  );
}