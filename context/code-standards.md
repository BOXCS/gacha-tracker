# Code Standards

## General

- Satu file, satu tanggung jawab — jangan gabungkan logika kalkulasi resin
  dengan komponen UI atau data fetching dalam satu file
- Perbaiki akar masalah — jangan tambahkan workaround atau silent fallback
  di atas logika yang rusak
- Semua nilai konfigurasi game (rate regen, max resin, server reset time)
  harus bersumber dari `lib/games/` — tidak boleh hardcoded di komponen, hooks, atau API routes
- Gunakan nama variabel yang mencerminkan domain:
  `resinRate`, `lastUpdatedAt`, `computedResin`, bukan `data`, `val`, atau `temp`

## TypeScript

- Gunakan TypeScript di seluruh proyek; tidak ada file `.js` kecuali konfigurasi tooling
- Tambahkan tipe eksplisit pada semua function signature; hindari `any`
- Gunakan `interface` untuk shape objek domain, `type` untuk union dan alias
- Validasi semua input eksternal (request body, parameter URL, data dari Supabase)
  di boundary sistem sebelum diteruskan ke business logic
- Definisikan tipe database Supabase di `supabase/types.ts` dan gunakan
  konsisten di seluruh proyek

```ts
// Contoh tipe domain
interface GameAccount {
  id: string
  userId: string
  gameType: GameType
  nickname: string
  currentResin: number
  maxResin: number
  lastUpdatedAt: string // ISO 8601
  secondaryResin: number | null     // khusus NTE
  secondaryMax: number | null       // khusus NTE
  secondaryUpdatedAt: string | null // khusus NTE
}

type GameType = 'genshin' | 'hsr' | 'zzz' | 'wuwa' | 'nte' | 'endfield'
```

## Resin Calculation (lib/resin.ts)

Ini adalah logika paling kritis — harus pure, deterministik, dan fully tested.

```ts
// Selalu gunakan fungsi ini — tidak pernah hitung inline di komponen
export function computeResin(
  currentResin: number,
  maxResin: number,
  lastUpdatedAt: string,
  regenRateSeconds: number,
  now: Date = new Date()
): number {
  const elapsedSeconds = (now.getTime() - new Date(lastUpdatedAt).getTime()) / 1000
  const gained = Math.floor(elapsedSeconds / regenRateSeconds)
  return Math.min(currentResin + gained, maxResin)
}

export function computeSecondsToFull(
  currentResin: number,
  maxResin: number,
  lastUpdatedAt: string,
  regenRateSeconds: number,
  now: Date = new Date()
): number {
  const computed = computeResin(currentResin, maxResin, lastUpdatedAt, regenRateSeconds, now)
  if (computed >= maxResin) return 0
  const remaining = maxResin - computed
  const elapsedSeconds = (now.getTime() - new Date(lastUpdatedAt).getTime()) / 1000
  const elapsedFraction = elapsedSeconds % regenRateSeconds
  return remaining * regenRateSeconds - elapsedFraction
}
```

Setiap fungsi di `lib/resin.ts` HARUS memiliki unit test yang bersesuaian di `lib/resin.test.ts`.

## Game Config (lib/games/)

Setiap file game mengekspor satu objek `GameConfig`:

```ts
// lib/games/genshin.ts
import type { GameConfig } from './index'

export const genshin: GameConfig = {
  id: 'genshin',
  name: 'Genshin Impact',
  resinLabel: 'Resin',
  regenRateSeconds: 480,   // +1 per 8 menit
  defaultMaxResin: 160,
  isMaxEditable: false,
  secondaryResource: null,
  serverResets: [
    { timezone: 'Asia/Shanghai', hour: 4 },  // Asia server
    { timezone: 'America/New_York', hour: 4 }, // NA server
    { timezone: 'Europe/Paris', hour: 4 },    // EU server
  ],
}
```

```ts
// lib/games/nte.ts — contoh dual resource
export const nte: GameConfig = {
  id: 'nte',
  name: 'Neverness to Everness',
  resinLabel: 'City Stamina',
  regenRateSeconds: 360,   // +1 per 6 menit
  defaultMaxResin: 700,
  isMaxEditable: true,     // max bergantung pada level akun
  secondaryResource: {
    label: 'Character Pixel',
    regenRateSeconds: 360,
    defaultMax: 240,
    isMaxEditable: false,
  },
  serverResets: [...],
}
```

## Next.js & React

- Gunakan Server Components untuk halaman yang tidak membutuhkan interaktivitas
- Gunakan Client Components (`'use client'`) hanya saat dibutuhkan: hooks, event handler,
  atau countdown timer yang berjalan di browser
- Custom hooks di `hooks/` mengelola semua data fetching dan state — komponen
  hanya menerima data sebagai props atau memanggil hook, tidak fetch langsung
- Page components di `app/` bersifat layout-only; pindahkan logika ke hooks atau komponen
- Jangan fetch data langsung di dalam JSX atau `useEffect` tanpa abstraksi hook
- Gunakan `useRouter` dan `useSearchParams` dari `next/navigation`, bukan `next/router`

## API Routes (app/api/)

- Setiap route handler fokus pada satu tanggung jawab;
  delegasikan logika ke fungsi di `lib/`
- Validasi semua request body menggunakan Zod sebelum logika apapun dijalankan
- Format response konsisten di semua endpoint:

```ts
// Success
{ "status": "ok", "data": { ... } }

// Error
{ "status": "error", "message": "Deskripsi error yang jelas" }
```

- Gunakan HTTP status yang tepat: 200 OK, 201 Created, 400 Bad Request,
  401 Unauthorized, 404 Not Found, 422 Unprocessable Entity, 500 Internal Server Error
- Verifikasi session Supabase di setiap route yang membutuhkan auth;
  jangan percaya data user dari request body

```ts
// Pola verifikasi auth di API Route
const supabase = createRouteHandlerClient({ cookies })
const { data: { session } } = await supabase.auth.getSession()
if (!session) return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 })
```

## Supabase & Database

- Gunakan Supabase client dari `supabase/client.ts` — jangan instantiate client baru
  di dalam komponen atau route handler
- Gunakan dua client berbeda: `createClientComponentClient` untuk Client Components,
  `createRouteHandlerClient` untuk API Routes
- Row Level Security (RLS) HARUS aktif di semua tabel; jangan nonaktifkan RLS
  sebagai workaround
- Jangan tulis raw SQL di luar file migration; gunakan Supabase query builder
- Semua migration ada di `supabase/migrations/` dengan nama file
  `YYYYMMDD_deskripsi_singkat.sql`

## Styling

- Gunakan Tailwind CSS utility classes; gunakan komponen shadcn/ui untuk
  elemen interaktif (button, dialog, input, select, dropdown)
- Jangan gunakan inline `style` attribute kecuali untuk nilai dinamis yang tidak bisa
  diekspresikan dengan Tailwind (misalnya: progress bar width dari nilai resin)
- Jangan hardcode warna hex — gunakan CSS custom properties atau Tailwind tokens
- Komponen Recharts menerima data sebagai props — tidak ada data fetching
  di dalam komponen chart

## Cron & Background Jobs

- `/api/cron/reset` adalah satu-satunya endpoint yang memodifikasi `daily_tasks`
  secara batch; tidak ada komponen atau hook yang boleh mereset tasks secara langsung
- Endpoint cron WAJIB memvalidasi `CRON_SECRET` dari header sebelum menjalankan logic:

```ts
const secret = request.headers.get('x-cron-secret')
if (secret !== process.env.CRON_SECRET) {
  return NextResponse.json({ status: 'error', message: 'Forbidden' }, { status: 403 })
}
```

## Testing (Vitest)

- Semua fungsi di `lib/resin.ts` dan `lib/reset.ts` HARUS memiliki unit test
- Test di `lib/games/` memverifikasi bahwa setiap game config memiliki field wajib
  dan nilai yang valid (rate > 0, max > 0, dll.)
- Jalankan test dengan `npx vitest run` sebelum commit apapun yang mengubah `lib/`
- Jangan mock `Date` di test tanpa alasan — gunakan parameter `now` eksplisit
  pada fungsi kalkulasi untuk memudahkan testing deterministik

## File yang Dilindungi

Jangan ubah file berikut tanpa instruksi eksplisit:

- `supabase/migrations/` — migration yang sudah dijalankan di production
- `public/sw.js` — dikelola next-pwa, jangan edit manual
- `lib/games/index.ts` — registry game; tambah game baru dengan menambah export,
  jangan ubah interface `GameConfig`
