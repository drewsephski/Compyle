import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateTeamSchema = z.object({
  name: z.string().min(1).max(50).optional(),
});

export async function GET(
  req: Request,
  { params }: { params: { teamId: string } }
) {
  const { userId: clerkUserId } = await auth();
  const { teamId } = params;

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

    const team = await prisma.fantasyTeam.findUnique({
      where: { id: teamId },
      include: {
        user: {
          select: { displayName: true, username: true, avatar: true },
        },
        league: {
          select: { id: true, name: true },
        },
        roster: {
          include: { fighter: true },
        },
        teamScores: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!team) {
      return new NextResponse('Team not found', { status: 404 });
    }

    if (team.userId !== user.id) {
      return new NextResponse('Forbidden: You do not own this team', { status: 403 });
    }

    const budgetRemaining = team.budget - team.budgetUsed;

    return NextResponse.json({
      ...team,
      budgetRemaining,
    });
  } catch (error) {
    console.error('[API_TEAMS_TEAMID_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { teamId: string } }
) {
  const { userId: clerkUserId } = await auth();
  const { teamId } = params;

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

    const team = await prisma.fantasyTeam.findUnique({
      where: { id: teamId },
      select: { userId: true },
    });

    if (!team) {
      return new NextResponse('Team not found', { status: 404 });
    }

    if (team.userId !== user.id) {
      return new NextResponse('Forbidden: You do not own this team', { status: 403 });
    }

    const body = await req.json();
    const validatedData = updateTeamSchema.parse(body);

    const updatedTeam = await prisma.fantasyTeam.update({
      where: { id: teamId },
      data: validatedData,
    });

    return NextResponse.json(updatedTeam);
  } catch (error) {
    console.error('[API_TEAMS_TEAMID_PATCH]', error);
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 });
    }
    return new NextResponse('Internal Error', { status: 500 });
  }
}