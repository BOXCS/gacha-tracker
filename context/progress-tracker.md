# Progress Tracker

Update file ini setelah setiap perubahan implementasi yang berarti.

---

## Current Phase

**Fase 1 — MVP: Tracker Inti** (Minggu 1–4)

---

## Current Goal

Setup project dan fondasi: inisialisasi Next.js, konfigurasi Supabase,
sistem auth, dan kalkulasi resin core untuk tiga game MVP
(Genshin Impact, Honkai: Star Rail, Zenless Zone Zero).

---

## Completed

- Inisialisasi project Next.js 14 dengan Tailwind CSS + shadcn/ui
- Konfigurasi font (Inter & JetBrains Mono) dan CSS variables
- Install dependencies utama (lucide-react, recharts, supabase)
- Setup Supabase project dan konfigurasi environment variables
- Buat migration schema awal (tabel `users`, `game_accounts`, `daily_tasks`, `resin_history`)
- Setup auth: Supabase Auth dengan email dan Google OAuth
- Setup Row Level Security (RLS) di semua tabel

---

## In Progress

*(Minggu 3 dan Fase 2 Core selesai — Layer 8 selesai)*

---

## Next Up

### Fase 1 — MVP (Minggu 1–4)

**Minggu 1 — Setup & Auth**
1. [x] Init repo GitHub + project Next.js 14
2. [x] Konfigurasi Tailwind CSS, shadcn/ui, dan fonts (Inter + JetBrains Mono)
3. [x] Setup Supabase project (DB + Auth)
4. [x] Buat migration schema: `users`, `game_accounts`, `daily_tasks`, `resin_history`
5. [x] Implementasi auth flow: login, register, Google OAuth, guest mode (Client & Middleware Setup)
6. [x] Setup Row Level Security (RLS) di semua tabel

**Minggu 2 — Resin Calculator Core**
7. [x] `lib/games/genshin.ts`, `lib/games/hsr.ts`, `lib/games/zzz.ts`
8. [x] `lib/resin.ts` — `computeResin()` dan `computeSecondsToFull()`
9. [x] `lib/resin.test.ts` — unit test untuk semua fungsi kalkulasi (23/23 ✅)
10. [x] `app/api/accounts/` — CRUD API untuk game accounts (dengan Zod validation)
11. [x] `hooks/useAccounts.ts` — fetch dan mutate game accounts (dengan SWR)
12. [x] `components/resin/ResinProgress.tsx` — progress bar dengan status warna + spring animation
13. [x] `components/resin/CountdownTimer.tsx` — countdown live dengan digit-flip animation
14. [x] `components/resin/ResinCard.tsx` — card glassmorphism + 3D magnetic hover
15. [x] `components/dashboard/GameBadge.tsx` — badge per game dengan warna konsisten
16. [x] `components/dashboard/OverviewGrid.tsx` — responsive grid dengan staggered entrance
17. [x] `app/dashboard/page.tsx` + `DashboardClient.tsx` — halaman dashboard dengan Lenis smooth scroll
18. [x] `app/dashboard/layout.tsx` — SWR + Lenis provider
19. [x] `app/page.tsx` — redirect ke /dashboard

**Minggu 3 — Daily Checklist**
14. [x] `app/api/tasks/` — CRUD API untuk daily tasks
15. [x] `hooks/useTasks.ts` — fetch dan mutate daily tasks
16. [x] `lib/reset.ts` — logika kapan server reset terjadi per game
17. [x] `components/checklist/DailyChecklist.tsx` dan `TaskItem.tsx`
18. [x] `components/resin/ResinCard.tsx` — card akun lengkap dengan resin + checklist
19. [x] `app/account/[id]/` — halaman detail satu akun

**Minggu 4 — Dashboard & UI Polish**
20. `components/dashboard/AccountCard.tsx`, `GameBadge.tsx`, `OverviewGrid.tsx`
21. `app/dashboard/` — halaman overview semua akun
22. Dark mode + responsive mobile layout
23. Flow tambah akun baru (dialog + form)
24. Beta test internal — minta feedback dari teman

### Fase 2 — Notifikasi & Multi-akun (Minggu 5–7)
25. [x] Multi-akun: add/edit/delete, drag-to-reorder
26. [x] `lib/games/wuwa.ts`, `lib/games/nte.ts`, `lib/games/endfield.ts`
27. [x] `components/resin/NteResinCard.tsx` — dual resource NTE (diimplementasi di `ResinCard.tsx` standar)
28. [x] Web Push Notification: VAPID setup, service worker, subscription
29. [x] `app/api/push/` — simpan dan hapus push subscription
30. [x] `components/dashboard/ServerResetCountdown.tsx`
31. [x] `app/api/cron/reset/` — endpoint reset harian (Vercel Cron)

### Fase 3 — Statistik & PWA (Minggu 8–10)
32. [x] `app/history/` — halaman riwayat dan statistik
33. [x] Sinkronisasi data resin terakhir ke `resin_history` (saat update via UI)
34. [x] PWA Setup: `next-pwa`, `manifest.json`, icon maskable
35. [x] `app/settings/` — preferensi dark mode / tema (sudah ada shadcn next-themes, tinggal UI)
36. [x] `components/dashboard/InstallAppPrompt.tsx`
37. [x] Test PWA di mobile (iOS & Android)

### Fase 4 — Polish & Launch (Minggu 11–12)
37. [x] QA testing menyeluruh semua fitur
38. [x] Onboarding flow untuk user baru (Empty State)
39. [x] Landing page (Tema Arknights)
40. [x] Deploy ke Vercel production + konfigurasi domain (Via Panduan Walkthrough)
41. [x] Share ke komunitas game Indonesia (User Action)

---

## Open Questions

*(Tidak ada pertanyaan yang belum terjawab saat ini)*

---

## Architecture Decisions

- **Kalkulasi resin client-side**: tidak ada cron untuk menghitung resin —
  cukup simpan nilai terakhir + timestamp, hitung selisih saat halaman dibuka.
  Ini menghilangkan kebutuhan background job dan membuat kalkulasi tetap akurat
  bahkan jika user tidak membuka app berhari-hari.
- **Supabase atas PostgreSQL mandiri**: dipilih karena menyediakan DB + Auth + RLS
  dalam satu platform gratis, cocok untuk tahap awal tanpa infrastruktur tambahan.
- **Next.js API Routes atas backend terpisah**: mengurangi kompleksitas deployment;
  satu Vercel project untuk frontend dan API sekaligus.
- **shadcn/ui**: komponen aksesibel siap pakai yang bisa dikustomisasi penuh,
  tidak menambah bundle size untuk komponen yang tidak dipakai.
- **NTE dual resource**: disimpan di kolom `secondary_*` pada tabel `game_accounts`
  daripada tabel terpisah, untuk menjaga query sederhana dan menghindari JOIN
  yang tidak perlu untuk kasus satu game saja.
- **Multiple Servers**: Untuk saat ini tidak mendukung multiple server per game. Cukup menggunakan satu timezone default per game (umumnya UTC+8 / Asia/Shanghai).
- **HSR Event TP**: Peningkatan TP maksimum selama event cukup di-handle menggunakan field `max_resin` yang bisa di-edit per akun, tidak perlu rule khusus.
- **Arknights Endfield**: Max sanity disetel ke 360, dengan server reset pada 04:00 AM (UTC+8 / Asia/Shanghai).
- **Guest Mode**: Data guest mode hanya akan disimpan di `localStorage` client, tidak ada anon user di Supabase.
- **Notifikasi Resin**: Threshold tambahan ditambahkan saat resin mencapai 80% dan 90%, selain notifikasi saat penuh.

---

## Session Notes

- Game config di `lib/games/` adalah sumber kebenaran tunggal untuk semua nilai
  regen, max resin, dan server reset — jangan hardcode di tempat lain
- Max City Stamina NTE bersifat editable per akun; simpan di kolom `max_resin`
  di `game_accounts`, bukan di game config
- Mulai Fase 1 dari Minggu 1 item nomor 1 (init repo) secara berurutan
- Validasi kalkulasi resin dengan bermain game asli dan membandingkan selisih
  sebelum rilis beta
