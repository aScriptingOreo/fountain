import PDFDocument from 'pdfkit';
import type { CVData } from '$lib/types/cv';

/**
 * Helper function to parse bullet points from newline-separated text
 */
function parseBullets(text: string): string[] {
  if (!text) return [];
  return text
    .split('\n')
    .map((line) => line.replace(/^[-•]\s*/, '').trim())
    .filter((line) => line.length > 0);
}

/**
 * Render CV JSON data to PDF using PDFKit with structured layout (tile template inspired)
 */
export async function renderCVDataToPDF(cv: CVData, master: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 0, bufferPages: true });
      const chunks: Buffer[] = [];

      doc.on('data', (c: Buffer) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const margin = 24;
      const contentWidth = doc.page.width - margin * 2;
      const topMargin = 120; // Space for header

      // Draw header
      drawHeader(doc, cv, master);

      // Main content area starts after header (single column)
      let yPos = topMargin + margin;

      // Draw all sections in single column
      yPos = drawAbout(doc, cv, margin, yPos, contentWidth);
      yPos = drawExperience(doc, cv, margin, yPos, contentWidth);
      yPos = drawEducation(doc, cv, margin, yPos, contentWidth);
      yPos = drawSkills(doc, cv, margin, yPos, contentWidth);
      yPos = drawProjects(doc, cv, margin, yPos, contentWidth);

      // PDFKit will auto-paginate if needed
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

function drawHeader(doc: any, cv: CVData, master: any) {
  const headerHeight = 120;

  // Blue gradient background
  doc.rect(0, 0, doc.page.width, headerHeight).fill('#1e40af');

  // Name
  doc.fontSize(28).font('Helvetica-Bold').fillColor('white');
  doc.text(cv.details.name || `${master.personal.firstName} ${master.personal.lastName}`, 24, 14, {
    width: doc.page.width - 48
  });

  // Role
  if (cv.details.role) {
    doc.fontSize(14).font('Helvetica').fillColor('rgba(255,255,255,0.9)');
    doc.text(cv.details.role, 24, 44, { width: doc.page.width - 48 });
  }

  // Location + suffix
  let subtitle = '';
  if (master.personal.location) subtitle += master.personal.location;
  if (master.personal.suffix) subtitle += ' • ' + master.personal.suffix;

  if (subtitle) {
    doc.fontSize(10).fillColor('rgba(255,255,255,0.8)');
    doc.text(subtitle, 24, 62, { width: doc.page.width - 48 });
  }

  // Contact links from master.json
  const links: string[] = [];
  if (master.personal.github) links.push(master.personal.github);
  if (master.personal.linkedin) links.push('LinkedIn');
  if (master.personal.email) links.push(master.personal.email);
  if (master.personal.phone) links.push(master.personal.phone);

  if (links.length > 0) {
    doc.fontSize(9).fillColor('rgba(255,255,255,0.7)');
    doc.text(links.join(' • '), 24, 78, { width: doc.page.width - 48 });
  }

  // Divider line
  doc.moveTo(24, headerHeight - 1).lineTo(doc.page.width - 24, headerHeight - 1).stroke('#e0e0e0');
}

function drawSection(doc: any, title: string, x: number, y: number, width: number): number {
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e40af');
  doc.text(title, x, y, { width: width });

  // Underline
  const titleHeight = 12;
  const lineY = y + titleHeight + 2;
  doc.strokeColor('#1e40af').lineWidth(1);
  doc.moveTo(x, lineY).lineTo(x + width, lineY).stroke();
  doc.strokeColor('#000').lineWidth(0.5);

  return lineY + 8;
}

function drawAbout(doc: any, cv: CVData, x: number, y: number, width: number): number {
  if (!cv.details.about) return y;

  const sectionY = drawSection(doc, 'SUMMARY', x, y, width);
  doc.fontSize(10).font('Helvetica').fillColor('#333');
  doc.text(cv.details.about, x, sectionY, { width: width, align: 'left' });
  return doc.y + 14;
}

function drawExperience(doc: any, cv: CVData, x: number, y: number, width: number): number {
  if (!cv.workExp || cv.workExp.length === 0) return y;

  const sectionY = drawSection(doc, 'EXPERIENCE', x, y, width);
  let currentY = sectionY;
  doc.fontSize(9);

  cv.workExp.forEach((work, idx) => {
    if (idx > 0) currentY += 8;

    // Company and title on same line
    doc.font('Helvetica-Bold').fillColor('#000').fontSize(9);
    doc.text(`${work.company} — ${work.title}`, x, currentY);
    currentY += 11;

    // Date
    doc.fontSize(8).fillColor('#666').font('Helvetica');
    doc.text(work.date, x, currentY);
    currentY += 7;

    // Bullets
    if (work.desc) {
      const bullets = parseBullets(work.desc);
      doc.fontSize(8).fillColor('#333');
      bullets.forEach((bullet) => {
        doc.text('• ' + bullet, x + 12, currentY, { width: width - 12 });
        currentY = doc.y + 2;
      });
    }
  });

  return currentY + 10;
}

function drawEducation(doc: any, cv: CVData, x: number, y: number, width: number): number {
  if (!cv.education || cv.education.length === 0) return y;

  const sectionY = drawSection(doc, 'EDUCATION', x, y, width);
  let currentY = sectionY;

  cv.education.forEach((edu, idx) => {
    if (idx > 0) currentY += 8;

    // Institution
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#000');
    doc.text(edu.institution, x, currentY);
    currentY += 10;

    // Qualification
    doc.fontSize(8).font('Helvetica').fillColor('#333');
    doc.text(edu.qualification, x, currentY);
    currentY += 8;

    // Date
    if (edu.date) {
      doc.fontSize(8).fillColor('#666');
      doc.text(edu.date, x, currentY);
      currentY += 8;
    }
  });

  return currentY + 6;
}

function drawSkills(doc: any, cv: CVData, x: number, y: number, width: number): number {
  if (!cv.skills || cv.skills.length === 0) return y;

  const sectionY = drawSection(doc, 'SKILLS', x, y, width);
  let currentY = sectionY;

  doc.fontSize(9).font('Helvetica').fillColor('#333');
  cv.skills.forEach((skill) => {
    doc.text('• ' + skill.name, x, currentY);
    currentY += 10;
  });

  return currentY + 6;
}

function drawProjects(doc: any, cv: CVData, x: number, y: number, width: number): number {
  if (!cv.projects || cv.projects.length === 0) return y;

  const sectionY = drawSection(doc, 'PROJECTS', x, y, width);
  let currentY = sectionY;

  cv.projects.forEach((project, idx) => {
    if (idx > 0) currentY += 8;

    // Project name
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#000');
    doc.text(project.name, x, currentY);
    currentY += 10;

    // Link
    if (project.link) {
      doc.fontSize(8).fillColor('#1e40af').font('Helvetica');
      doc.text(project.link, x, currentY);
      currentY += 8;
    }

    // Description
    doc.fontSize(8).fillColor('#333').font('Helvetica');
    doc.text(project.desc, x, currentY, { width: width });
    currentY = doc.y + 2;
  });

  return currentY + 6;
}

function drawSidebar(doc: any, cv: CVData, x: number, y: number, width: number): number {
  // Deprecated - kept for compatibility
  return y;
}

function drawMainContent(doc: any, cv: CVData, x: number, y: number, width: number): number {
  // Deprecated - kept for compatibility
  return y;
}

export async function renderCoverLetterToPDF(text: string, master: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 0, bufferPages: true });
      const chunks: Buffer[] = [];

      doc.on('data', (c: Buffer) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const margin = 36;
      const pageWidth = doc.page.width - margin * 2;

      // Header
      const headerHeight = 120;
      doc.rect(0, 0, doc.page.width, headerHeight).fill('#1e40af');

      doc.fontSize(28).font('Helvetica-Bold').fillColor('white');
      doc.text(`${master.personal.firstName} ${master.personal.lastName}`, margin, 20, {
        width: pageWidth
      });

      doc.fontSize(14).font('Helvetica').fillColor('rgba(255,255,255,0.9)');
      doc.text(master.personal.title || '', margin, 50, { width: pageWidth });

      const subtitle =
        master.personal.location + (master.personal.suffix ? ' • ' + master.personal.suffix : '');
      doc.fontSize(11).fillColor('rgba(255,255,255,0.8)');
      doc.text(subtitle, margin, 70, { width: pageWidth });

      // Body
      doc.y = headerHeight + margin;
      doc.fontSize(11).font('Helvetica').fillColor('#333');

      const paragraphs = String(text || '')
        .split(/\n\s*\n/)
        .filter((p) => p.trim().length > 0);

      paragraphs.forEach((p: string, i: number) => {
        doc.text(p.trim(), margin, doc.y, { width: pageWidth, align: 'justify' });
        if (i < paragraphs.length - 1) doc.moveDown(0.6);
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

