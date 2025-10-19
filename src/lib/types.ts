import {
  Fighter,
  User,
  UserPreferences,
  FantasyLeague,
  LeagueMember,
  FantasyTeam,
  FantasyFighter,
  FightScore,
  TeamScore,
  DiscussionThread,
  DiscussionComment,
  UserFavorite,
  Achievement,
  UserAchievement,
  SubscriptionTier,
  LeagueStatus,
  LeagueRole,
  FighterPosition,
  DiscussionCategory,
  Event,
  Fight,
  CommentLike,
  PrivateMessage,
  UserFollow,
} from '@prisma/client';
import { JsonValue } from '@prisma/client/runtime/library';

// Existing types (assuming these were already there, preserve them)
export interface Champion {
  id: string;
  championName: string;
}

export interface DivisionFighter {
  id: string;
  name: string;
}

export interface Division {
  id: string;
  categoryName: string;
  champion: Champion;
  fighters: DivisionFighter[];
}

export interface FighterDetails {
  id: string;
  name: string;
  nickname?: string | null;
  imgUrl?: string;
  status?: string;
  category?: string; // Division
  wins?: string;
  losses?: string;
  draws?: string;
  age?: string;
  height?: string;
  weight?: string;
  reach?: string;
  legReach?: string;
  fightingStyle?: string;
  trainsAt?: string;
  placeOfBirth?: string;
  octagonDebut?: string;
}

export interface OctagonFighter {
  id: string; // The API's fighter ID
  name: string;
  nickname?: string | null;
  imgUrl?: string; // Original image URL from API
  image?: string; // Mapped image URL for consistent use
  status?: string;
  category?: string; // Division
  wins?: string;
  losses?: string;
  draws?: string;
  age?: string;
  height?: string;
  weight?: string;
  reach?: string;
  legReach?: string;
  fightingStyle?: string;
  trainsAt?: string;
  placeOfBirth?: string;
  octagonDebut?: string;
  ranking?: number; // Additional computed property
  lastFightDate?: string; // Additional computed property
  nextFightDate?: string; // Additional computed property
}

// New types from Prisma schema
export type UserType = User & {
  preferences?: UserPreferences;
  favoritesCount?: number;
  leaguesCount?: number;
  achievementsCount?: number;
};
export type UserPreferencesType = UserPreferences;
export type FantasyLeagueType = FantasyLeague;
export type LeagueMemberType = LeagueMember;
export type FantasyTeamType = FantasyTeam;
export type FantasyFighterType = FantasyFighter & { fighter: Fighter };
export type FightScoreType = FightScore;
export type TeamScoreType = TeamScore;
export type DiscussionThreadType = DiscussionThread;
export type DiscussionCommentType = DiscussionComment;
export type UserFavoriteType = UserFavorite & { fighter: Fighter };
export type AchievementType = Achievement;
export type UserAchievementType = UserAchievement & { achievement: Achievement };
export type EventType = Event;
export type FightType = Fight;
export type CommentLikeType = CommentLike;
export type PrivateMessageType = PrivateMessage;
export type UserFollowType = UserFollow;

export interface LeagueStanding {
  teamId: string;
  teamName: string;
  ownerDisplayName?: string | null;
  ownerUsername?: string | null;
  totalScore: number;
  weeklyScore: number;
  rank: number;
}


// Enums
export {
  SubscriptionTier,
  // UserRole, // Commented out as it's not defined or used in this context
  LeagueStatus,
  LeagueRole,
  FighterPosition,
  DiscussionCategory,
};

// Utility types for API responses and form inputs (add as needed)
export type CreateLeagueInput = Pick<FantasyLeague, 'name' | 'description' | 'maxMembers' | 'startDate' | 'endDate' | 'entryFee' | 'prizePool' | 'rules'>;
export type UpdateProfileInput = Pick<UserType, 'displayName' | 'bio' | 'avatar'>;
export type CreateDiscussionInput = Pick<DiscussionThread, 'title' | 'content' | 'category' | 'fighterId' | 'eventId' | 'leagueId'>;
export type CreateCommentInput = Pick<DiscussionComment, 'content' | 'parentId'>;
export type AddFighterToRosterInput = Pick<FantasyFighter, 'fighterId' | 'position' | 'acquisitionCost'>;
export type UpdateLineupInput = { fighterId: string; position: FighterPosition }[];
