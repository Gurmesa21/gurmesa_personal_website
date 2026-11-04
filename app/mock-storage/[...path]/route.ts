import { NextResponse } from 'next/server';
import { isTestMode } from '@/lib/test-mode';
import sharp from 'sharp';

const imageCache = new Map<string, Buffer>();

async function getShapedImage(w: number, h: number, r: number, g: number, b: number): Promise<Buffer> {
  const key = `${w}x${h}-${r}-${g}-${b}`;
  if (!imageCache.has(key)) {
    const buf = await sharp({
      create: {
        width: w,
        height: h,
        channels: 4,
        background: { r, g, b, alpha: 1 },
      },
    })
      .png()
      .toBuffer();
    imageCache.set(key, buf);
  }
  return imageCache.get(key)!;
}

export async function GET(_request: Request) {
  if (!isTestMode()) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const urlPath = _request.url;

  if (urlPath.endsWith('.jpg') || urlPath.endsWith('.png') || urlPath.endsWith('.jpeg')) {
    let w = 1;
    let h = 1;
    let r = 128, g = 99, b = 247; // violet

    if (urlPath.includes('16-9') || urlPath.includes('16_9')) {
      w = 1600;
      h = 900;
      r = 128; g = 99; b = 247;
    } else if (urlPath.includes('4-3') || urlPath.includes('4_3')) {
      w = 800;
      h = 600;
      r = 79; g = 111; b = 240; // blue
    } else if (urlPath.includes('1-1') || urlPath.includes('1_1')) {
      w = 600;
      h = 600;
      r = 16; g = 185; b = 129; // green
    } else if (urlPath.includes('9-16') || urlPath.includes('9_16') || urlPath.includes('portrait')) {
      w = 450;
      h = 800;
      r = 236; g = 72; b = 153; // pink
    }

    if (w > 1 && h > 1) {
      const buffer = await getShapedImage(w, h, r, g, b);
      return new NextResponse(new Uint8Array(buffer), {
        headers: { 'Content-Type': 'image/png' },
      });
    }

    // 1x1 transparent PNG fallback
    const dummyImage = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      'base64'
    );
    return new NextResponse(new Uint8Array(dummyImage), {
      headers: { 'Content-Type': 'image/png' },
    });
  }

  if (urlPath.endsWith('.mp4') || urlPath.endsWith('.webm')) {
    // Dummy tiny valid mp4
    const dummyVideo = Buffer.from(
      'AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAhxtZGF0AAACrgYF//+//7z4UItHWW1/1gAEqAOR7QAAAAA=',
      'base64'
    );
    return new NextResponse(new Uint8Array(dummyVideo), {
      headers: { 'Content-Type': 'video/mp4' },
    });
  }

  // Return a dummy PDF for everything else
  const dummyPdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources <<>> /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 21 >>
stream
BT
/F1 24 Tf
100 700 Td
(Test Resume) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000222 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
293
%%EOF`;

  return new NextResponse(dummyPdfContent, {
    headers: { 'Content-Type': 'application/pdf' },
  });
}
