# UFC Fighter Rankings

A modern web application displaying real-time UFC fighter rankings data from the Octagon API. Browse fighters across all weight divisions with an engaging cards-based interface.

## Features

- **Real-time Rankings**: Fetches live data from Octagon API with 24-hour caching
- **Division Filtering**: Filter fighters by weight division (Flyweight through Heavyweight, P4P)
- **Live Search**: Search fighters by name with real-time filtering
- **Fighter Details**: Click any fighter card to view detailed information in a modal
- **Dark/Light Themes**: Toggle between themes with system preference detection
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Champion Badges**: Special highlighting for division champions
- **Loading States**: Smooth skeleton loading animations
- **Error Handling**: User-friendly error messages with retry options

## Technology Stack

- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Octagon API** - Real-time UFC data

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Compyle
```

2. Install dependencies:
```bash
npm install
```

3. The API configuration is already set in `.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=https://api.octagon-api.com
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
Compyle/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with theme provider
│   │   ├── page.tsx            # Main rankings page
│   │   ├── loading.tsx         # Loading state
│   │   ├── error.tsx           # Error boundary
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── FighterCard.tsx     # Individual fighter card
│   │   ├── FighterGrid.tsx     # Grid with filtering logic
│   │   ├── FighterModal.tsx    # Fighter details modal
│   │   ├── SearchFilter.tsx    # Search and filter controls
│   │   ├── SkeletonCard.tsx    # Loading skeleton
│   │   ├── ThemeToggle.tsx     # Theme switcher
│   │   └── Toast.tsx           # Toast notifications
│   ├── lib/
│   │   ├── api.ts              # API integration functions
│   │   └── types.ts            # TypeScript interfaces
│   ├── hooks/
│   │   ├── useTheme.ts         # Theme management hook
│   │   └── useToast.ts         # Toast notifications hook
│   └── context/
│       └── ThemeContext.tsx    # Theme context provider
├── public/                     # Static assets
├── package.json
├── tailwind.config.js          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
└── next.config.js              # Next.js configuration
```

## Usage

### Viewing Rankings

The home page displays all UFC fighters organized by division. Champions are highlighted with a red "CHAMPION" badge, while ranked fighters show their position number.

### Filtering by Division

Use the division dropdown to filter fighters:
- Select "All Divisions" to see all fighters
- Choose a specific division to view only those fighters

### Searching Fighters

Type a fighter's name in the search box to filter results in real-time. Search works across all divisions or within a selected division.

### Viewing Fighter Details

Click any fighter card to open a modal with detailed information. Close the modal by:
- Clicking the X button
- Clicking outside the modal
- Pressing the Escape key

### Switching Themes

Click the theme toggle button (top-right corner) to switch between dark and light modes. Your preference is saved automatically.

## API Integration

The app uses the Octagon API for real-time UFC data:

- **Base URL**: https://api.octagon-api.com
- **Authentication**: Not required (public API)
- **Endpoints Used**:
  - `GET /rankings` - All divisions and rankings
  - `GET /fighter/:id` - Individual fighter details
- **Caching**: 24-hour revalidation via Next.js

## Design

### Color Scheme

**Dark Theme (Default)**:
- Primary: UFC Red (#D20A0A)
- Background: Dark Gray (#1A1A1A)
- Cards: Charcoal (#2A2A2A)
- Text: White/Light Gray

**Light Theme**:
- Primary: UFC Red (#D20A0A)
- Background: White
- Cards: Light Gray (#F5F5F5)
- Text: Black/Dark Gray

### Responsive Breakpoints

- Mobile (< 768px): 2-column grid
- Tablet (768px - 1024px): 2-column grid
- Desktop (> 1024px): 3-column grid

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## License

This project is for demonstration purposes.
