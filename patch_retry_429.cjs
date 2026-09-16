const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const newRetryFunc = `async function generateContentWithRetry(ai: GoogleGenAI, params: any, maxRetries = 3): Promise<any> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (error: any) {
      const is503 = error?.status === 503 || (error?.error && error?.error?.code === 503) || error?.message?.includes('503') || error?.message?.includes('UNAVAILABLE');
      const is429 = error?.status === 429 || (error?.error && error?.error?.code === 429) || error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED');
      
      // Do not retry 429 (quota exhausted) - throw immediately to trigger fallback and save user time
      if (is429) {
        console.warn(\`Gemini API Quota Exceeded (429). Falling back immediately.\`);
        throw error;
      }

      if (attempt === maxRetries) {
        throw error;
      }
      
      if (is503) {
        const delayMs = attempt * 1500;
        console.log(\`Gemini API returned 503, retrying in \${delayMs}ms (Attempt \${attempt} of \${maxRetries})...\`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        throw error;
      }
    }
  }
  throw new Error("Failed after max retries");
}`;

content = content.replace(/async function generateContentWithRetry\(ai: GoogleGenAI, params: any, maxRetries = 3\): Promise<any> \{[\s\S]*?\n\}/, newRetryFunc);

content = content.replace(/console\.error\('Gemini recipe suggestion error:', error\);/g, `
      const isQuotaOrUnavailable = error?.status === 429 || error?.status === 503 || error?.message?.includes('429') || error?.message?.includes('503');
      if (isQuotaOrUnavailable) {
        console.warn('Gemini API limit reached or unavailable. Seamlessly using local fallback.');
      } else {
        console.error('Gemini recipe suggestion error:', error?.message || error);
      }
`);

fs.writeFileSync('server.ts', content);
