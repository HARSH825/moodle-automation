import { chromium } from 'playwright';
import dotenv from 'dotenv';
dotenv.config();

let browserPool = [];
let cleanupInterval = null;

const maxBrowsers = Math.min(parseInt(process.env.MAX_BROWSERS) || 12, 16); 
const idleTimeout = parseInt(process.env.BROWSER_TIMEOUT) || 120000; 

export const initBrowserPool = () => {
  console.log(`Browser pool initialized (max: ${maxBrowsers})`);
  cleanupInterval = setInterval(cleanupIdleBrowsers, 60000); // every min
  process.on('SIGINT', shutdownBrowserPool);
  process.on('SIGTERM', shutdownBrowserPool);
};

export const preWarmPool = async (count = 4) => {
  const preWarmPromises = [];
  for (let i = 0; i < count && browserPool.length < maxBrowsers; i++) {
    preWarmPromises.push(createBrowser().then(browser => {
      browserPool.push({
        browser,
        inUse: false,
        closed: false,
        created: Date.now(),
        lastUsed: Date.now()
      });
    }));
  }
  await Promise.all(preWarmPromises);
  console.log(`Pre-warmed ${count} browsers`);
};

export const getBrowser = async () => {
  const available = browserPool.find(item => !item.inUse && !item.closed);
  if (available) {
    available.inUse = true;
    available.lastUsed = Date.now();
    return available.browser;
  }
  if (browserPool.length < maxBrowsers) {
    const browser = await createBrowser();
    const poolItem = { browser, inUse: true, closed: false, created: Date.now(), lastUsed: Date.now() };
    browserPool.push(poolItem);
    return browser;
  }
  return waitForAvailableBrowser();
};

export const releaseBrowser = (browser) => {
  const poolItem = browserPool.find(item => item.browser === browser);
  if (poolItem && !poolItem.closed) {
    poolItem.inUse = false;
    poolItem.lastUsed = Date.now();
  }
};

const createBrowser = async () => {
  try {
    const browser = await chromium.launch({
      headless: true,
      args: ['--disable-dev-shm-usage', '--disable-gpu', '--disable-setuid-sandbox', '--no-sandbox', '--no-zygote']
    });
    browser.on('disconnected', () => { markBrowserClosed(browser); });
    return browser;
  } catch (err) {
    throw err;
  }
};

const waitForAvailableBrowser = async (timeout = 30000) => {
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    const checkInterval = setInterval(() => {
      const available = browserPool.find(item => !item.inUse && !item.closed);
      if (available) {
        clearInterval(checkInterval);
        available.inUse = true;
        available.lastUsed = Date.now();
        resolve(available.browser);
      }
      if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        reject(new Error('Timeout waiting for available browser'));
      }
    }, 1000);
  });
};

const cleanupIdleBrowsers = () => {
  const now = Date.now();
  const toRemove = [];
  for (let i = 0; i < browserPool.length; i++) {
    const item = browserPool[i];
    if (!item.inUse && (item.closed || now - item.lastUsed > idleTimeout)) {
      toRemove.push(i);
    }
  }
  for (let i = toRemove.length - 1; i >= 0; i--) {
    const index = toRemove[i];
    const item = browserPool[index];
    if (!item.closed) item.browser.close().catch(console.error);
    browserPool.splice(index, 1);
  }
};

const markBrowserClosed = (browser) => {
  const item = browserPool.find(b => b.browser === browser);
  if (item) item.closed = true;
};

export const shutdownBrowserPool = async () => {
  if (cleanupInterval) clearInterval(cleanupInterval);
  const closePromises = browserPool.map(item =>
    item.closed ? Promise.resolve() : item.browser.close()
  );
  await Promise.allSettled(closePromises);
  browserPool = [];
};
