// Fighter interface (used in rankings)
export interface Fighter {
  id: string
  name: string
}

// Champion interface
export interface Champion {
  id: string
  championName: string
}

// Division/Category interface (from /rankings endpoint)
export interface Division {
  id: string
  categoryName: string
  champion: Champion | null
  fighters: Fighter[]
}

// Full fighter details (from /fighter/:id endpoint)
export interface FighterDetails {
  id: string
  name: string
  nickname?: string
  category?: string
  wins?: string
  losses?: string
  draws?: string
  status?: string
  placeOfBirth?: string
  trainsAt?: string
  fightingStyle?: string
  age?: string
  height?: string
  weight?: string
  reach?: string
  legReach?: string
  octagonDebut?: string
  imgUrl?: string
}

// Fighters collection (from /fighters endpoint)
export interface FightersCollection {
  [fighterId: string]: FighterDetails
}

// Extended Fighter interface for use in components with additional data
export interface ExtendedFighter extends Fighter {
  nickname?: string
  category?: string
  record?: string
  imgUrl?: string
  status?: string
}
