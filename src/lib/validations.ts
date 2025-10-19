import { z } from 'zod';
import { FighterPosition, LeagueStatus } from '@prisma/client';

export const createLeagueSchema = z.object({
  name: z.string().min(3, 'League name must be at least 3 characters').max(100, 'League name cannot exceed 100 characters'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  maxMembers: z.number().int().min(2, 'Minimum 2 members').max(20, 'Maximum 20 members'),
  entryFee: z.number().min(0, 'Entry fee cannot be negative').optional(),
  prizePool: z.number().min(0, 'Prize pool cannot be negative').optional(),
  startDate: z.string().datetime('Start date must be a valid date and time'),
  endDate: z.string().datetime('End date must be a valid date and time'),
  rules: z.any().optional(), // Zod for JSON type, can be more specific if structure is known
});

export const updateLeagueSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().max(500).optional(),
  maxMembers: z.number().int().min(2).max(20).optional(),
  entryFee: z.number().min(0).optional(),
  prizePool: z.number().min(0).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.nativeEnum(LeagueStatus).optional(),
  rules: z.any().optional(),
});

export const createTeamSchema = z.object({
  name: z.string().min(3, 'Team name must be at least 3 characters').max(50, 'Team name cannot exceed 50 characters'),
});

export const addFighterToRosterSchema = z.object({
  fighterId: z.string().min(1, 'Fighter ID is required'),
  position: z.nativeEnum(FighterPosition).default(FighterPosition.BENCH),
  acquisitionCost: z.number().min(0, 'Acquisition cost cannot be negative'),
});

export const updateLineupSchema = z.array(z.object({
  fighterId: z.string().min(1, 'Fighter ID is required'),
  position: z.nativeEnum(FighterPosition),
}));

export const createDiscussionSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title cannot exceed 200 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  category: z.string().optional(), // Assuming string for now, will be enum later
  fighterId: z.string().optional(),
  eventId: z.string().optional(),
  leagueId: z.string().optional(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty'),
  parentId: z.string().optional(), // For nested replies
});

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
});