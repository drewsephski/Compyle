import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { createDiscussionSchema } from '@/lib/validations'; // Reusing for update validation

export async function GET(
  req: Request,
  { params }: { params: { threadId: string } }
) {
  const { threadId } = params;

  try {
    const thread = await prisma.discussionThread.findUnique({
      where: { id: threadId },
      include: {
        author: {
          select: { id: true, displayName: true, username: true, avatar: true },
        },
        fighter: { select: { id: true, name: true } },
        event: { select: { id: true, name: true } },
        league: { select: { id: true, name: true } },
        comments: {
          include: {
            author: { select: { id: true, displayName: true, username: true, avatar: true } },
            likes: { select: { userId: true } },
            _count: { select: { replies: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!thread) {
      return new NextResponse('Discussion thread not found', { status: 404 });
    }

    return NextResponse.json({
      ...thread,
      comments: thread.comments.map(comment => ({
        ...comment,
        likesCount: comment.likes.length,
        hasLiked: false, // Will be set by client-side if needed
      })),
    });
  } catch (error) {
    console.error('[API_DISCUSSIONS_THREADID_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { threadId: string } }
) {
  const { userId: clerkUserId } = await auth();
  const { threadId } = params;

  if (!clerkUserId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const thread = await prisma.discussionThread.findUnique({
      where: { id: threadId },
      select: { authorId: true },
    });

    if (!thread) {
      return new NextResponse('Discussion thread not found', { status: 404 });
    }

    // Only author or admin can update
    if (thread.authorId !== user.id && user.role !== 'ADMIN') {
      return new NextResponse('Forbidden: Only the author or admin can update this thread', { status: 403 });
    }

    const body = await req.json();
    const validatedData = createDiscussionSchema.partial().parse(body); // Allow partial updates

    const dataToUpdate: { [key: string]: any } = {};
    for (const key in validatedData) {
      if (validatedData[key as keyof typeof validatedData] !== undefined) {
        dataToUpdate[key] = validatedData[key as keyof typeof validatedData];
      }
    }

    const updatedThread = await prisma.discussionThread.update({
      where: { id: threadId },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedThread);
  } catch (error) {
    console.error('[API_DISCUSSIONS_THREADID_PATCH]', error);
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 });
    }
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { threadId: string } }
) {
  const { userId: clerkUserId } = await auth();
  const { threadId } = params;

  if (!clerkUserId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const thread = await prisma.discussionThread.findUnique({
      where: { id: threadId },
      select: { authorId: true },
    });

    if (!thread) {
      return new NextResponse('Discussion thread not found', { status: 404 });
    }

    // Only author or admin can delete
    if (thread.authorId !== user.id && user.role !== 'ADMIN') {
      return new NextResponse('Forbidden: Only the author or admin can delete this thread', { status: 403 });
    }

    await prisma.discussionThread.delete({
      where: { id: threadId },
    });

    return new NextResponse('Discussion thread deleted successfully', { status: 200 });
  } catch (error) {
    console.error('[API_DISCUSSIONS_THREADID_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}