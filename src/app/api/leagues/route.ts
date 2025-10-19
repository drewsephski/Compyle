import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { CreateLeagueInput, LeagueStatus, LeagueRole, UserRole } from '@/lib/types';
import { createLeagueSchema } from '@/lib/validations';

export async function GET(req: Request) {
  const { userId: clerkUserId } = await auth();
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get('filter'); // 'my-leagues', 'public', 'all'

  try {
    let whereClause: any = {};
    if (filter === 'public') {
      // Logic to filter for public leagues (if a public flag exists in schema)
      // For now, assuming all leagues are "public" unless specified by membership
    } else if (filter === 'my-leagues' && clerkUserId) {
      const user = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
        select: { id: true },
      });
      if (user) {
        whereClause = {
          members: {
            some: {
              userId: user.id,
            },
          },
        };
      } else {
        return new NextResponse('User not found', { status: 404 });
      }
    }

    const leagues = await prisma.fantasyLeague.findMany({
      where: whereClause,
      include: {
        commissioner: {
          select: { displayName: true, username: true, avatar: true },
        },
        members: {
          select: { id: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(leagues.map(league => ({
      ...league,
      memberCount: league.members.length,
    })));
  } catch (error) {
    console.error('[API_LEAGUES_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body: CreateLeagueInput = await req.json();
    const validatedData = createLeagueSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true, role: true },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Only premium users or admins can create leagues (example logic)
    // if (user.subscription !== 'PREMIUM' && user.role !== 'ADMIN') {
    //   return new NextResponse('Forbidden: Only premium users can create leagues', { status: 403 });
    // }

    const newLeague = await prisma.fantasyLeague.create({
      data: {
        ...validatedData,
        commissionerId: user.id,
        members: {
          create: {
            userId: user.id,
            role: LeagueRole.COMMISSIONER,
          },
        },
      },
    });

    return NextResponse.json(newLeague, { status: 201 });
  } catch (error) {
    console.error('[API_LEAGUES_POST]', error);
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 });
    }
    return new NextResponse('Internal Error', { status: 500 });
  }
}