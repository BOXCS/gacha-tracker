# Scraper Data Karakter Gacha Tracker

Direktori ini berisi *script* Puppeteer dan pemanggil API MediaWiki untuk mengekstrak data karakter secara otomatis dari Fandom Wiki masing-masing game.

## Daftar Game & Sumber Data
- **Genshin Impact** (`genshin.ts`): Scraping statis/Puppeteer (Honey Impact/Fandom).
- **Honkai Star Rail** (`hsr.ts`): Puppeteer di Fandom HSR.
- **Zenless Zone Zero** (`zzz.ts`): Puppeteer dengan ekstraksi layout *Matrix* di Fandom ZZZ.
- **Wuthering Waves** (`wuwa.ts`): MediaWiki API dari Fandom.
- **Neverness to Everness** (`nte.ts`): MediaWiki API dari Fandom.
- **Arknights: Endfield** (`endfield.ts`): MediaWiki API dari `endfield.wiki.gg`.

## Prasyarat
Pastikan Anda sudah menginstal seluruh *dependencies*:
```bash
npm install
```

## Cara Menjalankan Scraper
Scraper dijalankan secara lokal (bukan bagian dari *build* Vercel) setiap kali ada *patch* atau rilis karakter baru.
Gunakan perintah NPM berikut:

```bash
npm run scrape:genshin
npm run scrape:hsr
npm run scrape:zzz
npm run scrape:wuwa
npm run scrape:nte
npm run scrape:endfield
```

Atau jalankan semuanya secara berurutan:
```bash
npm run scrape:all
```
*(Catatan: Anda mungkin perlu menambahkan `scrape:all` di package.json yang memanggil semua script secara berurutan).*

## Idempotency & Enrichment Data
Script ini dirancang agar **idempotent**. Artinya:
1. Jika karakter belum ada, karakter baru akan ditambahkan ke `data/characters/*.json`.
2. Jika karakter sudah ada, script **tidak akan menimpa** properti manual yang sudah Anda isi (seperti `synergies`, `recommendedFor`, `tags`, `constellationWeights`).
3. Script hanya memperbarui properti dasar seperti `name`, `rarity`, `element`, `role`, dan `imageUrl`.

**Setelah menjalankan scraper:**
Anda diwajibkan untuk mereview perubahan pada file JSON dan mengisi data meta secara manual untuk karakter baru.

## Deploy Update
Setelah file JSON diperbarui dan meta-data diisi:
1. Catat perubahan di `data/characters/CHANGELOG.md`.
2. Lakukan `git add` dan `git commit`.
3. `git push` ke repositori, dan Vercel akan otomatis melakukan *deploy* ulang dengan database JSON karakter terbaru.
