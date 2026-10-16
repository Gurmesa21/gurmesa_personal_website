import { NextResponse } from 'next/server';
import { isTestMode } from '@/lib/test-mode';

export async function GET(_request: Request) {
  if (!isTestMode()) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const urlPath = _request.url;
  
  if (urlPath.endsWith('.jpg') || urlPath.endsWith('.png') || urlPath.endsWith('.jpeg')) {
    // 1x1 transparent PNG
    const dummyImage = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
    return new NextResponse(dummyImage, {
      headers: { 'Content-Type': 'image/png' },
    });
  }

  if (urlPath.endsWith('.mp4') || urlPath.endsWith('.webm')) {
    // Dummy tiny valid mp4
    const dummyVideo = Buffer.from('AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAhxtZGF0AAACrgYF//+//7z4UItHWW1/1gAEqAOR7QAAAAA=', 'base64');
    return new NextResponse(dummyVideo, {
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
