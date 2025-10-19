import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty'),
});

export async function PATCH(
  req: Request,
  { params }: { params: { threadId: string; commentId: string } }
) {
  const { userId: clerkUserId } = await auth();
  const { threadId, commentId } = params;

  if (!clerkUserId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const comment = await prisma.discussionComment.findUnique({
      where: { id: commentId, threadId: threadId },
      select: { authorId: true },
    });

    if (!comment) {
      return new NextResponse('Comment not found', { status: 404 });
    }

    // Only author or admin can update
    if (comment.authorId !== user.id && user.role !== 'ADMIN') {
      return new NextResponse('Forbidden: Only the author or admin can update this comment', { status: 403 });
    }

    const body = await req.json();
    const validatedData = updateCommentSchema.parse(body);

    const updatedComment = await prisma.discussionComment.update({
      where: { id: commentId },
      data: validatedData,
    });

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error('[API_DISCUSSIONS_COMMENTID_PATCH]', error);
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 });
    }
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { threadId: string; commentId: string } }
) {
  const { userId: clerkUserId } = await auth();
  const { threadId, commentId } = params;

  if (!clerkUserId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const comment = await prisma.discussionComment.findUnique({
      where: { id: commentId, threadId: threadId },
      select: { authorId: true },
    });

    if (!comment) {
      return new NextResponse('Comment not found', { status: 404 });
    }

    // Only author or admin can delete
    if (comment.authorId !== user.id && user.role !== 'ADMIN') {
      return new NextResponse('Forbidden: Only the author or admin can delete this comment', { status: 403 });
    }

    await prisma.discussionComment.delete({
      where: { id: commentId },
    });

    return new NextResponse('Comment deleted successfully', { status: 200 });
  } catch (error) {
    console.error('[API_DISCUSSIONS_COMMENTID_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}