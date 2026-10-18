import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

// Palette pulled from app/globals.css so the PDF matches the site.
const INK = rgb(0.169, 0.106, 0.290); // #2B1B4A
const GOLD = rgb(0.722, 0.580, 0.373); // #B8935F
const CREAM = rgb(0.988, 0.976, 0.949);
const INK_SOFT = rgb(0.4, 0.36, 0.47);

type CertificateData = {
  studentName: string;
  courseTitle: string;
  issuedDate: Date;
  certificateId: string;
};

function drawCenteredText(
  page: PDFPage,
  text: string,
  font: PDFFont,
  size: number,
  y: number,
  color = INK
) {
  const width = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: (page.getWidth() - width) / 2, y, size, font, color });
}

export async function generateCertificatePdf(data: CertificateData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([842, 595]); // A4 landscape

  const serif = await doc.embedFont(StandardFonts.TimesRomanBold);
  const serifItalic = await doc.embedFont(StandardFonts.TimesRomanItalic);
  const sans = await doc.embedFont(StandardFonts.Helvetica);
  const sansBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const { width, height } = page.getSize();

  // Background + border
  page.drawRectangle({ x: 0, y: 0, width, height, color: CREAM });
  page.drawRectangle({
    x: 24,
    y: 24,
    width: width - 48,
    height: height - 48,
    borderColor: GOLD,
    borderWidth: 2,
  });
  page.drawRectangle({
    x: 34,
    y: 34,
    width: width - 68,
    height: height - 68,
    borderColor: INK,
    borderWidth: 0.75,
  });

  // Eyebrow
  drawCenteredText(page, "C E R T I F I C A T E   O F   C O M P L E T I O N", sans, 13, height - 110, rgb(0.6, 0.48, 0.3));

  // Brand
  drawCenteredText(page, "Preeti Soulpreneur", serifItalic, 22, height - 145, INK);

  // "This certifies that"
  drawCenteredText(page, "This certifies that", sans, 14, height - 210, INK_SOFT);

  // Student name — big
  drawCenteredText(page, data.studentName, serif, 34, height - 255, INK);

  // Underline flourish under name
  const nameWidth = serif.widthOfTextAtSize(data.studentName, 34);
  page.drawLine({
    start: { x: (width - nameWidth) / 2 - 20, y: height - 268 },
    end: { x: (width + nameWidth) / 2 + 20, y: height - 268 },
    thickness: 1,
    color: GOLD,
  });

  // Completion line
  drawCenteredText(page, "has successfully completed the course", sans, 14, height - 300, INK_SOFT);
  drawCenteredText(page, data.courseTitle, sansBold, 20, height - 335, INK);

  // Date
  const dateStr = data.issuedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  drawCenteredText(page, `Issued on ${dateStr}`, sans, 12, height - 380, INK_SOFT);

  // Footer: signature line + certificate id
  const footerY = 90;
  page.drawLine({ start: { x: width / 2 - 90, y: footerY }, end: { x: width / 2 + 90, y: footerY }, thickness: 1, color: INK });
  drawCenteredText(page, "Preeti — Founder & Lead Coach", sans, 11, footerY - 16, INK_SOFT);

  page.drawText(`Certificate ID: ${data.certificateId}`, {
    x: 50,
    y: 45,
    size: 8,
    font: sans,
    color: INK_SOFT,
  });

  return doc.save();
}
