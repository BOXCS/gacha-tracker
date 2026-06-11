import fs from 'fs';
import path from 'path';

const API_URL = 'https://wutheringwaves.fandom.com/api.php?action=query&prop=pageimages&pithumbsize=200&generator=categorymembers&gcmtitle=Category:Resonators&gcmlimit=500&format=json';
const OUTPUT_PATH = path.resolve(__dirname, '../../data/characters/wuwa.json');

async function scrapeWuWa() {
  console.log(`Mengambil data dari ${API_URL}...`);
  
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    
    if (!data || !data.query || !data.query.pages) {
      throw new Error('Format response API tidak sesuai ekspektasi');
    }

    const pages = data.query.pages;
    const characters: any[] = [];
    
    Object.values(pages).forEach((page: any) => {
      // Abaikan halaman kategori atau template
      if (page.ns !== 0) return;
      if (page.title === 'Resonator' || page.title === 'Resonators') return;

      const name = page.title;
      let imageUrl = '';
      
      if (page.thumbnail && page.thumbnail.source) {
        imageUrl = page.thumbnail.source.split('/revision')[0];
      }

      // Default values since we can't easily parse infobox from this API endpoint
      let rarity = 5;
      let elementText = 'Unknown';
      let roleText = 'Unknown';

      characters.push({
        id: `wuwa_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        name,
        game: 'wuwa',
        element: elementText,
        role: roleText,
        rarity,
        imageUrl: imageUrl,
        synergies: [],
        recommendedFor: [],
        tags: [],
        constellationWeights: [10, 10, 10, 10, 10, 10]
      });
    });

    console.log(`Berhasil mengekstrak ${characters.length} karakter WuWa.`);

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
          element: existing.element !== 'Unknown' && existing.element !== '' ? existing.element : char.element,
          role: existing.role !== 'Unknown' && existing.role !== '' ? existing.role : char.role,
          rarity: existing.rarity || char.rarity,
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
  }
}

scrapeWuWa().catch(console.error);
