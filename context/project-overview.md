# Gacha Resin Tracker — Project Overview

## Overview

Gacha Resin Tracker adalah webapp untuk tracking stamina/resin akun
game gacha secara daily. Pengguna dapat memantau beberapa akun dari
beberapa game sekaligus dalam satu dashboard, menerima notifikasi saat
resin penuh, dan menyelesaikan daily checklist per akun. Kalkulasi
regenerasi resin berjalan secara client-side tanpa cron job — cukup
simpan nilai resin terakhir dan timestamp-nya, lalu hitung selisih waktu
dikalikan rate regen saat halaman dibuka.

## Goals

1. Menghitung regenerasi resin/stamina secara real-time dan akurat
   untuk semua game yang didukung
2. Mendukung multi-akun dan multi-game dalam satu tampilan dashboard
3. Mengirimkan push notification saat resin penuh atau hampir penuh
4. Menyediakan daily checklist per akun dengan reset otomatis mengikuti
   server reset masing-masing game
5. Bisa diinstall sebagai PWA di HP maupun desktop (offline-capable)

## Supported Games & Resource Rules

| Game | Resource | Rate Regen | Max | Catatan |
|---|---|---|---|---|
| Genshin Impact | Resin | +1 / 8 menit (480 detik) | 160 | |
| Honkai: Star Rail | Trailblaze Power | +1 / 6 menit (360 detik) | 180 | 240 saat event |
| Zenless Zone Zero | Battery Charge | +1 / 6 menit (360 detik) | 240 | |
| Wuthering Waves | Wavering | +1 / 6 menit (360 detik) | 240 | |
| Neverness to Everness | City Stamina | +1 / 6 menit (360 detik) | editable | default 700, tergantung level akun |
| Neverness to Everness | Character Pixel | +1 / 6 menit (360 detik) | 240 | resource kedua, independent |
| Arknights Endfield | Sanity | +1 / 7 menit 12 detik (432 detik) | TBD | |

> NTE adalah satu-satunya game dengan dual-resource (City Stamina + Character Pixel).
> Max City Stamina bersifat editable per akun karena bergantung pada level karakter.

## Resin Calculation Logic

Kalkulasi regen berjalan pure client-side tanpa cron job:

```
computed_resin = current_resin + floor((now - last_updated_at) / regen_rate_seconds)
computed_resin = min(computed_resin, max_resin)
```

Nilai `current_resin` dan `last_updated_at` disimpan di database.
Setiap kali pengguna membuka halaman, nilai dihitung ulang dari dua nilai ini.
Saat pengguna mengupdate resin, simpan nilai baru dan timestamp saat itu.

## Features

### Core (Wajib — Fase 1)
- **Resin Tracker** — Input resin manual, kalkulasi regen otomatis, countdown ke resin penuh
- **Multi-akun & multi-game** — Tambah/edit/hapus akun game, beda game dalam satu dashboard
- **Daily checklist** — Task harian per akun, reset otomatis mengikuti server reset game
- **Auth** — Login/register via email atau Google; guest mode untuk coba tanpa daftar

### Plus (Direkomendasikan — Fase 2–3)
- **Push Notification** — Notifikasi browser/PWA saat resin penuh atau hampir penuh
- **Countdown server reset** — Timer live menuju server reset per game (timezone-aware)
- **Dashboard overview** — Semua akun sekilas pandang: status resin, % progress, checklist
- **Riwayat & statistik** — Grafik efisiensi harian, streak checklist, ringkasan mingguan

### Extra (Opsional — Fase 3–4)
- **PWA** — Installable di HP/desktop, service worker untuk offline support
- **Import / Export JSON** — Backup dan restore data akun, migrasi antar device

## Tech Stack

| Layer | Teknologi | Alasan |
|---|---|---|
| Frontend | Next.js 14 (App Router) | SSR, routing, PWA-friendly |
| Styling | Tailwind CSS + shadcn/ui | Utility-first, komponen aksesibel siap pakai |
| Charts | Recharts | Grafik riwayat resin |
| Database & Auth | Supabase | DB + Auth + Realtime, gratis di awal |
| API | Next.js API Routes | Serverless functions terintegrasi |
| Cron | Vercel Cron Jobs | Trigger daily reset |
| Notifikasi | Web Push API + next-pwa | Push notification + service worker |
| Deploy | Vercel | Deploy otomatis, gratis tier |
| Testing | Vitest | Unit test logika kalkulasi regen |

## Scope

### In Scope
- Kalkulasi regen resin client-side untuk semua game yang didukung
- Multi-akun per user, multi-game per dashboard
- Daily checklist dengan server reset otomatis per game
- Push notification via Web Push API
- Riwayat resin dan statistik harian/mingguan
- PWA installable dengan offline support
- Import/export data via JSON
- Auth via Supabase (email + Google OAuth)

### Out of Scope
- Integrasi API resmi game (tidak ada official API yang tersedia)
- Tracking wish/gacha pulls atau pity counter
- Fitur sosial (berbagi akun, leaderboard, dll.)
- Notifikasi via Telegram/Discord bot
- Support lebih dari satu bahasa UI (Indonesian/English saja)
- Automated retraining atau ML component apapun

## Success Criteria

1. Kalkulasi regen akurat untuk semua game: selisih < 1 menit dari nilai in-game
2. Dashboard multi-akun memuat dalam < 2 detik
3. Push notification terkirim dalam < 1 menit setelah resin penuh
4. Daily checklist reset tepat waktu mengikuti server reset masing-masing game
5. PWA dapat diinstall dan berfungsi offline (menampilkan data terakhir)
6. Seluruh logika kalkulasi resin memiliki unit test yang lulus via Vitest
