import type { GameType } from './index'

export type DomainType = 'talent' | 'weapon' | 'ascension' | 'relic' | 'money' | 'exp'

export interface DomainDay {
  id: string
  name: string
  type: DomainType
  materials: string[]
  cost: number
}

// Map hari: 0=Minggu, 1=Senin, 2=Selasa, 3=Rabu, 4=Kamis, 5=Jumat, 6=Sabtu
export const DOMAIN_SCHEDULE: Record<GameType, Record<number, DomainDay[]>> = {
  genshin: {
    // Senin & Kamis
    1: [
      { id: 'g_t_mon', name: 'Talent: Freedom, Prosperity, Transience, Admonition, Equity', type: 'talent', materials: ['Freedom', 'Prosperity', 'Transience', 'Admonition', 'Equity', 'Contention'], cost: 20 },
      { id: 'g_w_mon', name: 'Weapon: Decabrian, Guyun, Dandelion Gladiator, Forest Dew, Dross', type: 'weapon', materials: ['Decabrian', 'Guyun', 'Dandelion Gladiator', 'Forest Dew', 'Dross', 'Delirious Decadence'], cost: 20 },
    ],
    4: [
      { id: 'g_t_mon', name: 'Talent: Freedom, Prosperity, Transience, Admonition, Equity', type: 'talent', materials: ['Freedom', 'Prosperity', 'Transience', 'Admonition', 'Equity', 'Contention'], cost: 20 },
      { id: 'g_w_mon', name: 'Weapon: Decabrian, Guyun, Dandelion Gladiator, Forest Dew, Dross', type: 'weapon', materials: ['Decabrian', 'Guyun', 'Dandelion Gladiator', 'Forest Dew', 'Dross', 'Delirious Decadence'], cost: 20 },
    ],
    // Selasa & Jumat
    2: [
      { id: 'g_t_tue', name: 'Talent: Resistance, Diligence, Elegance, Ingenuity, Justice', type: 'talent', materials: ['Resistance', 'Diligence', 'Elegance', 'Ingenuity', 'Justice', 'Kindling'], cost: 20 },
      { id: 'g_w_tue', name: 'Weapon: Boreal Wolf, Elixir, Aerosiderite, Oasis Garden, Pure Sacred Dew', type: 'weapon', materials: ['Boreal Wolf', 'Elixir', 'Aerosiderite', 'Oasis Garden', 'Pure Sacred Dew', 'Night-Wind'], cost: 20 },
    ],
    5: [
      { id: 'g_t_tue', name: 'Talent: Resistance, Diligence, Elegance, Ingenuity, Justice', type: 'talent', materials: ['Resistance', 'Diligence', 'Elegance', 'Ingenuity', 'Justice', 'Kindling'], cost: 20 },
      { id: 'g_w_tue', name: 'Weapon: Boreal Wolf, Elixir, Aerosiderite, Oasis Garden, Pure Sacred Dew', type: 'weapon', materials: ['Boreal Wolf', 'Elixir', 'Aerosiderite', 'Oasis Garden', 'Pure Sacred Dew', 'Night-Wind'], cost: 20 },
    ],
    // Rabu & Sabtu
    3: [
      { id: 'g_t_wed', name: 'Talent: Ballad, Gold, Light, Praxis, Order', type: 'talent', materials: ['Ballad', 'Gold', 'Light', 'Praxis', 'Order', 'Conflict'], cost: 20 },
      { id: 'g_w_wed', name: 'Weapon: Dandelion Gladiator, Aerosiderite, Mask, Scorching Might, Pristine Sea', type: 'weapon', materials: ['Gladiator', 'Aerosiderite', 'Mask', 'Scorching Might', 'Pristine Sea', 'Sacrificial Heart'], cost: 20 },
    ],
    6: [
      { id: 'g_t_wed', name: 'Talent: Ballad, Gold, Light, Praxis, Order', type: 'talent', materials: ['Ballad', 'Gold', 'Light', 'Praxis', 'Order', 'Conflict'], cost: 20 },
      { id: 'g_w_wed', name: 'Weapon: Dandelion Gladiator, Aerosiderite, Mask, Scorching Might, Pristine Sea', type: 'weapon', materials: ['Gladiator', 'Aerosiderite', 'Mask', 'Scorching Might', 'Pristine Sea', 'Sacrificial Heart'], cost: 20 },
    ],
    // Minggu (Semua)
    0: [
      { id: 'g_all', name: 'Semua Domain Terbuka', type: 'talent', materials: ['Pilih material apapun yang Anda butuhkan'], cost: 20 }
    ]
  },
  hsr: {},
  zzz: {},
  wuwa: {},
  nte: {},
  endfield: {}
}

// Fill non-rotating games with always available schedule
const NON_ROTATING_GAMES: GameType[] = ['hsr', 'zzz', 'wuwa', 'nte', 'endfield']

NON_ROTATING_GAMES.forEach(game => {
  for (let i = 0; i <= 6; i++) {
    let cost = 10
    if (game === 'wuwa') cost = 40
    if (game === 'nte' || game === 'endfield') cost = 30
    if (game === 'hsr') cost = 10
    if (game === 'zzz') cost = 20 // Routine cleanup is 40, combat simulation is 10/20

    DOMAIN_SCHEDULE[game][i] = [
      { id: `${game}_all`, name: 'Semua Material (Selalu Tersedia)', type: 'talent', materials: ['Bisa di-farm setiap hari'], cost }
    ]
  }
})
