import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

const html = fs.readFileSync(path.resolve(__dirname, 'prydwen_raw.html'), 'utf-8');
const $ = cheerio.load(html);

const table = $('table.fandom-table').first();

// Get column headers (Elements)
const elements: string[] = [];
table.find('tr').first().find('th').each((i, el) => {
  elements.push($(el).text().trim());
});
console.log('Elements (Columns):', elements);

// Iterate through rows (Roles)
table.find('tr').each((rowIndex, row) => {
  if (rowIndex === 0) return; // Skip header row
  
  // The first child is usually a th containing the Role
  const roleTh = $(row).find('th').first();
  const role = roleTh.text().trim();
  
  $(row).find('td').each((colIndex, col) => {
    // The column index corresponds to the element index (offset by 1 because of the role header)
    // Wait, let's just use colIndex + 1
    const element = elements[colIndex + 1];
    
    $(col).find('.card-container').each((_, card) => {
      const name = $(card).find('.card-label').text().trim();
      const rarityClass = $(card).attr('class') || '';
      let rarity = 4;
      if (rarityClass.includes('card-rank-S')) rarity = 5;
      
      console.log(`Found: ${name} | Role: ${role} | Element: ${element} | Rarity: ${rarity}`);
    });
  });
});
