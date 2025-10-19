import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export async function getCurrentUser() {
  const { userId } = auth();

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      preferences: true,
    },
  });

  return user;
}

export function requireAuth() {
  const { userId } = auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }
  return userId;
}

export async function requireRole(role: UserRole) {
  const user = await getCurrentUser();
  if (!user || user.role !== role) {
    throw new Error(`Forbidden: Requires ${role} role`);
  }
  return user;
}

export function getUserId() {
  const { userId } = auth();
  if (!userId) {
    return null;
  }
  return userId;
}

// Helper to sync Clerk user data to Prisma (can be used in API routes if needed, but webhooks are preferred)
export async function syncUserWithClerk(clerkUser: any) {
  const { id, email_addresses, username, first_name, last_name, image_url } = clerkUser;

  const user = await prisma.user.upsert({
    where: { clerkId: id },
    update: {
      email: email_addresses[0].email_address,
      username: username,
      displayName: `${first_name || ''} ${last_name || ''}`.trim(),
      avatar: image_url,
    },
    create: {
      clerkId: id,
      email: email_addresses[0].email_address,
      username: username,
      displayName: `${first_name || ''} ${last_name || ''}`.trim(),
      avatar: image_url,
    },
  });
  return user;
}