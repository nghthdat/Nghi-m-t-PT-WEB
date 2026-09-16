const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(/async function generateContentWithRetry\(ai: GoogleGenAI, params: any, maxRetries = 3\) \{[\s\S]*?\n\}/, `async function generateContentWithRetry(ai: GoogleGenAI, params: any, maxRetries = 3): Promise<any> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (error: any) {
      if (attempt === maxRetries) {
        throw error;
      }
      const is503 = error?.status === 503 || (error?.error && error?.error?.code === 503) || error?.message?.includes('503') || error?.message?.includes('UNAVAILABLE');
      const is429 = error?.status === 429 || (error?.error && error?.error?.code === 429) || error?.message?.includes('429');
      
      if (is503 || is429) {
        const delayMs = attempt * 1500;
        console.log(\`Gemini API returned \${is503 ? '503' : '429'}, retrying in \${delayMs}ms (Attempt \${attempt} of \${maxRetries})...\`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        throw error;
      }
    }
  }
  throw new Error("Failed after max retries");
}`);

fs.writeFileSync('server.ts', content);
