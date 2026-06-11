import type { Character } from '@/lib/teambuilder/types'
import type { GameType } from '@/lib/games'

import genshin from './genshin.json'
import hsr from './hsr.json'
import zzz from './zzz.json'
import wuwa from './wuwa.json'
import nte from './nte.json'
import endfield from './endfield.json'

// Cast imported JSON arrays to the Character type
const genshinCharacters = genshin as unknown as Character[]
const hsrCharacters = hsr as unknown as Character[]
const zzzCharacters = zzz as unknown as Character[]
const wuwaCharacters = wuwa as unknown as Character[]
const nteCharacters = nte as unknown as Character[]
const endfieldCharacters = endfield as unknown as Character[]

export const ALL_CHARACTERS: Character[] = [
  ...genshinCharacters,
  ...hsrCharacters,
  ...zzzCharacters,
  ...wuwaCharacters,
  ...nteCharacters,
  ...endfieldCharacters,
]

export function getCharactersByGame(gameType: GameType): Character[] {
  return ALL_CHARACTERS.filter(c => c.gameType === gameType)
}

export function getCharacterById(id: string): Character | undefined {
  return ALL_CHARACTERS.find(c => c.id === id)
}
