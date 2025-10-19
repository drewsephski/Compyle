import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        displayName: true,
        username: true,
        avatar: true,
        bio: true,
        joinDate: true,
        achievements: {
          include: {
            achievement: true,
          },
        },
        leagues: {
          select: {
            leagueId: true,
          },
        },
        teams: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    return NextResponse.json({
      ...user,
      totalLeagues: user.leagues.length,
      totalTeams: user.teams.length,
      // Add logic for best ranking if applicable
    });
  } catch (error) {
    console.error('[API_USERS_USERID_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}