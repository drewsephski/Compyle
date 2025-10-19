import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateFightScore } from '@/lib/scoring';
import { z } from 'zod';
import { Fight } from '@prisma/client';

const calculateScoringSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  // Optionally include fight results directly if not fetched from DB
  // fightResults: z.array(z.object({
  //   fightId: z.string(),
  //   winnerId: z.string().optional(),
  //   method: z.string().optional(),
  //   round: z.number().int().optional(),
  // })),
});

export async function POST(req: Request) {
  // This endpoint should ideally be protected for admin use or triggered by a cron job
  // For now, no auth check, but it should be added.

  try {
    const body = await req.json();
    const { eventId } = calculateScoringSchema.parse(body);

    // Fetch all fights for the given event
    const fightsInEvent = await prisma.fight.findMany({
      where: { eventId: eventId },
      include: {
        fighter1: true,
        fighter2: true,
      },
    });

    if (fightsInEvent.length === 0) {
      return new NextResponse('No fights found for this event', { status: 404 });
    }

    // Fetch all active fantasy leagues to apply their rules
    const activeLeagues = await prisma.fantasyLeague.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, rules: true },
    });

    const fightScoresToCreate = [];
    const teamUpdates = [];

    for (const fight of fightsInEvent) {
      // Calculate scores for each fighter in the fight based on potential league rules
      // This is a simplified example; in reality, rules would be per league.
      // For now, using a generic scoring function from lib/scoring.ts
      const scoreFighter1 = calculateFightScore(fight, fight.fighter1Id);
      const scoreFighter2 = calculateFightScore(fight, fight.fighter2Id);

      fightScoresToCreate.push(
        {
          fighterId: fight.fighter1Id,
          eventId: eventId,
          baseScore: scoreFighter1.baseScore,
          bonuses: scoreFighter1.bonuses,
          penalties: scoreFighter1.penalties,
          totalScore: scoreFighter1.totalScore,
        },
        {
          fighterId: fight.fighter2Id,
          eventId: eventId,
          baseScore: scoreFighter2.baseScore,
          bonuses: scoreFighter2.bonuses,
          penalties: scoreFighter2.penalties,
          totalScore: scoreFighter2.totalScore,
        }
      );

      // Example: Update fantasy team scores (this logic would be more complex)
      // For each league, iterate through teams and update scores based on their roster
      for (const league of activeLeagues) {
        // Find teams in this league that have these fighters
        const teams = await prisma.fantasyTeam.findMany({
          where: {
            leagueId: league.id,
            roster: {
              some: {
                fighterId: {
                  in: [fight.fighter1Id, fight.fighter2Id],
                },
              },
            },
          },
          include: {
            roster: true,
          },
        });

        for (const team of teams) {
          let teamScoreChange = 0;
          if (team.roster.some(r => r.fighterId === fight.fighter1Id)) {
            teamScoreChange += scoreFighter1.totalScore;
          }
          if (team.roster.some(r => r.fighterId === fight.fighter2Id)) {
            teamScoreChange += scoreFighter2.totalScore;
          }

          teamUpdates.push(
            prisma.fantasyTeam.update({
              where: { id: team.id },
              data: {
                currentScore: {
                  increment: teamScoreChange,
                },
              },
            })
          );
        }
      }
    }

    await prisma.$transaction([
      prisma.fightScore.createMany({
        data: fightScoresToCreate,
      }),
      ...teamUpdates,
    ]);

    return NextResponse.json({ message: 'Fight scores calculated and applied' }, { status: 200 });
  } catch (error) {
    console.error('[API_SCORING_CALCULATE_POST]', error);
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 });
    }
    return new NextResponse('Internal Error', { status: 500 });
  }
}