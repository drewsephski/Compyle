import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { addFighterToRosterSchema } from '@/lib/validations';

export async function POST(
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
      include: { roster: true },
    });

    if (!team) {
      return new NextResponse('Team not found', { status: 404 });
    }

    if (team.userId !== user.id) {
      return new NextResponse('Forbidden: You do not own this team', { status: 403 });
    }

    const body = await req.json();
    const { fighterId, position, acquisitionCost } = addFighterToRosterSchema.parse(body);

    if (team.budgetUsed + acquisitionCost > team.budget) {
      return new NextResponse('Insufficient budget', { status: 400 });
    }

    const existingFighter = team.roster.find(f => f.fighterId === fighterId);
    if (existingFighter) {
      return new NextResponse('Fighter already on roster', { status: 409 });
    }

    // Check roster limits (e.g., max 5 active fighters) - this would need league rules
    // For now, simple limit example:
    if (team.roster.length >= 10) { // Example hardcoded limit
        return new NextResponse('Roster is full', { status: 400 });
    }

    const newFantasyFighter = await prisma.fantasyFighter.create({
      data: {
        teamId: team.id,
        fighterId,
        position,
        acquisitionCost,
        currentValue: acquisitionCost, // Initial current value
      },
      include: { fighter: true },
    });

    await prisma.fantasyTeam.update({
      where: { id: team.id },
      data: {
        budgetUsed: {
          increment: acquisitionCost,
        },
      },
    });

    return NextResponse.json(newFantasyFighter, { status: 201 });
  } catch (error) {
    console.error('[API_TEAMS_ROSTER_POST]', error);
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 });
    }
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(
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
      select: { id: true, userId: true, budgetUsed: true, roster: true },
    });

    if (!team) {
      return new NextResponse('Team not found', { status: 404 });
    }

    if (team.userId !== user.id) {
      return new NextResponse('Forbidden: You do not own this team', { status: 403 });
    }

    const body = await req.json();
    const { fighterId } = z.object({ fighterId: z.string() }).parse(body);

    const fighterToRemove = team.roster.find(f => f.fighterId === fighterId);

    if (!fighterToRemove) {
      return new NextResponse('Fighter not found on roster', { status: 404 });
    }

    await prisma.fantasyFighter.delete({
      where: { id: fighterToRemove.id },
    });

    await prisma.fantasyTeam.update({
      where: { id: team.id },
      data: {
        budgetUsed: {
          decrement: fighterToRemove.acquisitionCost,
        },
      },
    });

    return new NextResponse('Fighter removed from roster', { status: 200 });
  } catch (error) {
    console.error('[API_TEAMS_ROSTER_DELETE]', error);
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 });
    }
    return new NextResponse('Internal Error', { status: 500 });
  }
}