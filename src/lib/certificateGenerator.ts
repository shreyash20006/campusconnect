import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Converts hex color strings (e.g. #f59e0b) to pdf-lib RGB fractions.
 */
function hexToRgbColor(hex: string) {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex[0] + cleanHex[0] + cleanHex[1] + cleanHex[1] + cleanHex[2] + cleanHex[2];
  }
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255 || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255 || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255 || 0;
  return rgb(r, g, b);
}

/**
 * Compiles a dynamic certificate PDF with backgrounds, text overlays, and QR stamps.
 */
export async function generateCertificatePdf(
  backgroundBase64OrUrl: string | null,
  studentName: string,
  eventTitle: string,
  certificateId: string,
  qrCodeBase64: string | null,
  blocks: any[]
): Promise<Uint8Array> {
  // Create a landscape page (842 x 595 pt is standard A4 landscape)
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]);
  const { width, height } = page.getSize();

  // Draw background image if configured
  if (backgroundBase64OrUrl) {
    try {
      if (backgroundBase64OrUrl.startsWith('data:image/')) {
        const imageBytes = await fetch(backgroundBase64OrUrl).then((res) => res.arrayBuffer());
        let embeddedImage;
        if (backgroundBase64OrUrl.includes('image/png')) {
          embeddedImage = await pdfDoc.embedPng(imageBytes);
        } else {
          embeddedImage = await pdfDoc.embedJpg(imageBytes);
        }
        page.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: width,
          height: height,
        });
      }
    } catch (e) {
      console.error('Failed to embed Canva background image:', e);
    }
  } else {
    // Fallback: draw a solid dark luxury background
    page.drawRectangle({
      x: 0,
      y: 0,
      width: width,
      height: height,
      color: rgb(0.05, 0.05, 0.06), // dark charcoal
    });
    // Draw gold corners border
    page.drawRectangle({
      x: 20,
      y: 20,
      width: width - 40,
      height: height - 40,
      borderColor: rgb(0.96, 0.62, 0.04), // amber/gold border
      borderWidth: 2,
    });
  }

  // Load standard fonts
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

  // Loop over configured blocks
  for (const block of blocks) {
    // Convert percentage layout to pdf-lib coordinate points (Y axis is inverted in pdf-lib)
    const drawX = (block.x * width) / 100;
    const drawY = height - ((block.y * height) / 100);

    // Dynamic Text overlays
    if (block.id !== 'b-logo' && block.id !== 'b-sign' && block.id !== 'b-qr') {
      let drawText = block.text;
      if (drawText === '{{student_name}}') drawText = studentName;
      if (drawText === '{{event_title}}') drawText = eventTitle;
      if (drawText.includes('{{certificate_id}}')) {
        drawText = drawText.replace('{{certificate_id}}', certificateId);
      }

      if (!drawText) continue;

      const font = block.isBold ? boldFont : regularFont;
      const textWidth = font.widthOfTextAtSize(drawText, block.fontSize);

      page.drawText(drawText, {
        x: drawX - textWidth / 2, // Horizontally center alignment
        y: drawY,
        size: block.fontSize,
        font: font,
        color: hexToRgbColor(block.color),
      });
    }

    // Dynamic QR Verification stamp
    if (block.id === 'b-qr' && qrCodeBase64) {
      try {
        if (qrCodeBase64.startsWith('data:image/')) {
          const qrBytes = await fetch(qrCodeBase64).then((res) => res.arrayBuffer());
          const qrImage = await pdfDoc.embedPng(qrBytes);
          const qrSize = 54; // standard QR stamp size in pt
          page.drawImage(qrImage, {
            x: drawX - qrSize / 2,
            y: drawY - qrSize / 2,
            width: qrSize,
            height: qrSize,
          });
        }
      } catch (err) {
        console.error('Failed to embed QR stamp in PDF:', err);
      }
    }
  }

  return await pdfDoc.save();
}
