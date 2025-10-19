# Fantasy MMA Platform

A Next.js 15 + React 19 frontend application evolving into a full-stack fantasy MMA platform.

## Features

This platform is being transformed to include:

*   **Authentication**: Secure user management powered by Clerk.
*   **User Profiles**: Personalized profiles, settings, and activity tracking.
*   **Favorite Fighters**: Users can favorite fighters for quick access and tracking.
*   **Fantasy Leagues**: Create, join, and manage fantasy MMA leagues with custom rules.
*   **Team Management**: Build and manage your fantasy team roster, set lineups, and track performance.
*   **Discussion Forums**: Engage in discussions about fighters, events, and leagues.
*   **Scoring Engine**: Automated scoring for fantasy leagues based on real fight results.
*   **Real-time Updates** (Phase 3): Live scoring and event updates via WebSockets.
*   **Payment Integration** (Phase 3): Subscription management and entry fees.
*   **Enhanced UI**: Rich user interface for team management, discussions, and profiles.

## Technology Stack

*   **Framework**: Next.js 15 (App Router)
*   **UI**: React 19, Radix UI, Tailwind CSS
*   **Authentication**: Clerk
*   **Database**: PostgreSQL
*   **ORM**: Prisma
*   **Data Fetching**: React Query (Tanstack Query)
*   **Schema Validation**: Zod
*   **Date Utilities**: date-fns
*   **Form Management**: react-hook-form
*   **Real-time**: Socket.IO (Phase 3)
*   **Payments**: Stripe (Phase 3)
*   **External API**: Octagon API (for UFC fighter data)

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

*   Node.js (v18 or higher)
*   npm or Yarn
*   Docker (for local PostgreSQL setup)
*   Clerk Account (for authentication keys)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/fantasy-mma-platform.git
cd fantasy-mma-platform
```

### 2. Environment Variables

Create a `.env.local` file in the root directory and add the following environment variables. Replace the placeholder values with your actual keys and connection strings.

```
DATABASE_URL="postgresql://user:password@localhost:5432/mydatabase?schema=public"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY=sk_test_YOUR_CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
NEXT_PUBLIC_API_BASE_URL=https://api.octagon-api.com
STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_SECRET_KEY # For Phase 3
STRIPE_WEBHOOK_SECRET=whsec_YOUR_STRIPE_WEBHOOK_SECRET # For Phase 3
CLERK_WEBHOOK_SECRET=whsec_YOUR_CLERK_WEBHOOK_SECRET # From Clerk dashboard webhook settings
```

### 3. Install Dependencies

```bash
npm install
# or
yarn install
```

### 4. Setup PostgreSQL with Docker

Ensure Docker is running on your machine.
Create a `docker-compose.yml` file in the root directory with the following content:

```yaml
version: '3.8'
services:
  db:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_DB: mydb
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
```

Then, run the Docker container:

```bash
docker-compose up -d
```
Make sure your `DATABASE_URL` in `.env.local` matches the Docker setup (e.g., `postgresql://user:password@localhost:5432/mydb?schema=public`).

### 5. Initialize Prisma and Seed Database

Run Prisma migrations and seed the database with initial data:

```bash
npx prisma db push
npx prisma db seed
```

### 6. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 7. Clerk Webhook Setup

To sync user data between Clerk and your database, you need to set up a webhook in your Clerk Dashboard:

1.  Go to your Clerk Dashboard.
2.  Navigate to **Webhooks**.
3.  Add a new endpoint:
    *   **Endpoint URL**: `http://localhost:3000/api/webhooks/clerk` (for local development)
    *   **Events**: Select `user.created`, `user.updated`, `user.deleted`.
4.  Copy the **Webhook Secret** and add it to your `.env.local` file as `CLERK_WEBHOOK_SECRET`.

## Project Structure (New Additions)

*   `prisma/`: Contains `schema.prisma` (database schema) and `seed.ts` (seed script).
*   `src/middleware.ts`: Next.js middleware for Clerk authentication.
*   `src/app/api/`: New directory for backend API routes.
    *   `webhooks/clerk/route.ts`: Clerk webhook handler for user sync.
    *   `users/profile/route.ts`: API for current user profile management.
    *   `users/[userId]/route.ts`: API for public user profiles.
    *   `favorites/route.ts`: API for managing user favorite fighters.
    *   `leagues/route.ts`: API for listing and creating leagues.
    *   `leagues/[leagueId]/...`: API for specific league details, joining, leaving, standings.
    *   `teams/[teamId]/...`: API for specific team details, roster management, lineup.
    *   `discussions/...`: API for discussion threads, comments, and likes.
    *   `scoring/calculate/route.ts`: API endpoint for calculating fantasy scores.
*   `src/app/(auth)/`: New directory for Clerk sign-in/sign-up pages.
    *   `sign-in/[[...sign-in]]/page.tsx`: Clerk sign-in page.
    *   `sign-up/[[...sign-up]]/page.tsx`: Clerk sign-up page.
*   `src/app/leagues/`: New directory for league-related pages.
    *   `page.tsx`: Browse leagues page.
    *   `create/page.tsx`: Create new league page.
    *   `[leagueId]/page.tsx`: League detail page.
*   `src/app/teams/`: New directory for team-related pages.
    *   `[teamId]/page.tsx`: Team detail page.
*   `src/app/discussions/`: New directory for discussion forum pages.
    *   `page.tsx`: Discussions listing page.
    *   `new/page.tsx`: Create new discussion page.
    *   `[threadId]/page.tsx`: Discussion thread detail page.
*   `src/app/profile/`: New directory for user profile pages.
    *   `page.tsx`: Current user's profile page.
    *   `[userId]/page.tsx`: Public user profile page.
*   `src/components/`:
    *   `Header.tsx`: Main navigation header.
    *   `LeagueCard.tsx`, `TeamCard.tsx`, `DiscussionCard.tsx`: UI cards for respective entities.
    *   `CommentItem.tsx`: Component for displaying individual comments.
    *   `FighterSelector.tsx`: Modal for selecting fighters to add to a team.
    *   `Leaderboard.tsx`: Component to display league standings.
    *   `RosterTable.tsx`: Component to display and manage team rosters.
    *   `ui/`: New Radix UI wrapper components (e.g., `dialog.tsx`, `tabs.tsx`, `avatar.tsx`, `dropdown-menu.tsx`, `label.tsx`, `textarea.tsx`, `input.tsx`, `badge.tsx`, `card.tsx`).
*   `src/hooks/`: New React hooks for data fetching and state management.
    *   `useUser.ts`: Hook to get current user data (Clerk + Prisma).
    *   `useFavorites.ts`: Hook for managing favorite fighters.
    *   `useLeagues.ts`: Hook for fetching and managing league data.
    *   `useTeam.ts`: Hook for fetching and managing team data.
*   `src/lib/`:
    *   `auth.ts`: Authentication utility functions.
    *   `validations.ts`: Zod schemas for API request validation.
    *   `scoring.ts`: Fantasy scoring calculation utilities.
    *   `query-client.ts`: React Query client configuration.
    *   `types.ts`: Extended type definitions from Prisma schema.
*   `next.config.js`: Updated to allow image domains for Clerk and Octagon API.
