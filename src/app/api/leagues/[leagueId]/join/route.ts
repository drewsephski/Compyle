import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { LeagueRole, LeagueStatus } from '@prisma/client';

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

    const league = await prisma.fantasyLeague.findUnique({
      where: { id: leagueId },
      include: { members: true, teams: true },
    });

    if (!league) {
      return new NextResponse('League not found', { status: 404 });
    }

    if (league.status !== LeagueStatus.UPCOMING && league.status !== LeagueStatus.ACTIVE) {
      return new NextResponse('Cannot join a league that is not upcoming or active', { status: 400 });
    }

    if (league.members.length >= league.maxMembers) {
      return new NextResponse('League is full', { status: 400 });
    }

    const existingMember = league.members.find(m => m.userId === user.id);
    if (existingMember) {
      return new NextResponse('Already a member of this league', { status: 409 });
    }

    const newMember = await prisma.leagueMember.create({
      data: {
        userId: user.id,
        leagueId: leagueId,
        role: LeagueRole.MEMBER,
      },
    });

    const newTeam = await prisma.fantasyTeam.create({
      data: {
        userId: user.id,
        leagueId: leagueId,
        name: `${user.id}'s Team`, // Default team name, user can change later
      },
    });

    return NextResponse.json({ member: newMember, team: newTeam }, { status: 201 });
  } catch (error) {
    console.error('[API_LEAGUES_JOIN_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}