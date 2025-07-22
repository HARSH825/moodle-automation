import fs from 'fs';
import path from 'path';
import { getBrowser, releaseBrowser } from '../services/BrowserPool.js';

export async function downloadFileWithAuthentication(url, outputPath, cookies) {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    let browser;
    try {
        browser = await getBrowser();
        const context = await browser.newContext({
            acceptDownloads: true,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        });
        
        await context.addCookies(cookies);
        const downloadPage = await context.newPage();

        try {
            const downloadPromise = downloadPage.waitForEvent('download', { timeout: 60000 });
            await downloadPage.evaluate((fileUrl) => {
                window.location.href = fileUrl;
            }, url);

            const download = await downloadPromise;
            await download.saveAs(outputPath);
            console.log(` File downloaded: ${outputPath}`);
            
        } finally {
            await downloadPage.close();
            await context.close();
        }

        return outputPath;
    } catch (error) {
        console.error(`Download error: ${error.message}`);
        return null;
    } finally {
        if (browser) {
            releaseBrowser(browser);
        }
    }
}
