import { documentGenQueue } from './docQueueManager.js';
import { getBrowser, releaseBrowser } from './BrowserPool.js';
import { getValidSession } from './sessionManager.js';
import { generateAssignmentContent } from './contentGen.js';
import { downloadFileWithAuthentication } from '../utils/fileDownloader.js';
import parseContentSections from '../utils/parseContentSections.js';
import createParagraphsFromText from '../utils/createParaFromText.js';
import supabase from '../config/supabase.js';
import {
    BorderStyle,
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    Table,
    TableRow,
    TableCell,
    WidthType,
    AlignmentType
} from 'docx';
import mammoth from 'mammoth';
import path from 'path';
import fs from 'fs/promises';

async function fetchAssignmentDetails(page, assignment, cookies, tempDir) {
    try {
        await page.goto(assignment.assignmentUrl, { 
            waitUntil: 'domcontentloaded', 
            timeout: 15000 
        });
        
        const assignmentDetails = await page.evaluate(() => {
            const getCleanText = (selector) => {
                const element = document.querySelector(selector);
                return element ? element.textContent.trim().replace(/\s+/g, ' ') : '';
            };
            
            const description = getCleanText('.no-overflow') || 
                              getCleanText('.assignment-description') ||
                              getCleanText('#intro');
            
            const instructions = getCleanText('.assignment-instructions') ||
                               getCleanText('.instructions');
                               
            return {
                description: description || 'No description available',
                instructions: instructions || 'No specific instructions provided'
            };
        });
        
        const relatedFiles = await page.evaluate(() => {
            const fileElements = Array.from(document.querySelectorAll('.fileuploadsubmission a'));
            const attachmentElements = Array.from(document.querySelectorAll('.mod-assign-intro-attachments a'));
            const pluginFiles = Array.from(document.querySelectorAll('a[href*="pluginfile.php"]'))
                .filter(el => el.href.includes('.doc') || el.href.includes('.pdf') || el.href.includes('.zip'));
            
            return [...fileElements, ...attachmentElements, ...pluginFiles].map(el => ({
                fileName: el.textContent.trim(),
                fileUrl: el.href
            }));
        });
        
        let fileContent = null;
        if (relatedFiles.length > 0) {
            const file = relatedFiles[0];
            const tempFilePath = path.join(tempDir, `temp_${file.fileName}`);
            
            console.log(`Downloading file: ${file.fileName}`);
            const downloadedPath = await downloadFileWithAuthentication(file.fileUrl, tempFilePath, cookies);
            
            if (downloadedPath && file.fileName.endsWith('.docx')) {
                try {
                    const result = await mammoth.extractRawText({ path: downloadedPath });
                    fileContent = result.value;
                    console.log(`Content extracted from: ${file.fileName}`);
                    
                    await fs.unlink(downloadedPath).catch(() => {});
                } catch (extractErr) {
                    console.error(`Content extraction failed: ${extractErr.message}`);
                }
            }
        }
        
        return {
            ...assignment,
            description: assignmentDetails.description,
            instructions: assignmentDetails.instructions,
            relatedFiles: relatedFiles,
            fileContent: fileContent
        };
        
    } catch (error) {
        console.error(`Error fetching details for ${assignment.title}:`, error.message);
        return {
            ...assignment,
            description: 'Error fetching assignment details',
            instructions: 'Please check the assignment manually',
            error: error.message
        };
    }
}

function horizontalLine() {
    return new Paragraph({
        border: {
            bottom: {
                color: 'BFBFBF',
                style: BorderStyle.SINGLE,
                size: 4,
            },
        },
        spacing: { after: 200 },
    });
}


function styledHeading(text) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 100 },
        children: [
            new TextRun({
                text,
                bold: true,
                color: "2E74B5",
                size: 28,
            }),
        ],
    });
}

//gen doc 
function genDocument(assignmentDetails, userDetails, generatedContent) {
    const sections = parseContentSections(generatedContent, assignmentDetails.title);

    return new Document({
        sections: [{
            properties: {},
            children: [
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ 
                        text: "Experiment", 
                        bold: true, 
                        size: 30, 
                        color: "2E74B5" 
                    })],
                }),
                new Paragraph({ text: "" }),

                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 },
                    children: [
                        new TextRun({
                            text: sections.title || assignmentDetails.title,
                            bold: true,
                            size: 34,
                        }),
                    ],
                }),

                horizontalLine(),

                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: {
                        top: { style: BorderStyle.SINGLE, size: 8, color: "4472C4" },
                        bottom: { style: BorderStyle.SINGLE, size: 8, color: "4472C4" },
                        left: { style: BorderStyle.SINGLE, size: 8, color: "4472C4" },
                        right: { style: BorderStyle.SINGLE, size: 8, color: "4472C4" },
                        insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "4472C4" },
                        insideVertical: { style: BorderStyle.SINGLE, size: 4, color: "4472C4" }
                    },
                    rows: [
                        ["Name", userDetails.name || "Student Name"],
                        ["UID", userDetails.rollNo || "Roll Number"],
                        ["Date", new Date().toLocaleDateString()],
                    ].map(([label, value]) =>
                        new TableRow({
                            height: { value: 400 },
                            children: [
                                new TableCell({
                                    children: [new Paragraph({
                                        children: [new TextRun({ 
                                            text: label, 
                                            bold: true,
                                            size: 24,
                                            color: "2E74B5"
                                        })],
                                        spacing: { before: 120, after: 120 }
                                    })],
                                    width: { size: 30, type: WidthType.PERCENTAGE },
                                    margins: { top: 100, bottom: 100, left: 100, right: 100 },
                                    shading: { fill: "F2F2F2" }
                                }),
                                new TableCell({
                                    children: [new Paragraph({
                                        children: [new TextRun({ 
                                            text: value,
                                            size: 24
                                        })],
                                        spacing: { before: 120, after: 120 }
                                    })],
                                    margins: { top: 100, bottom: 100, left: 100, right: 100 }
                                }),
                            ],
                        })
                    ),
                }),

                horizontalLine(),

                styledHeading("AIM"),
                ...createParagraphsFromText(sections.aim || ""),
                horizontalLine(),

                styledHeading("PROCEDURE / ALGORITHM"),
                ...createParagraphsFromText(sections.algorithm || ""),
                horizontalLine(),

                styledHeading("CODE"),
                ...createParagraphsFromText(sections.code || ""),
                horizontalLine(),

                styledHeading("OBSERVATION TABLE"),
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        ["Input", "Expected Output", "Actual Output"].map(col =>
                            new TableCell({
                                children: [new Paragraph({ 
                                    children: [new TextRun({ text: col, bold: true })] 
                                })],
                            })
                        ),
                        ["", "", ""].map(() => 
                            new TableCell({ 
                                children: [new Paragraph("")] 
                            })
                        ),
                    ].map(row => new TableRow({ children: row })),
                }),
                horizontalLine(),

                styledHeading("SCREENSHOTS & DIAGRAMS"),
                new Paragraph({
                    children: [new TextRun({ 
                        text: "[This section will include relevant screenshots or diagrams]", 
                        italics: true 
                    })],
                }),
                horizontalLine(),

                styledHeading("CONCLUSION"),
                ...createParagraphsFromText(sections.conclusion || ""),
            ],
        }],
    });
}

//main 
async function processDocumentGeneration(job) {
    const { username, selectedAssignments, userDetails } = job.data;
    let browser = null;
    
    try {
        console.log(`Starting document generation for ${username}`);
        
        const cookies = await getValidSession(username);
        if (!cookies) {
            throw new Error('No valid session found. Please login first.');
        }
        
        browser = await getBrowser();
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            viewport: { width: 1280, height: 720 },
            ignoreHTTPSErrors: true
        });
        
        await context.addCookies(cookies);
        const page = await context.newPage();
        
        const tempDir = path.join(process.cwd(), 'temp', `${username}_${Date.now()}`);
        await fs.mkdir(tempDir, { recursive: true });
        
        const generatedFiles = [];
        const totalAssignments = selectedAssignments.length;
        
        for (let i = 0; i < selectedAssignments.length; i++) {
            const assignment = selectedAssignments[i];
            console.log(`Processing assignment ${i + 1}/${totalAssignments}: ${assignment.title}`);
            
            const assignmentDetails = await fetchAssignmentDetails(page, assignment, cookies, tempDir);
            
            console.log(`Generating AI content for: ${assignment.title}`);
            const generatedContent = await generateAssignmentContent(
                {
                    title: assignmentDetails.title,
                    description: assignmentDetails.description,
                    fileContent: assignmentDetails.fileContent
                },
                userDetails.name,
                userDetails.rollNo,
                process.env.GOOGLE_AI_API_KEY
            );
            
            console.log(`Creating document for: ${assignment.title}`);
            const doc = genDocument(assignmentDetails, userDetails, generatedContent);
            const buffer = await Packer.toBuffer(doc);
            
            const sanitizedTitle = assignmentDetails.title
                .replace(/[^a-zA-Z0-9\s]/g, '')
                .replace(/\s+/g, '-')
                .substring(0, 50);
            const fileName = `${username}-${sanitizedTitle}-${Date.now()}.docx`;
            
            const { data, error } = await supabase.storage
                .from('gendocs')
                .upload(`assignments/${fileName}`, buffer, {
                    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                });
            
            if (error) {
                throw new Error(`Failed to upload ${assignmentDetails.title}: ${error.message}`);
            }
            
            const { data: urlData } = supabase.storage
                .from('gendocs')
                .getPublicUrl(`assignments/${fileName}`);
            
            generatedFiles.push({
                assignmentTitle: assignmentDetails.title,
                fileName: fileName,
                downloadUrl: urlData.publicUrl,
                fileSize: buffer.length
            });
            
            job.progress(Math.round(((i + 1) / totalAssignments) * 100));
        }
        
        await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
        
        await page.close();
        await context.close();
        
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 30);
        
        await supabase.from('document_jobs').insert({
            username,
            assignment_ids: selectedAssignments.map(a => a.id),
            status: 'completed',
            file_urls: generatedFiles,
            expires_at: expiresAt.toISOString(),
            created_at: new Date().toISOString()
        });
        
        console.log(`Document generation completed: ${generatedFiles.length} professional documents created`);
        
        return {
            success: true,
            generatedFiles,
            totalFiles: generatedFiles.length,
            expiresAt: expiresAt.toISOString()
        };
        
    } catch (error) {
        console.error(`Document generation error for ${username}:`, error.message);
        throw error;
    } finally {
        if (browser) {
            releaseBrowser(browser);
        }
    }
}

documentGenQueue.process('generate-documents', 2, processDocumentGeneration);
console.log(' document generation worker initialized');
