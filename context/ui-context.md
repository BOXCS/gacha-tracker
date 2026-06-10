# UI Context

## Theme

Light dan dark mode keduanya didukung via Tailwind CSS `dark:` variants
dan CSS custom properties. Default mengikuti system preference pengguna.
Bahasa desain mengikuti feel "game companion app" — sedikit lebih hidup
dari dashboard teknikal biasa, tapi tetap bersih dan informatif.
Hindari elemen dekoratif yang tidak melayani fungsi informasi.
Prioritas visual: status resin saat ini → countdown → checklist progress.

## Colors

Semua komponen WAJIB menggunakan CSS custom properties — tidak ada hardcoded hex.
Definisikan di `app/globals.css` di bawah `:root` dan `.dark`.

| Role | CSS Variable | Light Value | Dark Value |
|---|---|---|---|
| Page background | `--bg-base` | `#f8f9fb` | `#0d0f14` |
| Surface | `--bg-surface` | `#ffffff` | `#171923` |
| Surface raised | `--bg-surface-raised` | `#f1f3f7` | `#1e2231` |
| Primary text | `--text-primary` | `#111827` | `#f1f5f9` |
| Muted text | `--text-muted` | `#6b7280` | `#8892a4` |
| Primary accent | `--accent-primary` | `#7c3aed` | `#8b5cf6` |
| Accent subtle | `--accent-subtle` | `#f5f3ff` | `#1e1533` |
| Border | `--border-default` | `#e5e7eb` | `#252b3b` |
| Success | `--state-success` | `#16a34a` | `#22c55e` |
| Warning | `--state-warning` | `#d97706` | `#f59e0b` |
| Danger | `--state-danger` | `#dc2626` | `#ef4444` |
| Resin fill | `--resin-fill` | `#7c3aed` | `#8b5cf6` |
| Resin empty | `--resin-empty` | `#e5e7eb` | `#252b3b` |
| Resin critical | `--resin-critical` | `#dc2626` | `#ef4444` |
| Resin almost full | `--resin-warning` | `#d97706` | `#f59e0b` |
| Chart primary | `--chart-primary` | `#7c3aed` | `#8b5cf6` |
| Chart secondary | `--chart-secondary` | `#0ea5e9` | `#38bdf8` |

> Warna `--resin-*` digunakan untuk progress bar dan status badge resin.
> `--chart-*` dikonsumsi langsung oleh Recharts `stroke` dan `fill` props.

### Status Resin

| Kondisi | Threshold | Warna |
|---|---|---|
| Normal | < 80% penuh | `--resin-fill` (ungu) |
| Hampir penuh | ≥ 80% penuh | `--resin-warning` (amber) |
| Penuh | 100% | `--resin-critical` (merah) |

## Typography

| Role | Font | Tailwind Class | Catatan |
|---|---|---|---|
| UI text | Inter | `font-sans` | body, label, button |
| Angka/timer | JetBrains Mono | `font-mono` | nilai resin, countdown, timestamp |

Load via Google Fonts di `app/layout.tsx`. Gunakan `font-mono` untuk
semua angka yang berubah secara real-time (nilai resin, timer countdown)
agar tidak ada layout shift saat digit berubah.

## Border Radius

| Context | Tailwind Class |
|---|---|
| Badge / pill | `rounded-full` |
| Button / input | `rounded-md` |
| Card / panel | `rounded-xl` |
| Modal / overlay | `rounded-2xl` |
| Progress bar | `rounded-full` |

## Component Library

Tailwind CSS + shadcn/ui. Install komponen shadcn/ui sesuai kebutuhan
via `npx shadcn-ui@latest add [component]`. Semua custom component
berada di `components/` dan hanya merender — tidak fetch data langsung.

### Komponen yang Dibangun

**Resin Components (`components/resin/`)**
- `ResinCard` — card utama per akun: nama akun, game badge, progress bar resin,
  nilai numerik, countdown ke penuh
- `ResinProgress` — progress bar visual dengan warna status otomatis
- `CountdownTimer` — countdown live menggunakan `useEffect` + interval 1 detik;
  format `HH:MM:SS`
- `NteResinCard` — variant ResinCard untuk NTE dengan dua progress bar
  (City Stamina + Character Pixel)

**Checklist Components (`components/checklist/`)**
- `DailyChecklist` — container daftar task harian per akun
- `TaskItem` — satu baris task dengan checkbox, label, dan animasi selesai

**Dashboard Components (`components/dashboard/`)**
- `AccountCard` — wrapper card untuk satu akun game di dashboard overview
- `GameBadge` — badge kecil nama game dengan warna per game
- `OverviewGrid` — grid responsif semua AccountCard
- `ServerResetCountdown` — countdown ke server reset berikutnya per game

**UI Components (`components/ui/`)**
- Komponen shadcn/ui: Button, Dialog, Input, Select, Checkbox, Badge,
  DropdownMenu, Sheet (untuk mobile drawer), Toast

## Layout Patterns

**Dashboard page** (`app/dashboard/`): layout mobile-first dengan sticky
header tipis (nama app + avatar user), diikuti OverviewGrid berisi
AccountCard semua akun. Di desktop, grid 2 kolom; di mobile, 1 kolom.
Tidak ada sidebar.

**Account detail page** (`app/account/[id]/`): ResinCard besar di atas,
DailyChecklist di bawahnya, ServerResetCountdown di bagian kanan (desktop)
atau di bawah checklist (mobile).

**History page** (`app/history/`): selector akun di atas, grafik Recharts
di bawah (7 hari default, toggle ke 30 hari), diikuti tabel snapshot.

**Settings page** (`app/settings/`): form preferensi: timezone, notifikasi,
export/import data.

**Navbar**: sticky top bar dengan nama app, navigasi tab (Dashboard / History /
Settings), dan avatar/menu user. Di mobile, tab navigasi pindah ke bottom bar.

**Cards / panels**: surface putih (`--bg-surface`) dengan border 1px
(`--border-default`) dan `rounded-xl`; tidak ada drop shadow.

**Modals**: centered overlay dengan backdrop semi-transparan; panel `rounded-2xl`,
tutup saat klik backdrop atau tekan Escape.

## Game Badge Colors

Setiap game memiliki warna badge yang konsisten:

| Game | Warna Badge |
|---|---|
| Genshin Impact | `bg-blue-100 text-blue-800` |
| Honkai: Star Rail | `bg-yellow-100 text-yellow-800` |
| Zenless Zone Zero | `bg-orange-100 text-orange-800` |
| Wuthering Waves | `bg-teal-100 text-teal-800` |
| Neverness to Everness | `bg-pink-100 text-pink-800` |
| Arknights Endfield | `bg-red-100 text-red-800` |

## Icons

Lucide React. Stroke-based only.

| Context | Size class |
|---|---|
| Inline / label | `h-4 w-4` |
| Button | `h-4 w-4` |
| Status indicator | `h-5 w-5` |
| Empty state | `h-8 w-8` |

Icon per use case:
- `Zap` — resin/stamina (icon utama untuk resource)
- `Clock` — countdown timer, server reset
- `CheckSquare`, `Square` — task checklist
- `Bell`, `BellOff` — notifikasi on/off
- `User`, `Users` — akun game
- `BarChart2` — statistik & riwayat
- `Settings` — pengaturan
- `Download`, `Upload` — export/import data
- `Plus` — tambah akun baru
- `Trash2` — hapus akun
- `RefreshCw` — refresh / update resin manual
