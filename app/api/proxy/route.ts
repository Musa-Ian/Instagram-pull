import { type NextRequest, NextResponse } from 'next/server';

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

    if (!response.body) {
      return new NextResponse('Response body is empty', { status: 500 });
    }

    const contentType =
      response.headers.get('Content-Type') || 'application/octet-stream';
    const extension = contentType.startsWith('image/') ? 'jpg' : 'mp4';
    const filename = `download.${extension}`;

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);

    return new NextResponse(response.body, {
      headers: headers,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new NextResponse('Error fetching media', { status: 500 });
  }
} 