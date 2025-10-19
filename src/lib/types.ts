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
  // Additional fields will be included based on actual API response
  [key: string]: any
}
