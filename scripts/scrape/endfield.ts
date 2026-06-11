import fs from 'fs';
import path from 'path';

const API_URL = 'https://endfield.wiki.gg/api.php?action=query&prop=pageimages&pithumbsize=200&generator=categorymembers&gcmtitle=Category:Operators&gcmlimit=500&format=json';
const OUTPUT_PATH = path.resolve(__dirname, '../../data/characters/endfield.json');

async function scrapeEndfield() {
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
      if (page.ns !== 0) return;

      const name = page.title;
      let imageUrl = '';
      
      if (page.thumbnail && page.thumbnail.source) {
        imageUrl = page.thumbnail.source.split('/revision')[0];
      }

      characters.push({
        id: `endfield_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        name,
        game: 'endfield',
        element: 'Unknown',
        role: 'Unknown',
        rarity: 5,
        imageUrl: imageUrl,
        synergies: [],
        recommendedFor: [],
        tags: [],
        constellationWeights: [10, 10, 10, 10, 10, 10]
      });
    });

    console.log(`Berhasil mengekstrak ${characters.length} karakter Endfield.`);

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

scrapeEndfield().catch(console.error);
