# Architecture Context

## Stack

| Layer | Teknologi | Peran |
|---|---|---|
| Frontend | Next.js 14 (App Router) | UI, routing, SSR, PWA shell |
| Styling | Tailwind CSS + shadcn/ui | Komponen dan utility class |
| Charts | Recharts | Grafik riwayat resin & statistik |
| Database | Supabase (PostgreSQL) | Penyimpanan data utama |
| Auth | Supabase Auth | Email + Google OAuth, session management |
| API | Next.js API Routes | Serverless endpoints, validasi input |
| Cron | Vercel Cron Jobs | Trigger daily reset task per server reset game |
| Notifikasi | Web Push API + next-pwa | Push notification & service worker |
| Deploy | Vercel | Hosting frontend + API Routes |
| Testing | Vitest | Unit test kalkulasi regen dan logika reset |

## System Boundaries

- `app/` — Next.js App Router pages dan layouts; hanya UI dan routing
- `app/api/` — API Routes: validasi input, memanggil service, mengembalikan response
- `lib/` — Business logic murni: kalkulasi resin, reset rules, game configs
- `lib/games/` — Konfigurasi per game (rate regen, max resin, server reset time, timezone)
- `components/` — Komponen UI reusable; hanya render, tidak fetch data langsung
- `hooks/` — Custom hooks untuk data fetching dan state management
- `supabase/` — Supabase client, tipe database, dan migration files

## Directory Structure

```
/
├── app/
│   ├── (auth)/           — halaman login & register
│   ├── dashboard/        — halaman utama semua akun
│   ├── account/[id]/     — detail satu akun game
│   ├── history/          — riwayat & statistik
│   ├── settings/         — preferensi pengguna
│   └── api/
│       ├── accounts/     — CRUD game accounts
│       ├── tasks/        — CRUD daily tasks
│       ├── history/      — tulis snapshot resin
│       ├── push/         — simpan push subscription
│       └── cron/
│           └── reset/    — endpoint daily reset (dipanggil Vercel Cron)
├── components/
│   ├── resin/            — ResinCard, ResinProgress, CountdownTimer
│   ├── checklist/        — DailyChecklist, TaskItem
│   ├── dashboard/        — AccountCard, GameBadge, OverviewGrid
│   └── ui/               — komponen shadcn/ui (button, dialog, dll.)
├── hooks/
│   ├── useResin.ts       — kalkulasi resin computed real-time
│   ├── useAccounts.ts    — fetch & mutate game accounts
│   ├── useTasks.ts       — fetch & mutate daily tasks
│   └── useNotification.ts — kelola push subscription
├── lib/
│   ├── resin.ts          — fungsi kalkulasi regen (pure, testable)
│   ├── reset.ts          — logika server reset per game
│   └── games/
│       ├── index.ts      — registry semua game config
│       ├── genshin.ts
│       ├── hsr.ts
│       ├── zzz.ts
│       ├── wuwa.ts
│       ├── nte.ts        — dual resource: city_stamina + character_pixel
│       └── endfield.ts
├── supabase/
│   ├── client.ts         — Supabase client (browser + server)
│   └── migrations/       — SQL migration files
└── public/
    └── sw.js             — service worker (dikelola next-pwa)
```

## Data Model

### Tabel `users` (dikelola Supabase Auth)

| Field | Tipe | Keterangan |
|---|---|---|
| `id` | uuid PK | auth.users id |
| `email` | text | |
| `display_name` | text | |
| `timezone` | text | default: Asia/Jakarta |
| `push_token` | text | Web Push subscription JSON |

### Tabel `game_accounts`

| Field | Tipe | Keterangan |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK | → auth.users |
| `game_type` | enum | genshin \| hsr \| zzz \| wuwa \| nte \| endfield |
| `nickname` | text | nama akun bebas (misal "Akun Utama") |
| `current_resin` | int | nilai resin saat terakhir diupdate |
| `max_resin` | int | batas max resin; untuk NTE city stamina: editable |
| `last_updated_at` | timestamptz | timestamp saat current_resin disimpan |
| `secondary_resin` | int | khusus NTE: nilai Character Pixel |
| `secondary_max` | int | khusus NTE: max Character Pixel (fixed 240) |
| `secondary_updated_at` | timestamptz | khusus NTE: timestamp update Character Pixel |
| `sort_order` | int | urutan tampil di dashboard |
| `created_at` | timestamptz | |

> Kolom `secondary_*` bernilai NULL untuk semua game kecuali NTE.
> Untuk NTE, `current_resin` = City Stamina dan `secondary_resin` = Character Pixel.

### Tabel `daily_tasks`

| Field | Tipe | Keterangan |
|---|---|---|
| `id` | uuid PK | |
| `account_id` | uuid FK | → game_accounts |
| `task_key` | text | daily_mission \| domain \| dispatch \| event_xxx |
| `label` | text | nama tampil task |
| `is_done` | bool | status hari ini |
| `date` | date | tanggal server reset yang berlaku |

### Tabel `resin_history`

| Field | Tipe | Keterangan |
|---|---|---|
| `id` | uuid PK | |
| `account_id` | uuid FK | → game_accounts |
| `snapshot_resin` | int | nilai resin primer saat dicatat |
| `snapshot_secondary` | int | nilai resin sekunder (NTE), NULL jika tidak ada |
| `recorded_at` | timestamptz | |

## Auth & Access Model

- Auth dikelola Supabase Auth (email/password + Google OAuth)
- Setiap row di `game_accounts` dan `daily_tasks` memiliki `user_id` atau `account_id`
  yang terikat ke user yang sedang login
- Row Level Security (RLS) Supabase aktif: user hanya bisa membaca dan mengubah
  data miliknya sendiri
- Vercel Cron memanggil `/api/cron/reset` menggunakan `CRON_SECRET` di environment variable;
  endpoint ini menolak request tanpa header yang valid

## Invariants

1. Kalkulasi resin TIDAK PERNAH dilakukan di server saat runtime — selalu client-side
   menggunakan `current_resin` + `last_updated_at` + `regen_rate` dari game config
2. `last_updated_at` HARUS diperbarui setiap kali `current_resin` diubah;
   keduanya selalu ditulis dalam satu operasi atomik
3. Setiap game config (rate regen, max resin, server reset time) hanya didefinisikan
   di `lib/games/` — tidak boleh ada angka regen yang hardcoded di komponen atau hooks
4. NTE selalu memiliki dua resource (city stamina dan character pixel) yang ditracking
   secara independen; max city stamina bersifat editable per akun
5. Daily tasks TIDAK dihapus saat reset — kolom `date` diperbarui ke tanggal server reset
   berikutnya dan `is_done` di-set false; riwayat tersimpan di `resin_history`
6. Push notification HANYA dikirim via Web Push API menggunakan subscription yang tersimpan
   di kolom `push_token`; tidak ada fallback email atau SMS
7. Service worker dikelola sepenuhnya oleh `next-pwa` — tidak ada modifikasi manual
   pada `public/sw.js`
