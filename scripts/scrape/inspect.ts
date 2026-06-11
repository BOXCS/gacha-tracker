import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

const URL = 'https://wutheringwaves.fandom.com/wiki/Resonator';

async function inspect() {
  console.log(`Navigating to ${URL}...`);
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  try {
    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    console.log('Waiting 5 seconds for dynamic content...');
    await new Promise(r => setTimeout(r, 5000));
    
    // Cari elemen yang mengandung "Anby"
    // Ambil struktur table.fandom-table
    const tableHeaders = await page.evaluate(() => {
      const ths = Array.from(document.querySelectorAll('table.fandom-table th'));
      return ths.map(th => th.textContent?.trim() || '');
    });
    console.log('Table Headers:', tableHeaders);
    
    // Ambil row pertama untuk melihat strukturnya
    const firstRowCols = await page.evaluate(() => {
      const tds = Array.from(document.querySelectorAll('table.fandom-table tbody tr:first-child td'));
      return tds.map(td => td.textContent?.trim() || '');
    });
    console.log('First Row Cols:', firstRowCols);
    
    const html = await page.content();
    const $ = cheerio.load(html);
    const nextDataScript = $('#__NEXT_DATA__').html();
    
    if (nextDataScript) {
      console.log('Found __NEXT_DATA__, writing to file...');
      fs.writeFileSync(path.resolve(__dirname, 'prydwen_raw.json'), nextDataScript);
      console.log('Saved to prydwen_raw.json');
    } else {
      console.log('No __NEXT_DATA__ found, saving raw HTML instead...');
      fs.writeFileSync(path.resolve(__dirname, 'wuwa_raw.html'), html);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
  }
}

inspect();
