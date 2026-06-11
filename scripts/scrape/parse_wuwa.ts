import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

const html = fs.readFileSync(path.resolve(__dirname, 'wuwa_raw.html'), 'utf-8');
const $ = cheerio.load(html);

const classes = new Set<string>();
$('div').each((_, el) => {
    const cls = $(el).attr('class');
    if(cls) {
        cls.split(' ').forEach(c => classes.add(c));
    }
});
console.log('Div classes:', Array.from(classes).slice(0, 50));
