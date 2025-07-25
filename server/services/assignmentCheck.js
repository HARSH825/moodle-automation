import { assignmentCheckQueue } from './queueManager.js';
import { getBrowser, releaseBrowser } from './BrowserPool.js';
import { getValidSession } from './sessionManager.js';
import supabase from '../config/supabase.js';

//  if cache present 
async function getCachedAssignments(username, courseIds) {
    try {
        const { data, error } = await supabase
            .from('course_assignments')
            .select('*')
            .eq('username', username)
            .in('course_id', courseIds)
            .gt('expires_at', new Date().toISOString());
            
        if (error) throw error;
        
        const cachedData = {};
        data.forEach(row => {
            cachedData[row.course_id] = row.assignment_data;
        });
        
        return cachedData;
    } catch (error) {
        console.error('Error getting cached assignments:', error);
        return {};
    }
}

//same code to fetch unsub assign from mvp 
async function fetchCourseAssignments(browser, cookies, courseId) {
    console.log(` Fetching assignments for course: ${courseId}`);
    
    try {
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            viewport: { width: 1280, height: 720 },
            ignoreHTTPSErrors: true
        });
        
        await context.addCookies(cookies);
        const page = await context.newPage();
        
        const courseUrl = `https://moodle.spit.ac.in/course/view.php?id=${courseId}`;
        await page.goto(courseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        const assignments = await page.$$eval('a[href*="mod/assign/view.php"]', links => 
            links.map(link => {
                const url = link.href;
                const title = link.textContent.trim();
                const assignmentId = url.match(/id=(\d+)/)?.[1] || '';
                
                return {
                    id: assignmentId,
                    title: title,
                    url: url,
                    assignmentUrl: url,
                    type: 'Assignment'
                };
            }).filter(assignment => assignment.title && assignment.id)
        );
        
        await context.close();
        
        console.log(` Found ${assignments.length} assignments in course ${courseId}`);
        return assignments;
        
    } catch (error) {
        console.error(`Error fetching assignments for course ${courseId}:`, error);
        return [];
    }
}

async function checkSubmissionStatus(page, assignment) {
    console.log(` Checking assignment: ${assignment.title}`);
    
    try {
        await page.goto(assignment.assignmentUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
        
        const expandButton = await page.$('.collapsible-actions .collapseexpand');
        if (expandButton) {
            await expandButton.click();
            await page.waitForTimeout(500);
        }
        
        const submissionStatus = await page.evaluate(() => {
            const rows = document.querySelectorAll('.submissionstatustable tr');
            
            for (const row of rows) {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 2 && cells[0]?.textContent?.trim() === 'Submission status') {
                    return cells[1]?.textContent?.trim();
                }
            }
            
            const tables = document.querySelectorAll('table.generaltable');
            for (const table of tables) {
                const rows = table.querySelectorAll('tr');
                for (const row of rows) {
                    const cells = row.querySelectorAll('td, th');
                    if (cells.length >= 2 && cells[0]?.textContent?.trim() === 'Submission status') {
                        return cells[1]?.textContent?.trim();
                    }
                }
            }
            
            return 'Not submitted';
        });
        //related files
        const allFiles = await page.evaluate(() => {
            const fileElements = Array.from(document.querySelectorAll('.fileuploadsubmission a, .mod-assign-intro-attachments a'));
            const pluginFiles = Array.from(document.querySelectorAll('a[href*="pluginfile.php"]'))
                .filter(el => el.href.includes('.doc') || el.href.includes('.pdf') || el.href.includes('.zip'));
            
            return [...fileElements, ...pluginFiles].map(el => ({
                fileName: el.textContent.trim(),
                fileUrl: el.href
            }));
        });
        
        const isSubmitted = submissionStatus && 
            (submissionStatus.includes('Submitted for grading') || 
             (submissionStatus.includes('submitted') && !submissionStatus.includes('No submission')));
        
        if (!isSubmitted) {
            return {
                isSubmitted: false,
                result: {
                    ...assignment,
                    submissionStatus: submissionStatus || 'Not submitted',
                    relatedFiles: allFiles.length > 0 ? allFiles : null
                }
            };
        }
        
        return { isSubmitted: true };
        
    } catch (error) {
        console.error(`Error checking assignment ${assignment.title}:`, error.message);
        return {
            isSubmitted: false,
            result: {
                ...assignment,
                submissionStatus: 'Error checking status',
                error: error.message
            }
        };
    }
}

//worker 
async function processAssignmentCheck(job) {
    const { username, selectedCourseIds } = job.data;
    let browser = null;
    
    try {
        console.log(`Starting assignment check for ${username} with courses: ${selectedCourseIds}`);
        
        const cookies = await getValidSession(username);
        if (!cookies) {
            throw new Error('No valid session found. Please login first.');
        }
        //cache ? 
        const cachedAssignments = await getCachedAssignments(username, selectedCourseIds);
        const coursesToFetch = selectedCourseIds.filter(courseId => !cachedAssignments[courseId]);
        
        console.log(`Found ${Object.keys(cachedAssignments).length} cached, need to fetch ${coursesToFetch.length} courses`);
        
        const allCourseAssignments = { ...cachedAssignments };
        
        if (coursesToFetch.length > 0) {
            browser = await getBrowser();
            
            for (const courseId of coursesToFetch) {
                const assignments = await fetchCourseAssignments(browser, cookies, courseId);
                
                if (assignments.length > 0) {
                    allCourseAssignments[courseId] = {
                        courseTitle: `Course ${courseId}`, 
                        courseUrl: `https://moodle.spit.ac.in/course/view.php?id=${courseId}`,
                        assignments: assignments
                    };
                }
                
                job.progress(Math.round((Object.keys(allCourseAssignments).length / selectedCourseIds.length) * 50));
            }
        }
        //status of assign
        const nonSubmittedAssignments = {};
        let processedCourses = 0;
        
        if (!browser) {
            browser = await getBrowser();
        }
        
        for (const [courseId, courseData] of Object.entries(allCourseAssignments)) {
            if (!courseData.assignments || courseData.assignments.length === 0) {
                processedCourses++;
                continue;
            }
            
            const context = await browser.newContext({
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                viewport: { width: 1280, height: 720 }
            });
            
            await context.addCookies(cookies);
            const page = await context.newPage();
            
            const nonSubmitted = [];
            
            for (const assignment of courseData.assignments) {
                const result = await checkSubmissionStatus(page, assignment);
                if (!result.isSubmitted) {
                    nonSubmitted.push(result.result);
                }
            }
            
            await page.close();
            await context.close();
            
            nonSubmittedAssignments[courseId] = {
                courseTitle: courseData.courseTitle,
                courseUrl: courseData.courseUrl,
                nonSubmittedCount: nonSubmitted.length,
                assignments: nonSubmitted
            };
            
            // cache in database 
            const expiresAt = new Date();
            expiresAt.setMinutes(expiresAt.getMinutes() + 15);
            
            try {
                await supabase.from('course_assignments').upsert({
                    username,
                    course_id: courseId,
                    assignment_data: nonSubmittedAssignments[courseId],
                    expires_at: expiresAt.toISOString(),
                    created_at: new Date().toISOString()
                }, { onConflict: 'username,course_id' });
            } catch (dbError) {
                console.error(`Error caching results for course ${courseId}:`, dbError);
            }
            
            processedCourses++;
            job.progress(50 + Math.round((processedCourses / selectedCourseIds.length) * 50));
        }
        
        console.log(`Assignment checking completed for ${username}`);
        return {
            success: true,
            nonSubmittedAssignments,
            coursesProcessed: selectedCourseIds.length
        };
        
    } catch (error) {
        console.error(`Assignment check error for ${username}:`, error.message);
        throw error;
    } finally {
        if (browser) {
            releaseBrowser(browser);
        }
    }
}

assignmentCheckQueue.process('check-assignments', 10, processAssignmentCheck);
console.log('Assignment check worker initialized (parallel, concurrency: 10)');

