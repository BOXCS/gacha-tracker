import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

const URL = 'https://zenless-zone-zero.fandom.com/wiki/Agent/List';
const OUTPUT_PATH = path.resolve(__dirname, '../../data/characters/zzz.json');

async function scrapeZZZ() {
  console.log(`Mengambil data dari ${URL} menggunakan Puppeteer...`);
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  try {
    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    
    // Tunggu sedikit untuk merender tabel jika menggunakan JS client-side
    await new Promise(r => setTimeout(r, 5000));
    
    const html = await page.content();
    const $ = cheerio.load(html);

    const characters: any[] = [];
    
    const table = $('table.fandom-table').first();

    if (table.length > 0) {
      // Get column headers (Elements)
      const elements: string[] = [];
      table.find('tr').first().find('th').each((i, el) => {
        elements.push($(el).text().trim());
      });

      // Iterate through rows (Roles)
      table.find('tr').each((rowIndex, row) => {
        if (rowIndex === 0) return; // Skip header row
        
        // The first child is usually a th containing the Role
        const roleTh = $(row).find('th').first();
        const role = roleTh.text().trim();
        
        $(row).find('td').each((colIndex, col) => {
          const elementText = elements[colIndex + 1] || 'Unknown';
          
          $(col).find('.card-container').each((_, card) => {
            let name = $(card).find('.card-label').text().trim();
            if (!name) name = $(card).find('.card-link a').text().trim();
            
            const rarityClass = $(card).attr('class') || '';
            let rarity = 4;
            if (rarityClass.includes('card-rank-S')) rarity = 5;

            let imageUrl = $(card).find('img').attr('data-src') || $(card).find('img').attr('src');
            if (imageUrl) imageUrl = imageUrl.split('/revision')[0];

            if (name && name !== '') {
              // Jika nama memiliki akhiran aneh, bersihkan, misalnya "Soldier 0 - Anby"
              const cleanName = name.split(' - ').pop()?.trim() || name;

              characters.push({
                id: `zzz_${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
                name: cleanName,
                game: 'zzz',
                element: elementText.toLowerCase(),
                role: role.toLowerCase(),
                rarity,
                imageUrl: imageUrl || '',
                synergies: [],
                recommendedFor: [],
                tags: [],
                constellationWeights: rarity === 5 ? [10, 10, 10, 10, 10, 10] : [5, 5, 5, 5, 5, 5]
              });
            }
          });
        });
      });
    }

    console.log(`Berhasil mengekstrak ${characters.length} karakter ZZZ.`);

    let existingData: any[] = [];
    if (fs.existsSync(OUTPUT_PATH)) {
      const raw = fs.readFileSync(OUTPUT_PATH, 'utf-8');
      try {
        existingData = JSON.parse(raw);
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

scrapeZZZ().catch(console.error);
