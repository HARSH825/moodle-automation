import { getBrowser, releaseBrowser } from './BrowserPool.js';
import { getValidSession, storeSession, getValidCourses, storeCourses } from './sessionManager.js';

//old mvp -> add checking cache and cahcing 
export const loginToMoodle = async (username, password) => {
    let browser = null;
    
    try {
        browser = await getBrowser();
        
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
            viewport: { width: 1280, height: 720 }
        });
        
        const page = await context.newPage();
        const moodleURL = 'https://moodle.spit.ac.in/login/index.php';
        
        await page.goto(moodleURL, { timeout: 60000 });
        await page.fill('input#username', username);
        await page.fill('input#password', password);
        
        try {
            await Promise.all([
                page.click('button[type="submit"]'),
                page.waitForNavigation({ waitUntil: 'networkidle', timeout: 60000 }),
            ]);
        } catch (error) {
            throw new Error(`Navigation timeout: ${error.message}`);
        }
        
        const isLoginFailed = await page.$('div.loginerrors');
        const isStillOnLoginPage = page.url().includes('login/index.php');
        const usernameFieldStillExists = await page.$('input#username');
        
        if (isLoginFailed || isStillOnLoginPage || usernameFieldStillExists) {
            throw new Error('Login failed. Please check your credentials.');
        }
        
        const cookies = await page.context().cookies();
        
        await page.close();
        await context.close();
        
        console.log(` Login successful for: ${username}`);
        return cookies;
        
    } catch (error) {
        console.error(`Login error for ${username}:`, error.message);
        throw error;
    } finally {
        if (browser) {
            releaseBrowser(browser);
        }
    }
};

export const fetchUserCourses = async (username, cookies) => {
    let browser = null;
    
    try {
        browser = await getBrowser();
        
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        });
        
        await context.addCookies(cookies);
        const page = await context.newPage();
        
        await page.goto('https://moodle.spit.ac.in/my/courses.php', {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });
        
        await page.waitForSelector('.course-info-container', { timeout: 60000 });
        
        const courses = await page.$$eval('.course-info-container', nodes =>
            nodes.map(node => {
                const titleEl = node.querySelector('a.aalink.coursename .multiline');
                const linkEl = node.querySelector('a.aalink.coursename');
                return {
                    title: titleEl?.textContent.trim() || '',
                    url: linkEl?.href || '',
                    id: linkEl?.href.split('id=')[1] || ''
                };
            })
        );
        
        await page.close();
        await context.close();
        
        console.log(` Fetched ${courses.length} courses for: ${username}`);
        return courses;
        
    } catch (error) {
        console.error(`Course fetch error for ${username}:`, error.message);
        throw error;
    } finally {
        if (browser) {
            releaseBrowser(browser);
        }
    }
};

export const handleFlow1 = async (username, password) => {
    try {
        console.log(` Starting Flow 1 for: ${username}`);
        
        // valid session (redis -> supabase ->Fresh login)
        let cookies = await getValidSession(username);
        
        if (!cookies) {
            console.log(` No valid session found, logging in: ${username}`);
            cookies = await loginToMoodle(username, password);
            await storeSession(username, cookies);
        }
        
        let courses = await getValidCourses(username);
        
        if (!courses) {
            console.log(` No valid courses found, fetching: ${username}`);
            courses = await fetchUserCourses(username, cookies);
            await storeCourses(username, courses);
        }
        
        console.log(` Flow 1 completed for: ${username}`);
        return {
            success: true,
            courses: courses,
            sessionValid: true
        };
        
    } catch (error) {
        console.error(` Flow 1 failed for ${username}:`, error.message);
        return {
            success: false,
            error: error.message,
            sessionValid: false
        };
    }
};
