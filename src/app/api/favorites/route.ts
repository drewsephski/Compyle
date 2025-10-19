import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const favoriteSchema = z.object({
  fighterId: z.string().min(1),
});

export async function GET() {
  const { userId } = auth();

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return new NextResponse('User not found in DB', { status: 404 });
    }

    const favorites = await prisma.userFavorite.findMany({
      where: { userId: user.id },
      include: {
        fighter: true, // Include fighter details
      },
    });

    return NextResponse.json(favorites);
  } catch (error) {
    console.error('[API_FAVORITES_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  const { userId: clerkUserId } = auth();

  if (!clerkUserId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await req.json();
    const { fighterId } = favoriteSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true },
    });

    if (!user) {
      return new NextResponse('User not found in DB', { status: 404 });
    }

    // Check if fighter exists
    const fighter = await prisma.fighter.findUnique({
      where: { id: fighterId },
    });

    if (!fighter) {
      return new NextResponse('Fighter not found', { status: 404 });
    }

    const existingFavorite = await prisma.userFavorite.findUnique({
      where: {
        userId_fighterId: {
          userId: user.id,
          fighterId: fighterId,
        },
      },
    });

    if (existingFavorite) {
      return new NextResponse('Fighter already favorited', { status: 409 });
    }

    const newFavorite = await prisma.userFavorite.create({
      data: {
        userId: user.id,
        fighterId: fighterId,
      },
      include: {
        fighter: true,
      },
    });

    return NextResponse.json(newFavorite);
  } catch (error) {
    console.error('[API_FAVORITES_POST]', error);
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 });
    }
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { userId: clerkUserId } = auth();

  if (!clerkUserId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await req.json();
    const { fighterId } = favoriteSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true },
    });

    if (!user) {
      return new NextResponse('User not found in DB', { status: 404 });
    }

    const deletedFavorite = await prisma.userFavorite.delete({
      where: {
        userId_fighterId: {
          userId: user.id,
          fighterId: fighterId,
        },
      },
      include: {
        fighter: true,
      },
    });

    return NextResponse.json(deletedFavorite);
  } catch (error) {
    console.error('[API_FAVORITES_DELETE]', error);
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 });
    }
    // If favorite not found, it's still a success from the client's perspective
    if (error.code === 'P2025') { // Prisma error code for record not found
      return new NextResponse('Favorite not found, but operation considered successful', { status: 200 });
    }
    return new NextResponse('Internal Error', { status: 500 });
  }
}