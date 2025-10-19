import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { LeagueRole } from '@prisma/client';
import { updateLeagueSchema } from '@/lib/validations';

export async function GET(
  req: Request,
  { params }: { params: { leagueId: string } }
) {
  const { userId: clerkUserId } = await auth();
  const { leagueId } = params;

  try {
    const league = await prisma.fantasyLeague.findUnique({
      where: { id: leagueId },
      include: {
        commissioner: {
          select: { displayName: true, username: true, avatar: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, displayName: true, username: true, avatar: true },
            },
          },
        },
        teams: {
          include: {
            user: {
              select: { id: true, displayName: true, username: true, avatar: true },
            },
          },
        },
        discussions: {
          select: { id: true, title: true, author: { select: { displayName: true } } },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!league) {
      return new NextResponse('League not found', { status: 404 });
    }

    let isMember = false;
    let isCommissioner = false;

    if (clerkUserId) {
      const user = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
      if (user) {
        const member = league.members.find(m => m.userId === user.id);
        if (member) {
          isMember = true;
          isCommissioner = member.role === LeagueRole.COMMISSIONER;
        }
      }
    }

    return NextResponse.json({
      ...league,
      isMember,
      isCommissioner,
      memberCount: league.members.length,
      teamCount: league.teams.length,
    });
  } catch (error) {
    console.error('[API_LEAGUES_LEAGUEID_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { leagueId: string } }
) {
  const { userId: clerkUserId } = await auth();
  const { leagueId } = params;

  if (!clerkUserId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
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

    if (!leagueMember || leagueMember.role !== LeagueRole.COMMISSIONER) {
      return new NextResponse('Forbidden: Only the commissioner can update league settings', { status: 403 });
    }

    const body = await req.json();
    const validatedData = updateLeagueSchema.parse(body);

    const updatedLeague = await prisma.fantasyLeague.update({
      where: { id: leagueId },
      data: validatedData,
    });

    return NextResponse.json(updatedLeague);
  } catch (error) {
    console.error('[API_LEAGUES_LEAGUEID_PATCH]', error);
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 });
    }
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { leagueId: string } }
) {
  const { userId: clerkUserId } = await auth();
  const { leagueId } = params;

  if (!clerkUserId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const league = await prisma.fantasyLeague.findUnique({
      where: { id: leagueId },
      include: { teams: true },
    });

    if (!league) {
      return new NextResponse('League not found', { status: 404 });
    }

    if (league.commissionerId !== user.id) {
      return new NextResponse('Forbidden: Only the commissioner can delete the league', { status: 403 });
    }

    if (league.teams.length > 0) {
      return new NextResponse('Cannot delete league with active teams', { status: 400 });
    }

    await prisma.fantasyLeague.delete({
      where: { id: leagueId },
    });

    return new NextResponse('League deleted successfully', { status: 200 });
  } catch (error) {
    console.error('[API_LEAGUES_LEAGUEID_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}