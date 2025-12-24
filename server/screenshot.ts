import { chromium, Browser } from 'playwright';
import { ObjectStorageService } from './objectStorage';

const objectStorage = new ObjectStorageService();

let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browser || !browser.isConnected()) {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }
  return browser;
}

export interface ScreenshotOptions {
  width?: number;
  height?: number;
  fullPage?: boolean;
  waitForSelector?: string;
  waitTime?: number;
}

export async function captureScreenshot(
  url: string,
  options: ScreenshotOptions = {}
): Promise<Buffer> {
  const {
    width = 1280,
    height = 800,
    fullPage = false,
    waitForSelector,
    waitTime = 3000
  } = options;

  const browser = await getBrowser();
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
  });
  
  const page = await context.newPage();
  
  try {
    // Use 'domcontentloaded' instead of 'networkidle' to avoid timeout 
    // when pages have video embeds or other persistent network connections
    await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });

    if (waitForSelector) {
      await page.waitForSelector(waitForSelector, { timeout: 10000 }).catch(() => {});
    }

    if (waitTime > 0) {
      await page.waitForTimeout(waitTime);
    }

    const screenshot = await page.screenshot({
      type: 'png',
      fullPage,
    });

    return screenshot;
  } finally {
    await context.close();
  }
}

export async function captureAndUploadScreenshot(
  url: string,
  options: ScreenshotOptions = {}
): Promise<string> {
  const screenshotBuffer = await captureScreenshot(url, options);
  const objectPath = await objectStorage.uploadBuffer(screenshotBuffer, 'image/png');
  return objectPath;
}

export async function closeBrowser(): Promise<void> {
  if (browser && browser.isConnected()) {
    await browser.close();
    browser = null;
  }
}
