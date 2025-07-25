import { GoogleGenerativeAI } from '@google/generative-ai';

const sanitize = (str) => str?.replace(/[`$<>]/g, '').trim() || '';

const MAX_CONTENT_LENGTH = 150000;

function buildPrompt({ title, fullTitle, fileContent, NAME, UID }) {
  return `
You are an expert academic writer and engineering student. Generate a comprehensive, professional assignment/experiment report for an engineering student.

**Student Details:**
- Name: ${NAME}
- UID: ${UID}

**Assignment Details:**
- Title: ${title || "Untitled Assignment"}
- Description: ${fullTitle || title || "N/A"}

**Reference Material:**
${fileContent ? `Use this technical content as reference (extract key concepts, algorithms, and implementation details):

${fileContent}` : "No additional reference material provided."}

**CRITICAL FORMATTING INSTRUCTIONS:**
1. Section headers MUST be written EXACTLY as shown (case-sensitive)
2. For CODE section: provide clean, executable code without any markdown formatting
3. Use **bold text** for important terms and concepts (this will be properly formatted)
4. Write in academic style suitable for engineering assignments
5. Make content substantial and technically accurate

Generate a complete report following this EXACT structure:

TITLE:
[Provide a clear, professional title for this assignment/experiment]

AIM:
[Write 2-3 sentences explaining the objective and learning outcomes. Use **bold** for key concepts. Make it specific to the assignment topic. It should sound like a student has written.]

ALGORITHM:
[Provide step-by-step procedure or algorithm. Number the steps clearly. Include:
- Detailed implementation steps
- Expected outcomes at each stage
Use **bold** for important technical terms.]

CODE:
[Provide complete 2-4 line prompt that user should use to generate the required code as per assignment.]

CONCLUSION:
[Summarize key learnings, practical applications, and insights gained. Include:
- Overall assessment of the assignment objectives
Only 1 paragraph of conclusion not more than 8 lines. It should sound like student has written the conclusion based on his understanding.
Use **bold** for main takeaways.]

**Quality Requirements:**
- Make content technically accurate and educationally valuable
- Ensure each section is substantial (minimum 50-100 words per section)
- Use proper engineering terminology
- Include specific details relevant to the assignment topic
- Write at undergraduate engineering level
`.trim();
}

export async function generateAssignmentContent(assignmentInfo, NAME, UID, API_KEY) {
  if (!API_KEY) API_KEY = process.env.GOOGLE_AI_API_KEY;
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const rawContent = sanitize(assignmentInfo.fileContent || '');
    const trimmedContent = rawContent.length > MAX_CONTENT_LENGTH
      ? rawContent.slice(0, MAX_CONTENT_LENGTH) + '\n[Truncated]'
      : rawContent;
      
    const prompt = buildPrompt({
      title: sanitize(assignmentInfo.title),
      fullTitle: sanitize(assignmentInfo.description),
      fileContent: trimmedContent,
      NAME,
      UID,
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error(`Error generating content: ${error.message}`);
    return `TITLE:\n${assignmentInfo.title || "Untitled Assignment"}\n\nUnable to generate due to error: ${error.message}`;
  }
}


export async function generateMultipleAssignments(assignmentInfos, NAME, UID, API_KEY) {
  const BATCH_SIZE = 4;
  const results = [];

  for (let i = 0; i < assignmentInfos.length; i += BATCH_SIZE) {
    const batch = assignmentInfos.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(batch.map((assignmentInfo, index) =>
      new Promise(async (resolve) => {
        await new Promise(r => setTimeout(r, index * 800));
        resolve(await generateAssignmentContent(assignmentInfo, NAME, UID, API_KEY));
      })
    ));
    results.push(...batchResults);
  }
  return results;
}
