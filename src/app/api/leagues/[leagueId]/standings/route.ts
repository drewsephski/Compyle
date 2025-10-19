import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { leagueId: string } }
) {
  const { leagueId } = params;
  const { searchParams } = new URL(req.url);
  const week = searchParams.get('week'); // Optional: 'current' or specific week ID

  try {
    const teams = await prisma.fantasyTeam.findMany({
      where: { leagueId: leagueId },
      include: {
        user: {
          select: { displayName: true, username: true, avatar: true },
        },
        teamScores: week ? {
          where: { weekId: week },
          orderBy: { createdAt: 'desc' },
          take: 1,
        } : {
          orderBy: { createdAt: 'desc' }, // Get latest score for overall standings
          take: 1,
        },
      },
      orderBy: {
        totalScore: 'desc',
      },
    });

    if (!teams) {
      return new NextResponse('League not found or no teams', { status: 404 });
    }

    // Calculate ranks
    const standings = teams.map((team, index) => ({
      teamId: team.id,
      teamName: team.name,
      ownerDisplayName: team.user.displayName,
      ownerUsername: team.user.username,
      totalScore: team.totalScore, // Assuming totalScore is updated on team directly
      weeklyScore: team.teamScores[0]?.totalScore || 0, // Get latest weekly score if available
      rank: index + 1,
    }));

    return NextResponse.json(standings);
  } catch (error) {
    console.error('[API_LEAGUES_STANDINGS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}