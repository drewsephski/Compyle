import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { createCommentSchema } from '@/lib/validations';

export async function POST(
  req: Request,
  { params }: { params: { threadId: string } }
) {
  const { userId: clerkUserId } = await auth();
  const { threadId } = params;

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

    const thread = await prisma.discussionThread.findUnique({
      where: { id: threadId },
      select: { id: true },
    });

    if (!thread) {
      return new NextResponse('Discussion thread not found', { status: 404 });
    }

    const body = await req.json();
    const { content, parentId } = createCommentSchema.parse(body);

    const newComment = await prisma.discussionComment.create({
      data: {
        threadId: thread.id,
        authorId: user.id,
        content: content,
        parentId: parentId || null,
      },
      include: {
        author: {
          select: { id: true, displayName: true, username: true, avatar: true },
        },
      },
    });

    // Update thread's updatedAt timestamp to bring it to the top
    await prisma.discussionThread.update({
      where: { id: thread.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error('[API_DISCUSSIONS_COMMENTS_POST]', error);
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 });
    }
    return new NextResponse('Internal Error', { status: 500 });
  }
}