import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { updateLineupSchema } from '@/lib/validations';
import { FighterPosition } from '@prisma/client';

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
      select: { id: true, userId: true, roster: true },
    });

    if (!team) {
      return new NextResponse('Team not found', { status: 404 });
    }

    if (team.userId !== user.id) {
      return new NextResponse('Forbidden: You do not own this team', { status: 403 });
    }

    const body = await req.json();
    const updates = updateLineupSchema.parse(body); // Array of { fighterId, position }

    // Validate position limits (e.g., max 5 MAIN fighters)
    const currentMainFighters = team.roster.filter(f => f.position === FighterPosition.MAIN).length;
    const incomingMainFighters = updates.filter(u => u.position === FighterPosition.MAIN).length;

    // This logic needs to be more robust, considering current state + changes
    // For simplicity, let's assume a max of 5 MAIN fighters.
    // A more complex check would involve:
    // 1. Counting current MAIN fighters
    // 2. Identifying fighters whose position is changing from BENCH to MAIN
    // 3. Ensuring total MAIN fighters after change doesn't exceed limit
    const potentialMainCount = currentMainFighters + incomingMainFighters - updates.filter(u => u.position === FighterPosition.BENCH && team.roster.find(f => f.fighterId === u.fighterId)?.position === FighterPosition.MAIN).length;
    if (potentialMainCount > 5) { // Example limit
        return new NextResponse('Cannot have more than 5 main fighters', { status: 400 });
    }


    const transaction = updates.map(update =>
      prisma.fantasyFighter.update({
        where: { id: team.roster.find(f => f.fighterId === update.fighterId)?.id },
        data: { position: update.position },
      })
    );

    await prisma.$transaction(transaction);

    return new NextResponse('Lineup updated successfully', { status: 200 });
  } catch (error) {
    console.error('[API_TEAMS_LINEUP_PATCH]', error);
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 });
    }
    return new NextResponse('Internal Error', { status: 500 });
  }
}