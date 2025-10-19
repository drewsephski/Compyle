import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { LeagueRole } from '@prisma/client';

export async function POST(
  req: Request,
  { params }: { params: { leagueId: string } }
) {
  const { userId: clerkUserId } = await auth();
  const { leagueId } = params;

  if (!clerkUserId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const leagueMember = await prisma.leagueMember.findUnique({
      where: {
        userId_leagueId: {
          userId: user.id,
          leagueId: leagueId,
        },
      },
    });

    if (!leagueMember) {
      return new NextResponse('Not a member of this league', { status: 404 });
    }

    if (leagueMember.role === LeagueRole.COMMISSIONER) {
      return new NextResponse('Commissioners cannot leave their own league', { status: 403 });
    }

    // Delete LeagueMember record
    await prisma.leagueMember.delete({
      where: { id: leagueMember.id },
    });

    // Optionally delete or archive the FantasyTeam associated with this user in this league
    await prisma.fantasyTeam.deleteMany({
      where: {
        userId: user.id,
        leagueId: leagueId,
      },
    });

    return new NextResponse('Successfully left league', { status: 200 });
  } catch (error) {
    console.error('[API_LEAGUES_LEAVE_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}