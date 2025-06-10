import { type NextRequest, NextResponse } from "next/server"

interface MediaItem {
  url: string
  type: "image" | "video"
  thumbnail?: string
  quality?: string
}

interface DownloadResult {
  success: boolean
  media: MediaItem[]
  error?: string
  postType: "post" | "story" | "reel"
  postInfo?: {
    owner_username?: string
    owner_fullname?: string
    likes?: number
    is_verified?: boolean
  }
}

// Function using instagram-url-direct with correct import
async function getInstagramMedia(url: string): Promise<DownloadResult> {
  try {
    console.log("Processing Instagram URL:", url)

    // Try different import methods for instagram-url-direct
    let instagramGetUrl: any

    try {
      // Method 1: Try named import
      const module1 = await import("instagram-url-direct")
      instagramGetUrl = module1.instagramGetUrl
      console.log("Using named import, function:", typeof instagramGetUrl)
    } catch (error) {
      console.log("Named import failed:", error)
    }

    if (!instagramGetUrl) {
      try {
        // Method 2: Try default import
        const module2 = await import("instagram-url-direct")
        instagramGetUrl = module2.default
        console.log("Using default import, function:", typeof instagramGetUrl)
      } catch (error) {
        console.log("Default import failed:", error)
      }
    }

    if (!instagramGetUrl) {
      try {
        // Method 3: Try CommonJS style
        const module3 = await import("instagram-url-direct")
        instagramGetUrl = module3.default?.instagramGetUrl || module3.instagramGetUrl
        console.log("Using CommonJS style, function:", typeof instagramGetUrl)
      } catch (error) {
        console.log("CommonJS import failed:", error)
      }
    }

    if (!instagramGetUrl || typeof instagramGetUrl !== "function") {
      // Method 4: Try require-style (fallback)
      try {
        const module4 = require("instagram-url-direct")
        instagramGetUrl = module4.instagramGetUrl || module4.default || module4
        console.log("Using require, function:", typeof instagramGetUrl)
      } catch (error) {
        console.log("Require failed:", error)
      }
    }

    if (!instagramGetUrl || typeof instagramGetUrl !== "function") {
      throw new Error(
        "Could not import instagramGetUrl function. Please check the instagram-url-direct package installation.",
      )
    }

    // Call the function
    console.log("Calling instagramGetUrl with URL:", url)
    const data = await instagramGetUrl(url)

    console.log("Instagram data received:", data)

    if (!data) {
      throw new Error("No data received from Instagram")
    }

    if (!data.url_list || data.url_list.length === 0) {
      throw new Error("No media URLs found in the post")
    }

    const media: MediaItem[] = []

    // Process media details if available (preferred method)
    if (data.media_details && data.media_details.length > 0) {
      console.log("Using media_details:", data.media_details)
      for (const detail of data.media_details) {
        media.push({
          url: detail.url,
          type: detail.type as "image" | "video",
          thumbnail: detail.thumbnail,
        })
      }
    } else {
      // Fallback to url_list
      console.log("Using url_list:", data.url_list)
      for (let i = 0; i < data.url_list.length; i++) {
        const mediaUrl = data.url_list[i]
        // Determine type from URL or assume image
        const isVideo =
          mediaUrl.includes(".mp4") ||
          mediaUrl.includes("video") ||
          mediaUrl.toLowerCase().includes("mp4") ||
          (mediaUrl.includes("scontent") && mediaUrl.includes("mp4"))

        media.push({
          url: mediaUrl,
          type: isVideo ? "video" : "image",
        })
      }
    }

    // Determine post type from URL
    let postType: "post" | "story" | "reel" = "post"
    if (url.includes("/reel/")) {
      postType = "reel"
    } else if (url.includes("/stories/")) {
      postType = "story"
    } else if (url.includes("/tv/")) {
      postType = "reel" // IGTV is now reels
    }

    return {
      success: true,
      media,
      postType,
      postInfo: data.post_info
        ? {
            owner_username: data.post_info.owner_username,
            owner_fullname: data.post_info.owner_fullname,
            likes: data.post_info.likes,
            is_verified: data.post_info.is_verified,
          }
        : undefined,
    }
  } catch (error) {
    console.error("Instagram extraction error:", error)
    throw error
  }
}

// Alternative implementation using a different approach
async function getInstagramMediaAlternative(url: string): Promise<DownloadResult> {
  try {
    console.log("Trying alternative method for URL:", url)

    // Extract post shortcode from URL
    const shortcodeMatch = url.match(/\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/)
    if (!shortcodeMatch) {
      throw new Error("Could not extract shortcode from URL")
    }

    const shortcode = shortcodeMatch[1]
    console.log("Extracted shortcode:", shortcode)

    // Try to fetch Instagram page directly
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const html = await response.text()

    // Look for JSON data in script tags
    const scriptMatches = html.match(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)

    if (scriptMatches) {
      for (const scriptMatch of scriptMatches) {
        try {
          const jsonContent = scriptMatch.replace(/<script[^>]*>/, "").replace(/<\/script>/, "")
          const jsonData = JSON.parse(jsonContent)

          if (jsonData.video && jsonData.video.contentUrl) {
            return {
              success: true,
              media: [
                {
                  url: jsonData.video.contentUrl,
                  type: "video",
                  thumbnail: jsonData.video.thumbnailUrl,
                },
              ],
              postType: "reel",
            }
          }

          if (jsonData.image && Array.isArray(jsonData.image)) {
            const media: MediaItem[] = jsonData.image.map((img: any) => ({
              url: img.url || img,
              type: "image" as const,
            }))

            return {
              success: true,
              media,
              postType: "post",
            }
          }
        } catch (parseError) {
          console.log("JSON parse error:", parseError)
          continue
        }
      }
    }

    // Look for meta property tags
    const metaImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/i)
    const metaVideoMatch = html.match(/<meta property="og:video" content="([^"]+)"/i)

    if (metaVideoMatch) {
      return {
        success: true,
        media: [
          {
            url: metaVideoMatch[1],
            type: "video",
            thumbnail: metaImageMatch ? metaImageMatch[1] : undefined,
          },
        ],
        postType: url.includes("/reel/") ? "reel" : "post",
      }
    }

    if (metaImageMatch) {
      return {
        success: true,
        media: [
          {
            url: metaImageMatch[1],
            type: "image",
          },
        ],
        postType: "post",
      }
    }

    throw new Error("Could not find media in page content")
  } catch (error) {
    console.error("Alternative method error:", error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        {
          success: false,
          error: "URL is required",
          media: [],
        },
        { status: 400 },
      )
    }

    // Validate Instagram URL format
    const instagramRegex = /^https?:\/\/(www\.)?(instagram\.com|instagr\.am)\/(p|reel|tv|stories)\/[\w-]+/
    if (!instagramRegex.test(url)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid Instagram URL. Please provide a valid Instagram post, reel, or story URL.",
          media: [],
        },
        { status: 400 },
      )
    }

    console.log("Processing request for URL:", url)

    let result: DownloadResult | null = null
    const errors: string[] = []

    // Try primary method first
    try {
      result = await getInstagramMedia(url)
      console.log("Primary method successful:", result)
    } catch (primaryError) {
      const errorMessage = primaryError instanceof Error ? primaryError.message : String(primaryError)
      errors.push(`Primary method: ${errorMessage}`)
      console.error("Primary method failed:", errorMessage)

      // Try alternative method
      try {
        result = await getInstagramMediaAlternative(url)
        console.log("Alternative method successful:", result)
      } catch (alternativeError) {
        const altErrorMessage = alternativeError instanceof Error ? alternativeError.message : String(alternativeError)
        errors.push(`Alternative method: ${altErrorMessage}`)
        console.error("Alternative method failed:", altErrorMessage)
      }
    }

    // If no method succeeded
    if (!result || !result.success || !result.media || result.media.length === 0) {
      console.error("All methods failed:", errors)

      // Provide more specific error messages
      let userFriendlyError = "Unable to process Instagram URL."

      if (errors.some((e) => e.includes("instagramGetUrl is not a function"))) {
        userFriendlyError = "Instagram extraction library is not properly installed. Please try again later."
      } else if (errors.some((e) => e.includes("CSRF"))) {
        userFriendlyError = "Instagram is temporarily blocking requests. Please try again in a few minutes."
      } else if (errors.some((e) => e.includes("private"))) {
        userFriendlyError = "This Instagram post is private and cannot be downloaded."
      } else if (errors.some((e) => e.includes("not found") || e.includes("404"))) {
        userFriendlyError = "Instagram post not found. Please check the URL."
      } else if (errors.some((e) => e.includes("timeout"))) {
        userFriendlyError = "Request timed out. Please try again."
      }

      return NextResponse.json(
        {
          success: false,
          error: userFriendlyError,
          media: [],
          debug: process.env.NODE_ENV === "development" ? errors : undefined,
        },
        { status: 500 },
      )
    }

    console.log("Successfully extracted media:", result)
    return NextResponse.json(result)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Please try again later.",
        media: [],
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Instagram Pull API",
    version: "1.0.0",
    author: "Ian Musa",
    description: "Download Instagram posts, stories, and reels",
    endpoints: {
      download: "POST /api/download",
      body: { url: "string (Instagram URL)" },
    },
    supportedUrls: [
      "https://www.instagram.com/p/...",
      "https://www.instagram.com/reel/...",
      "https://www.instagram.com/tv/...",
    ],
    methods: ["instagram-url-direct (primary)", "HTML scraping (fallback)"],
  })
}
