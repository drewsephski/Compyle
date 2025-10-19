import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
});

export async function GET() {
  const { userId } = auth();

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        favorites: true,
        leagues: true,
        achievements: true,
        preferences: true,
      },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    return NextResponse.json({
      ...user,
      favoritesCount: user.favorites.length,
      leaguesCount: user.leagues.length,
      achievementsCount: user.achievements.length,
    });
  } catch (error) {
    console.error('[API_USERS_PROFILE_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const { userId } = auth();

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await req.json();
    const validatedData = updateProfileSchema.parse(body);

    const updatedUser = await prisma.user.update({
      where: { clerkId: userId },
      data: {
        displayName: validatedData.displayName,
        bio: validatedData.bio,
        avatar: validatedData.avatar,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('[API_USERS_PROFILE_PATCH]', error);
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 });
    }
    return new NextResponse('Internal Error', { status: 500 });
  }
}