import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

const URL = 'https://honkai-star-rail.fandom.com/wiki/Character/List';
const OUTPUT_PATH = path.resolve(__dirname, '../../data/characters/hsr.json');

async function scrapeHSR() {
  console.log(`Mengambil data dari ${URL} menggunakan Puppeteer...`);
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  try {
    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    const html = await page.content();
    const $ = cheerio.load(html);

    const characters: any[] = [];
    
    $('table.article-table tbody tr').each((i, row) => {
      if (i === 0) return; // Header
      
      const cols = $(row).find('td');
      if (cols.length < 5) return;

      const nameNode = $(cols[0]).find('a').last();
      const name = nameNode.text().trim();
      
      let imageUrl = $(cols[0]).find('img').attr('data-src') || $(cols[0]).find('img').attr('src');
      if (imageUrl) imageUrl = imageUrl.split('/revision')[0];

      let rarity = 4;
      const rarityImg = $(cols[1]).find('img').attr('alt');
      if (rarityImg && rarityImg.includes('5 Star')) rarity = 5;

      const pathText = $(cols[2]).find('a').last().text().trim().toLowerCase();
      const elementText = $(cols[3]).find('a').last().text().trim().toLowerCase();

      if (name) {
        characters.push({
          id: `hsr_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
          name,
          game: 'hsr',
          element: elementText,
          role: pathText,
          rarity,
          imageUrl: imageUrl || '',
          synergies: [],
          recommendedFor: [],
          tags: [],
          constellationWeights: rarity === 5 ? [10, 10, 10, 10, 10, 10] : [5, 5, 5, 5, 5, 5]
        });
      }
    });

    console.log(`Berhasil mengekstrak ${characters.length} karakter.`);

    let existingData: any[] = [];
    if (fs.existsSync(OUTPUT_PATH)) {
      const raw = fs.readFileSync(OUTPUT_PATH, 'utf-8');
      try {
        existingData = JSON.parse(raw);
        console.log('Membaca data lama untuk mempertahankan metadata...');
      } catch (e) {
        console.warn('Gagal mem-parse data lama.');
      }
    }

    const finalData = characters.map(char => {
      const existing = existingData.find(e => e.id === char.id);
      if (existing) {
        return {
          ...char,
          synergies: existing.synergies || [],
          recommendedFor: existing.recommendedFor || [],
          tags: existing.tags || [],
          constellationWeights: existing.constellationWeights || char.constellationWeights
        };
      }
      return char;
    });

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(finalData, null, 2));
    console.log(`Berhasil menyimpan data ke ${OUTPUT_PATH}`);

  } catch (err) {
    console.error('Error saat scraping:', err);
  } finally {
    await browser.close();
  }
}

scrapeHSR().catch(console.error);
