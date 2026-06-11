import { type GameType } from '@/lib/games'

export type CharacterRole = 'dps' | 'sub_dps' | 'support' | 'healer' | 'shielder'

export type ContentType = 
  // Genshin
  | 'spiral_abyss' | 'imaginarium_theater' | 'overworld' | 'domain'
  // HSR
  | 'memory_of_chaos' | 'pure_fiction' | 'apocalyptic_shadow'
  // ZZZ
  | 'shiyu_defense' | 'deadly_assault'
  // Wuwa
  | 'tower_of_adversity'
  // NTE
  | 'nte_endgame'
  // Endfield
  | 'endfield_endgame'
  // Universal
  | 'general'

export interface Character {
  id: string              // slug unik: "genshin_hu_tao"
  gameType: GameType
  name: string
  imageUrl?: string       // URL avatar karakter
  element: string         // Pyro, Cryo, Quantum, Spectro, dsb
  role: CharacterRole
  rarity: 4 | 5
  isFreeOrF2P: boolean    // true jika bisa didapat tanpa gacha
  synergies: string[]     // id karakter lain yang sinergis
  recommendedFor: ContentType[]
  tags: string[]          // ['freeze', 'vaporize', 'hyperbloom', etc]
}

export interface TeamScore {
  total: number
  synergyScore: number
  coverageScore: number
  elementScore: number
  contentScore: number
  f2pScore: number
}

export type TeamCategory = 'meta' | 'niche' | 'f2p' | 'general'

export interface ScoredTeam {
  characters: Character[]
  score: TeamScore
  category: TeamCategory
  reasonSummary: string[]
}
