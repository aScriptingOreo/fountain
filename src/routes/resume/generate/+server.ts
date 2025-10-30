import type { RequestHandler } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';
import { defaultLLMCache } from '$lib/server/llm-cache';
import { getCachedJSON, setCachedJSON } from '$lib/server/llm-file-cache';
import { createHash } from 'crypto';
import { renderCVToHTML } from '$lib/server/cv-render';
import { renderCVDataToPDF, renderCoverLetterToPDF } from '$lib/server/cv-to-pdf';
import { checkPuppeteerDependencies } from '$lib/server/puppeteer-check';

// Note: this endpoint expects environment variables for the Gemini LLM call:
// GEMINI_ENDPOINT - full URL to POST to (e.g. your proxy or Google Vertex endpoint)
// GEMINI_API_KEY - bearer token for the Gemini API
// GEMINI_MODEL - optional model identifier to include in the request body (if your endpoint requires)
//
// PDF generation uses PDFKit + jsdom (no Chromium required, pure Node.js)

// Try to load a local .env file only if the GEMINI env vars are not already present.
async function loadEnvFallback() {
  if (process.env.GEMINI_ENDPOINT && process.env.GEMINI_API_KEY) return;
  try {
    // dynamic import so dotenv is optional at runtime
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const dotenv = await import('dotenv');
    const envPath = path.join(process.cwd(), '.env');
    // only attempt if .env exists
    try {
      await fs.access(envPath);
      dotenv.config({ path: envPath });
    } catch (e) {
      // no .env file found — ignore
    }
  } catch (e) {
    // dotenv not installed or failed to import — ignore and rely on process.env
  }
}

async function callGemini(prompt: string, modelOverride?: string, temperature: number = 0.2): Promise<string> {
  await loadEnvFallback();

  const model = modelOverride || process.env.GEMINI_MODEL || process.env.GOOGLE_GENAI_MODEL;

  // Try using the official Google GenAI client if it's available. This client
  // auto-resolves endpoints/credentials (Application Default Credentials or
  // GOOGLE_API_KEY if set). If it isn't available or fails, fallback to the
  // previous generic fetch flow that posts to GEMINI_ENDPOINT.
  try {
    // dynamic import so deployments without the library won't crash
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const genai = await import('@google/genai');
    const GoogleGenAI = genai.GoogleGenAI || genai.default?.GoogleGenAI || genai.default || genai;

    // Instantiate without options so the library can pick up ADC or env vars.
    const ai = new GoogleGenAI({});

    // The client may expect different shapes; we'll try the model.generateContent
    // style used in simple examples. If the returned object differs, try to
    // extract a text field.
    // If model is undefined, the client may use a default; otherwise pass it.
    const payload: any = { model };
    // Some SDK variants expect 'contents' as a string, others as an array.
    payload.contents = prompt;
    // Add temperature for consistent, deterministic outputs
    payload.generationConfig = {
      temperature: temperature
    };

    const response = await ai.models.generateContent(payload as any);

    // Attempt to extract obvious text fields from the client response.
    if (!response) throw new Error('Empty response from Google GenAI client');
    if (typeof response === 'string') return response;
    if (response.text) return response.text;
    if (response.output && Array.isArray(response.output) && response.output[0]?.content) return response.output[0].content;
    if (response.candidates && Array.isArray(response.candidates) && response.candidates[0]?.content) return response.candidates[0].content;
    // Fallback: try stringify
    return JSON.stringify(response);
  } catch (err) {
    // If any error occurs (library not installed, auth missing, incompatible API),
    // fallback to existing fetch-based flow that uses GEMINI_ENDPOINT + GEMINI_API_KEY.
    // This keeps behavior backward-compatible.
    // console.warn('Google GenAI client unavailable or failed, falling back to GEMINI_ENDPOINT', err);
  }

  // Fallback: use GEMINI_ENDPOINT and GEMINI_API_KEY like before
  const endpoint = process.env.GEMINI_ENDPOINT;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!endpoint || !apiKey) {
    throw new Error('Neither Google GenAI client could be used nor GEMINI_ENDPOINT/GEMINI_API_KEY are set.');
  }

  const body = {
    model: model || undefined,
    prompt,
    temperature
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini call failed: ${res.status} ${text}`);
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const json = await res.json();
    if (json.output && Array.isArray(json.output) && json.output[0]?.content) return json.output[0].content;
    if (json.candidates && Array.isArray(json.candidates) && json.candidates[0]?.content) return json.candidates[0].content;
    if (json.text) return json.text;
    return JSON.stringify(json);
  }

  return await res.text();
}

function buildPrompt(masterJson: any, clientPrompt: string) {
  return `You are an expert resume writer and persuasive copywriter. You will produce a single JSON object ONLY (no prose) matching the exact template schema provided below. This JSON will be rendered into a professional CV. Do NOT add any other fields or deviate from the schema.

Template schema (JSON example):
{
  "details": {
    "name": "John Doe",
    "role": "Senior Software Engineer",
    "about": "Experienced full-stack engineer passionate about...",
    "email": "john@example.com",
    "phone": "+1-234-567-8900",
    "location": "San Francisco, CA",
    "website": "https://johndoe.dev",
    "github": "johndoe",
    "linkedin": "johndoe"
  },
  "workExp": [
    {
      "company": "Tech Company Inc",
      "title": "Senior Engineer",
      "date": "2020 - Present",
      "desc": "- Led development of core features\n- Managed team of 5 engineers\n- Improved performance by 40%"
    }
  ],
  "education": [
    {
      "institution": "University Name",
      "date": "2016 - 2020",
      "qualification": "Bachelor of Science in Computer Science",
      "gpa": "3.8"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "desc": "Brief description of the project and your contribution",
      "link": "https://github.com/example/project"
    }
  ],
  "skills": [
    {"name": "TypeScript"},
    {"name": "React"},
    {"name": "Node.js"}
  ]
}

Requirements:
- Output ONLY valid JSON matching the schema exactly. No surrounding text, comments, or markdown.
- Use the provided master.json to populate details, pick the most relevant work experiences, education, projects, and skills based on the client request.
- For "workExp.desc", format as bullet points with "- " prefix, separated by newlines (e.g., "- Point 1\n- Point 2").
- The "about" field should be 2-3 sentences selling the candidate for the role.
- The "role" should be tailored to the position described in the client request.
- Only include 3-5 most relevant work experiences, 1-2 education entries, and 5-8 skills.
- CRITICAL: Skills MUST be selected from master.json's skills list. Do NOT invent skills not present in master.json.
- Include up to 3 most relevant projects if available.
- Respond in the same language as the client request (Portuguese if the request is in Portuguese, English if in English).

Candidate master.json:
${JSON.stringify(masterJson)}

Client request:
${clientPrompt}

Respond only with the valid JSON object matching the schema above.`;
}

function buildCoverPrompt(masterJson: any, clientPrompt: string, coverLetterData?: any) {
  const { hiringManager = null, company = null, companyAddress = null, language = 'english' } = coverLetterData || {};
  
  let letterHeader = '';
  
  // Add sender location (always from master)
  if (masterJson.personal.location) {
    letterHeader += `${masterJson.personal.location}\n`;
  }
  
  // Add date (always include)
  letterHeader += `[Today's Date]\n`;
  
  // Add recipient details only if provided
  if (hiringManager || company || companyAddress) {
    letterHeader += '\n';
    if (hiringManager) letterHeader += `${hiringManager}\n`;
    if (company) letterHeader += `${company}\n`;
    if (companyAddress) letterHeader += `${companyAddress}\n`;
    letterHeader += '\n';
  }

  const languageInstruction = language === 'portuguese' 
    ? 'Write ONLY in Portuguese. Use Portuguese greetings and closings.'
    : 'Write ONLY in English. Use English greetings and closings.';

  const greeting = language === 'portuguese'
    ? 'Prezado(a) [Use "Senhor(a)" if no name provided, otherwise use actual name],'
    : 'Dear [Use "Hiring Manager" if no name provided, otherwise use actual name],';

  const closing = language === 'portuguese'
    ? 'Atenciosamente,'
    : 'Sincerely,';
  
  return `${languageInstruction}

You are an expert cover letter writer and persuasive marketer. Your task is to write a professional cover letter that honestly represents ${masterJson.personal.firstName} ${masterJson.personal.lastName} based ONLY on their actual experience and skills from their master profile data.

OUTPUT FORMAT: Use ONLY plain text. Do NOT use markdown, asterisks, bold formatting, or any special characters. Write everything as simple, clean text. Every word must be in the selected language - no mixing languages.

CRITICAL INSTRUCTIONS:
1. ONLY mention experience, skills, and projects that actually exist in the master.json data.
2. DO NOT fabricate or exaggerate experience to match the job requirements.
3. Instead, find genuine parallels and transferable knowledge between the candidate's actual experience and the role requirements.
4. Example: If the role requires Kubernetes but the candidate has Docker experience, mention Docker and explain how containerization knowledge transfers, but do NOT claim Kubernetes experience.
5. Focus on demonstrated problem-solving abilities, methodologies, and technical thinking that apply to the role.
6. Be honest about what the candidate HAS done, not what the job posting NEEDS.

Letter Header (use actual values only, omit placeholders):
${letterHeader}

Then continue with:
${greeting}

[Body of cover letter highlighting ACTUAL experience and honest parallels to the role]

${closing}
${masterJson.personal.firstName} ${masterJson.personal.lastName}

Candidate's Actual Profile Data:
${JSON.stringify(masterJson, null, 2)}

Job Opportunity Description (for finding parallels, NOT for exaggeration):
${clientPrompt}

Your approach should be:
- Start with the candidate's genuine value proposition from master.json
- Find honest connections between their real experience and the role's needs
- Highlight transferable skills and methodologies
- Show how their proven capabilities make them capable of learning/adapting
- NEVER claim expertise or experience they don't have
- NEVER include placeholder fields like [Date], [Hiring Manager], [Company Address], or [Company Name]

Write a compelling cover letter that is truthful, professional, and convincing through authenticity rather than false claims.`;
}

function renderHtmlFromCv(cv: any, master: any) {
  // Use the Svelte-based CV template renderer
  return renderCVToHTML(cv, master);
}

export const POST: RequestHandler = async ({ request }) => {
  try {
  const body = await request.json();
  const prompt = body?.prompt;
  const type = (body?.type as string) || 'cv';
  const coverLetterData = body?.coverLetterData;
    console.log('[resume/generate] request received');
    console.log('[resume/generate] prompt length:', prompt ? String(prompt).length : 0);

    if (!prompt || !prompt.trim()) {
      return new Response(JSON.stringify({ error: 'prompt required' }), { status: 400 });
    }

    const masterPath = path.join(process.cwd(), 'src', 'lib', 'data', 'master.json');
    const masterRaw = await fs.readFile(masterPath, 'utf-8');
    const masterJson = JSON.parse(masterRaw);

  // Build a type-specific full prompt (includes master JSON)
  const fullPrompt = type === 'cover' ? buildCoverPrompt(masterJson, prompt, coverLetterData) : buildPrompt(masterJson, prompt);

      // Determine model for cache key
      const model = process.env.GEMINI_MODEL || process.env.GOOGLE_GENAI_MODEL;

      // Check cache first (unless client requests a force refresh).
      // For simplicity, clients can force bypassing the cache by sending header 'x-force-llm: 1'
      const force = (request.headers.get('x-force-llm') === '1') || (process.env.FORCE_LLM === '1');

      // Compute a stable cache key based on model + prompt (fullPrompt includes master.json)
      const hash = (input: string) => createHash('sha256').update(input).digest('hex');
      const cacheKey = hash(`${model || ''}|${fullPrompt}`);

        // First, try the persistent file cache which stores parsed JSON outputs
        let parsed: any = null;
        if (!force) {
          try {
            const fileCached = await getCachedJSON(cacheKey);
            if (fileCached) {
              parsed = fileCached;
              console.log('[resume/generate] using file-cached parsed JSON');
            }
          } catch (e) {
            console.warn('[resume/generate] file cache read failed:', e);
          }
        }

        // If not found in file cache, try the in-memory raw cache -> parse -> persist
        if (!parsed) {
          let llmOutput: string | null = null;
          if (!force) {
            try {
              llmOutput = defaultLLMCache.get(cacheKey);
              if (llmOutput) console.log('[resume/generate] using memory-cached LLM raw response');
            } catch (e) {
              console.warn('[resume/generate] memory cache read failed:', e);
              llmOutput = null;
            }
          }

          if (!llmOutput) {
            // call the Gemini API with low temperature for deterministic outputs
            // CV output (JSON) uses 0.1 for maximum consistency
            // Cover letters use 0.3 for slightly more natural language variation
            const temperature = type === 'cover' ? 0.3 : 0.1;
            llmOutput = await callGemini(fullPrompt, model, temperature);
            // cache the raw output in memory for speed
            try {
              await defaultLLMCache.set(cacheKey, llmOutput);
            } catch (e) {
              console.warn('[resume/generate] memory cache write failed:', e);
            }
          }

          // For cover letters, the output is plain text, not JSON
          if (type === 'cover') {
            parsed = llmOutput;
          } else {
            // For CV, the model should return JSON. Try to parse it gracefully.
            try {
              parsed = JSON.parse(llmOutput as string);
            } catch (err) {
              // If parsing fails, try to find a JSON substring
              const jsonMatch = String(llmOutput).match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                try {
                  parsed = JSON.parse(jsonMatch[0]);
                } catch (e) {
                  throw new Error('LLM returned invalid JSON.');
                }
              } else {
                throw new Error('LLM returned non-JSON output.');
              }
            }
          }

          // Persist parsed JSON to the file cache for future requests
          try {
            await setCachedJSON(cacheKey, parsed);
          } catch (e) {
            console.warn('[resume/generate] file cache write failed:', e);
          }
        }

      if (type === 'cover') {
        // parsed may be a string (cover letter text) or structured; coerce to text
        const coverText = typeof parsed === 'string' ? parsed : JSON.stringify(parsed);
        const pdfBuffer = await renderCoverLetterToPDF(coverText, masterJson);
        console.log('[resume/generate] cover PDF generated (bytes=', pdfBuffer.length, ')');
        return new Response(pdfBuffer, { status: 200, headers: { 'Content-Type': 'application/pdf', 'Content-Length': String(pdfBuffer.length) } });
      }

      console.log('[resume/generate] parsed LLM output, generating PDF from structured JSON');
      // Directly render PDF from the structured CV JSON (no HTML parsing required)
      const pdfBuffer = await renderCVDataToPDF(parsed as any, masterJson);

      console.log('[resume/generate] PDF generated (bytes=', pdfBuffer.length, ')');

      return new Response(pdfBuffer, { status: 200, headers: { 'Content-Type': 'application/pdf', 'Content-Length': String(pdfBuffer.length) } });
  } catch (err: any) {
    console.error('[resume/generate] error:', err);

    // Check for Puppeteer-specific launch errors (missing system libraries)
    const errMsg = String(err?.message || err);
    if (errMsg.includes('libnspr4') || errMsg.includes('Failed to launch')) {
      const depCheck = checkPuppeteerDependencies();
      if (!depCheck.ok) {
        console.error('[resume/generate] Puppeteer dependency check:', depCheck.message);
        return new Response(depCheck.message, { status: 500 });
      }
    }

    return new Response(String(err?.message || err), { status: 500 });
  }
};
