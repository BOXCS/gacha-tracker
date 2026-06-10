# AI Workflow Rules

## Approach

Bangun proyek ini secara incremental menggunakan spec-driven workflow.
File context mendefinisikan apa yang dibangun, bagaimana membangunnya,
dan status progress saat ini. Selalu implementasi berdasarkan spec ini —
jangan menginfer atau menginvent perilaku yang tidak didefinisikan secara eksplisit.

Sistem memiliki empat layer: database (Supabase), API (Next.js API Routes),
business logic (lib/), dan UI (components/ + app/). Setiap layer memiliki
boundary yang jelas di `architecture.md`. Kerjakan satu layer dalam satu
waktu kecuali langkah integrasi sudah di-scope secara eksplisit.

## Scoping Rules

- Kerjakan satu feature unit dalam satu waktu
- Utamakan increment kecil yang terverifikasi daripada perubahan besar spekulatif
- Jangan gabungkan boundary yang tidak berkaitan dalam satu langkah implementasi
- Perubahan game config (`lib/games/`) dan perubahan UI harus selalu
  diperlakukan sebagai unit implementasi terpisah
- Logika kalkulasi resin di `lib/resin.ts` adalah read-only saat runtime UI —
  tidak ada komponen yang boleh mengubah formula kalkulasi secara inline

## When to Split Work

Pisah langkah implementasi jika menggabungkan:

- Perubahan skema database dan perubahan komponen UI secara bersamaan
- Penambahan game config baru dan refactor komponen yang bestehende
- Logika API route dan logika kalkulasi resin dalam satu PR
- Perubahan PWA/service worker dan perubahan fitur core tracker
- Behavior apapun yang tidak terdefinisikan jelas di context files

Jika perubahan tidak bisa diverifikasi end-to-end dengan cepat,
scope terlalu lebar — pisah.

## Handling Missing Requirements

- Jangan menginvent perilaku produk yang tidak didefinisikan di context files
- Jika requirement ambigu, selesaikan di context file yang relevan
  sebelum implementasi
- Jika requirement hilang, tambahkan sebagai open question
  di `progress-tracker.md` sebelum melanjutkan
- Jangan berasumsi tentang nilai konfigurasi game (rate regen, max resin,
  server reset time) — semua harus bersumber dari `lib/games/`
- Jangan berasumsi max resin NTE City Stamina — nilai ini editable per akun
  dan harus diambil dari data akun, bukan dari default config

## Protected Files

Jangan ubah file berikut kecuali ada instruksi eksplisit:

- `supabase/migrations/*.sql` — migration yang sudah dijalankan di production;
  untuk perubahan schema, buat file migration baru
- `public/sw.js` — dikelola next-pwa secara otomatis
- `lib/games/index.ts` — interface `GameConfig` dan registry game;
  tambah game baru dengan menambah export, jangan ubah interface
- `lib/resin.ts` — formula kalkulasi core; perubahan apapun wajib disertai
  update test yang sesuai

## Keeping Docs in Sync

Update context file yang relevan setiap kali implementasi berubah:

- Perubahan struktur direktori atau layer boundary → `architecture.md`
- Perubahan skema database atau tabel baru → `architecture.md`
- Penambahan game baru atau perubahan game config → `project-overview.md`
- Progress fitur atau unit yang selesai → `progress-tracker.md`
- Konvensi kode baru atau pola yang diperkenalkan → `code-standards.md`
- Perubahan tema, warna, atau komponen UI → `ui-context.md`

## Before Moving to the Next Unit

1. Unit saat ini berfungsi end-to-end dalam scope yang terdefinisi
2. Tidak ada invariant di `architecture.md` yang dilanggar
3. `progress-tracker.md` mencerminkan pekerjaan yang sudah selesai
4. Jika `lib/resin.ts` atau `lib/reset.ts` diubah: `npx vitest run` lulus tanpa error
5. Jika ada perubahan frontend: `npm run build` selesai tanpa error
6. Tidak ada nilai konfigurasi game yang hardcoded di luar `lib/games/`
7. Tidak ada secret atau API key yang hardcoded — semua dari environment variables

## Environment Variables

Semua konfigurasi sensitif disimpan di `.env.local` (development)
dan Vercel environment variables (production). File yang membutuhkan:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=     # hanya untuk server-side dan cron
CRON_SECRET=                   # validasi endpoint /api/cron/reset
NEXT_PUBLIC_VAPID_PUBLIC_KEY=  # Web Push
VAPID_PRIVATE_KEY=             # Web Push, hanya server-side
```

Jangan pernah commit file `.env.local` atau nilai secret ke repository.
