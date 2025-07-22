import { chromium } from 'playwright';
import dotenv from 'dotenv';

dotenv.config();

let browserPool = [];
let cleanupInterval = null;
const maxBrowsers = parseInt(process.env.MAX_BROWSERS) || 3;
const idleTimeout = parseInt(process.env.BROWSER_TIMEOUT) || 300000; // 5 mins

export const initBrowserPool = () => {
    console.log(` Browser pool initialized (max: ${maxBrowsers})`);
    cleanupInterval = setInterval(cleanupIdleBrowsers, 60000); 

    process.on('SIGINT', shutdownBrowserPool);
    process.on('SIGTERM', shutdownBrowserPool);
};

export const getBrowser = async () => {
    const available = browserPool.find(item => !item.inUse && !item.closed);

    //reuse
    if (available) {
        available.inUse = true;
        available.lastUsed = Date.now();
        console.log(`Reusing browser (active: ${getActiveCount()})`);
        return available.browser;
    }

    if (browserPool.length < maxBrowsers) {
        const browser = await createBrowser();
        const poolItem = {
            browser,
            inUse: true,
            closed: false,
            created: Date.now(),
            lastUsed: Date.now()
        };
        browserPool.push(poolItem);
        console.log(`Created new browser (pool: ${browserPool.length})`);
        return browser;
    }

    return waitForAvailableBrowser();
};

export const releaseBrowser = (browser) => {
    const poolItem = browserPool.find(item => item.browser === browser);
    if (poolItem && !poolItem.closed) {
        poolItem.inUse = false;
        poolItem.lastUsed = Date.now();
        console.log(`Browser released (active: ${getActiveCount()})`);
    }
};

const createBrowser = async () => {
    try {
        const browser = await chromium.launch({
            headless: true,
            args: [
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-setuid-sandbox',
                '--no-sandbox',
                '--no-zygote'
            ]
        });

        browser.on('disconnected', () => {
            markBrowserClosed(browser);
            console.log(' Browser disconnected.');
        });

        return browser;
    } catch (err) {
        console.error('Failed to create browser:', err);
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
        if (!item.closed) {
            item.browser.close().catch(console.error);
        }
        browserPool.splice(index, 1);
    }

    if (toRemove.length > 0) {
        console.log(` Cleaned ${toRemove.length} browsers (pool: ${browserPool.length})`);
    }
};

const markBrowserClosed = (browser) => {
    const item = browserPool.find(b => b.browser === browser);
    if (item) item.closed = true;
};

export const getActiveCount = () => browserPool.filter(item => item.inUse).length;

export const getPoolStatus = () => ({
    totalBrowsers: browserPool.length,
    activeBrowsers: getActiveCount(),
    idleBrowsers: browserPool.length - getActiveCount(),
    maxBrowsers: maxBrowsers
});

export const shutdownBrowserPool = async () => {
    console.log('Shutting down browser pool...');
    if (cleanupInterval) clearInterval(cleanupInterval);

    const closePromises = browserPool.map(item =>
        item.closed ? Promise.resolve() : item.browser.close()
    );

    await Promise.allSettled(closePromises);
    browserPool = [];
    console.log('Browser pool shutdown complete.');
};
