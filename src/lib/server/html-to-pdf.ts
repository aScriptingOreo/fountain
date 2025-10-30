import PDFDocument from 'pdfkit';

interface CVSection {
  title: string;
  items?: { title: string; desc: string }[];
  text?: string;
}

/**
 * Extracts structured CV data from HTML using simple regex/DOM parsing.
 * Avoids jsdom complexity by working with the known HTML structure.
 */
function extractCVFromHTML(html: string) {
  // Extract title (h1)
  const titleMatch = html.match(/<h1[^>]*class="cv-name"[^>]*>([^<]+)<\/h1>/);
  const title = titleMatch ? titleMatch[1].trim() : 'Resume';

  // Extract headline (h2)
  const headlineMatch = html.match(/<h2[^>]*class="cv-headline"[^>]*>([^<]+)<\/h2>/);
  const headline = headlineMatch ? headlineMatch[1].trim() : '';

  // Extract subtitle
  const subtitleMatch = html.match(/<p[^>]*class="cv-subtitle"[^>]*>([^<]+)<\/p>/);
  const subtitle = subtitleMatch ? subtitleMatch[1].trim() : '';

  // Extract sections
  const sections: CVSection[] = [];
  const sectionRegex = /<section[^>]*class="cv-section"[^>]*>([\s\S]*?)<\/section>/g;
  let sectionMatch;

  while ((sectionMatch = sectionRegex.exec(html)) !== null) {
    const sectionHtml = sectionMatch[1];

    const titleMatch = sectionHtml.match(/<h3[^>]*class="cv-section-title"[^>]*>([^<]+)<\/h3>/);
    const sectionTitle = titleMatch ? titleMatch[1].trim() : '';

    if (!sectionTitle) continue;

    // Try to extract list items
    const items: { title: string; desc: string }[] = [];
    const itemRegex = /<li[^>]*class="cv-list-item"[^>]*>([\s\S]*?)<\/li>/g;
    let itemMatch;

    while ((itemMatch = itemRegex.exec(sectionHtml)) !== null) {
      const itemHtml = itemMatch[1];
      const itemTitleMatch = itemHtml.match(/<span[^>]*class="cv-list-title"[^>]*>([^<]+)<\/span>/);
      const itemDescMatch = itemHtml.match(/<span[^>]*class="cv-list-desc"[^>]*>([^<]+)<\/span>/);

      items.push({
        title: itemTitleMatch ? itemTitleMatch[1].trim() : '',
        desc: itemDescMatch ? itemDescMatch[1].trim() : ''
      });
    }

    // Try to extract skill items
    const skills: { title: string; desc: string }[] = [];
    const skillRegex = /<li[^>]*class="cv-skill-item"[^>]*>([\s\S]*?)<\/li>/g;
    let skillMatch;

    while ((skillMatch = skillRegex.exec(sectionHtml)) !== null) {
      const skillHtml = skillMatch[1];
      const skillNameMatch = skillHtml.match(/<span[^>]*class="cv-skill-name"[^>]*>([^<]+)<\/span>/);
      const skillReasonMatch = skillHtml.match(/<p[^>]*class="cv-skill-reason"[^>]*>([^<]+)<\/p>/);

      skills.push({
        title: skillNameMatch ? skillNameMatch[1].trim() : '',
        desc: skillReasonMatch ? skillReasonMatch[1].trim() : ''
      });
    }

    sections.push({
      title: sectionTitle,
      items: items.length > 0 ? items : skills.length > 0 ? skills : undefined
    });
  }

  return { title, headline, subtitle, sections };
}

/**
 * Converts structured CV data to a PDF buffer using PDFKit.
 * @param html - Complete HTML document string from Svelte component
 * @returns Promise<Buffer> containing the PDF
 */
export async function renderHTMLToPDF(html: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const cv = extractCVFromHTML(html);

      // Create PDF document
      const pdf = new PDFDocument({
        size: 'A4',
        margin: 35,
        bufferPages: true
      });

      const chunks: Buffer[] = [];
      pdf.on('data', (chunk: Buffer) => chunks.push(chunk));
      pdf.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      pdf.on('error', reject);

      // Helper to set font style
      const setStyle = (style: 'title' | 'heading' | 'body' | 'small') => {
        switch (style) {
          case 'title':
            pdf.fontSize(20).font('Helvetica-Bold');
            break;
          case 'heading':
            pdf.fontSize(11).font('Helvetica-Bold');
            break;
          case 'body':
            pdf.fontSize(9.5).font('Helvetica');
            break;
          case 'small':
            pdf.fontSize(8.5).font('Helvetica');
            break;
        }
      };

      // Header: name
      setStyle('title');
      pdf.text(cv.title, { align: 'left' });
      pdf.moveDown(0.1);

      // Header: headline
      if (cv.headline) {
        setStyle('heading');
        pdf.text(cv.headline, { align: 'left', color: '#555' });
      }

      // Header: subtitle (location, suffix)
      if (cv.subtitle) {
        setStyle('small');
        pdf.text(cv.subtitle, { align: 'left', color: '#777' });
      }

      pdf.moveDown(0.3);

      // Separator line
      pdf
        .moveTo(35, pdf.y)
        .lineTo(pdf.page.width - 35, pdf.y)
        .stroke('#ddd')
        .moveDown(0.2);

      // Sections
      cv.sections.forEach((section, idx) => {
        // Section title
        setStyle('heading');
        pdf.text(section.title.toUpperCase(), { align: 'left', color: '#000' });
        pdf.moveDown(0.15);

        // Section items
        if (section.items && section.items.length > 0) {
          section.items.forEach((item) => {
            if (item.title) {
              setStyle('body');
              pdf.text(item.title, { align: 'left', continued: false });
            }
            if (item.desc) {
              setStyle('small');
              pdf.text(item.desc, {
                align: 'left',
                indent: 10,
                color: '#555',
                lineGap: 1
              });
            }
            pdf.moveDown(0.1);
          });
        }

        // Add space between sections
        if (idx < cv.sections.length - 1) {
          pdf.moveDown(0.25);
        }
      });

      pdf.end();
    } catch (err) {
      console.error('[html-to-pdf] error:', err);
      reject(err);
    }
  });
}
