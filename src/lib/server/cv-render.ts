import { render } from 'svelte/server';
import CVTemplate from '$lib/components/cv/CVTemplate.svelte';
import type { CVData } from '$lib/types/cv';

/**
 * Renders the CV Svelte component to an HTML string suitable for Puppeteer PDF generation.
 * @param cvData - The CV JSON output from the LLM
 * @param masterJson - The master.json candidate profile
 * @returns HTML string ready to be passed to Puppeteer
 */
export function renderCVToHTML(cvData: CVData, masterJson: any): string {
  try {
    const { html } = render(CVTemplate, {
      props: {
        cv: cvData,
        master: masterJson
      }
    });

    // Wrap in a complete HTML document with doctype and head for Puppeteer
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${masterJson.personal.firstName} ${masterJson.personal.lastName} — ${cvData.headline}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    html, body {
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
${html}
</body>
</html>`;
  } catch (err) {
    console.error('Failed to render CV template:', err);
    throw new Error(`CV template rendering failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}
