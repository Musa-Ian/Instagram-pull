import { type NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return new NextResponse('URL parameter is required', { status: 400 });
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return new NextResponse(`Failed to fetch media: ${response.statusText}`, {
        status: response.status,
      });
    }

    // Ensure the body is a readable stream
    if (!response.body) {
      return new NextResponse('Response body is empty', { status: 500 });
    }

    const reader = response.body.getReader();
    const stream = new Readable({
      read() {
        reader.read().then(({ done, value }) => {
          if (done) {
            this.push(null);
          } else {
            this.push(value);
          }
        });
      },
    });

    const contentType = response.headers.get('Content-Type') || 'application/octet-stream';
    const extension = contentType.startsWith('image/') ? 'jpg' : 'mp4';
    const filename = `download.${extension}`;
    
    // @ts-ignore
    return new NextResponse(stream, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new NextResponse('Error fetching media', { status: 500 });
  }
} 