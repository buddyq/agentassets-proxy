import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const LAYOUTS = [
  { id: 'layout-minimal', name: 'minimal' },
  { id: 'layout-modern', name: 'modern' },
  { id: 'layout-shoalwood', name: 'shoalwood' },
  { id: 'layout-magazine', name: 'magazine' },
  { id: 'layout-classic', name: 'classic' },
];

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const OUTPUT_DIR = path.resolve(process.cwd(), 'attached_assets/generated_images');

async function captureLayoutPreviews() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('Starting Playwright browser...');
  const browser = await chromium.launch({
    headless: true,
  });
  
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();

  for (const layout of LAYOUTS) {
    const url = `${BASE_URL}/layout-preview/${layout.id}`;
    const outputPath = path.join(OUTPUT_DIR, `${layout.name}_layout_preview.png`);
    
    console.log(`Capturing ${layout.name} layout from ${url}...`);
    
    try {
      await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });

      await page.waitForTimeout(2000);

      await page.evaluate(() => {
        const images = document.querySelectorAll('img');
        const promises = Array.from(images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        });
        return Promise.all(promises);
      });

      await page.waitForTimeout(1000);

      await page.screenshot({
        path: outputPath,
        clip: {
          x: 0,
          y: 0,
          width: 1440,
          height: 900
        }
      });
      
      console.log(`  Saved: ${outputPath}`);
    } catch (error) {
      console.error(`  Error capturing ${layout.name}:`, error);
    }
  }

  await browser.close();
  console.log('Done capturing layout previews!');
}

captureLayoutPreviews().catch(console.error);
