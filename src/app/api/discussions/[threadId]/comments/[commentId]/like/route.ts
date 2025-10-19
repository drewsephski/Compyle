import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: { threadId: string; commentId: string } }
) {
  const { userId: clerkUserId } = await auth();
  const { commentId } = params;

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

    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId: user.id,
          commentId: commentId,
        },
      },
    });

    if (existingLike) {
      // User already liked, so unlike it
      await prisma.commentLike.delete({
        where: { id: existingLike.id },
      });
      await prisma.discussionComment.update({
        where: { id: commentId },
        data: { likesCount: { decrement: 1 } },
      });
      return NextResponse.json({ liked: false, message: 'Comment unliked' });
    } else {
      // User has not liked, so like it
      await prisma.commentLike.create({
        data: {
          userId: user.id,
          commentId: commentId,
        },
      });
      await prisma.discussionComment.update({
        where: { id: commentId },
        data: { likesCount: { increment: 1 } },
      });
      return NextResponse.json({ liked: true, message: 'Comment liked' });
    }
  } catch (error) {
    console.error('[API_DISCUSSIONS_COMMENTID_LIKE_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}