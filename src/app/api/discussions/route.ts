import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { createDiscussionSchema } from '@/lib/validations';
import { DiscussionCategory } from '@prisma/client';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') as DiscussionCategory | null;
  const fighterId = searchParams.get('fighterId');
  const eventId = searchParams.get('eventId');
  const leagueId = searchParams.get('leagueId');

  try {
    const whereClause: any = {};
    if (category) whereClause.category = category;
    if (fighterId) whereClause.fighterId = fighterId;
    if (eventId) whereClause.eventId = eventId;
    if (leagueId) whereClause.leagueId = leagueId;

    const discussions = await prisma.discussionThread.findMany({
      where: whereClause,
      include: {
        author: {
          select: { displayName: true, username: true, avatar: true },
        },
        _count: {
          select: { comments: true },
        },
      },
      orderBy: {
        isPinned: 'desc',
        createdAt: 'desc',
      },
    });

    return NextResponse.json(discussions.map(thread => ({
      ...thread,
      commentCount: thread._count.comments,
    })));
  } catch (error) {
    console.error('[API_DISCUSSIONS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await req.json();
    const validatedData = createDiscussionSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Ensure category is a valid DiscussionCategory type if present
    const data: any = {
      ...validatedData,
      authorId: user.id,
    };
    if (data.category && !Object.values(DiscussionCategory).includes(data.category)) {
      return new NextResponse('Invalid discussion category', { status: 400 });
    }

    const newThread = await prisma.discussionThread.create({
      data: data,
    });

    return NextResponse.json(newThread, { status: 201 });
  } catch (error) {
    console.error('[API_DISCUSSIONS_POST]', error);
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 });
    }
    return new NextResponse('Internal Error', { status: 500 });
  }
}