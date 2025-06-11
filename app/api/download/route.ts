import { type NextRequest, NextResponse } from "next/server"
import { getInstagramMedia, DownloadResult } from "@/lib/scraper"
import { z } from "zod"

interface MediaItem {
  url: string
  type: "image" | "video"
  thumbnail?: string
  quality?: string
}

const urlSchema = z.string().url({ message: "Invalid URL provided." })

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    const validation = urlSchema.safeParse(url)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0].message,
        },
        { status: 400 }
      )
    }

    console.log("Received URL:", url)

    const result: DownloadResult = await getInstagramMedia(url)

    if (!result.success || result.media.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "No media found or failed to fetch.",
        },
        { status: 500 }
      )
    }

    // Check for a custom header to determine if the request is from the shortcut
    const clientType = request.headers.get("X-Client-Type");

    if (clientType === 'shortcut') {
      // If it's the shortcut, return proxied URLs
      const proxyBaseUrl = `${new URL(request.url).origin}/api/proxy?url=`;
      const proxiedResult = {
        ...result,
        media: result.media.map(item => ({
          ...item,
          url: `${proxyBaseUrl}${encodeURIComponent(item.url)}`,
          thumbnail: item.thumbnail ? `${proxyBaseUrl}${encodeURIComponent(item.thumbnail)}` : undefined,
        })),
      };
      return NextResponse.json(proxiedResult);
    }

    // Otherwise, for web clients, return the direct CDN URLs
    return NextResponse.json(result)
  } catch (error) {
    console.error("Handler error:", error)
    let errorMessage = "An unknown error occurred."
    if (error instanceof Error) {
      errorMessage = error.message
    }
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message:
      "This endpoint works with POST requests. Please provide an Instagram URL.",
  })
}
