# Changelog Data Karakter

Semua perubahan pada database statis JSON karakter dicatat di sini. Update dilakukan dengan menjalankan scraper lokal dan memperkaya datanya secara manual.

## [1.0.0] - 2026-06-11
### Ditambahkan
- **Genshin Impact**: Inisialisasi struktur awal.
- **Honkai Star Rail**: Scraping otomatis 87 karakter dari Fandom. Data mencakup Path (Role) dan Element.
- **Zenless Zone Zero**: Scraping otomatis 56 karakter dari tabel Matrix Fandom.
- **Wuthering Waves**: Ekstraksi 51 Resonator via Fandom MediaWiki API. Elemen dan Role menggunakan *placeholder* "Unknown".
- **Neverness to Everness**: Ekstraksi 38 karakter via Fandom MediaWiki API.
- **Arknights Endfield**: Ekstraksi 28 operator via MediaWiki API `endfield.wiki.gg`.

### Catatan
- Semua karakter baru memiliki *constellation weights* bawaan.
- Atribut kombo seperti `synergies`, `recommendedFor`, dan `tags` masih kosong untuk game baru dan membutuhkan pengisian manual seiring pembaruan meta.
