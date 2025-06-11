import { z } from "zod";

const MediaItemSchema = z.object({
  url: z.string(),
  type: z.enum(["image", "video"]),
  thumbnail: z.string().optional(),
  quality: z.string().optional(),
});

const PostInfoSchema = z.object({
  owner_username: z.string().optional(),
  owner_fullname: z.string().optional(),
  likes: z.number().optional(),
  is_verified: z.boolean().optional(),
});

const DownloadResultSchema = z.object({
  success: z.boolean(),
  media: z.array(MediaItemSchema),
  error: z.string().optional(),
  postType: z.enum(["post", "story", "reel"]),
  postInfo: PostInfoSchema.optional(),
});

export type DownloadResult = z.infer<typeof DownloadResultSchema>;

// Function to get instagram post ID from URL string
const getId = (url: string) => {
  const regex = /instagram.com\/(?:[A-Za-z0-9_.]+\/)?(p|reels|reel|stories)\/([A-Za-z0-9-_]+)/;
  const match = url.match(regex);
  return match && match[2] ? match[2] : null;
};

async function getInstagramMediaFromHtml(url: string): Promise<DownloadResult> {
  try {
    console.log("Attempting fallback HTML scraping for:", url);
    const response = await fetch(url);
    const html = await response.text();

    // Find all script tags and check them for the required data
    const scriptTags = html.match(/<script type="application\/json" [^>]*>(.+?)<\/script>/g);
    if (!scriptTags) {
      throw new Error("No JSON script tags found in HTML.");
    }
    
    let postData = null;
    for (const tag of scriptTags) {
      try {
        const content = tag.replace('<script type="application/json" data-sjs>','').replace('</script>','');
        const json = JSON.parse(content);
        // This is a more reliable way to find the right object
        if (json?.data?.xdt_shortcode_media) {
          postData = json.data.xdt_shortcode_media;
          break;
        }
      } catch (e) {
        // Not a valid JSON, or not the one we want, so we continue
      }
    }

    if (!postData) {
      throw new Error("Could not find post data in any of the script tags.");
    }

    const media: z.infer<typeof MediaItemSchema>[] = [];
    let postType: "post" | "story" | "reel" = "post";

    if (postData.is_video) {
      postType = "reel";
      media.push({ url: postData.video_url, type: "video", thumbnail: postData.display_url });
    } else if (postData.edge_sidecar_to_children) {
      postType = "post";
      for (const edge of postData.edge_sidecar_to_children.edges) {
        const node = edge.node;
        if (node.is_video) {
          media.push({ url: node.video_url, type: "video", thumbnail: node.display_url });
        } else {
          media.push({ url: node.display_url, type: "image" });
        }
      }
    } else {
      postType = "post";
      media.push({ url: postData.display_url, type: "image" });
    }

    return {
      success: true,
      media,
      postType,
      postInfo: {
        owner_username: postData.owner?.username,
        owner_fullname: postData.owner?.full_name,
        likes: postData.edge_media_preview_like?.count,
        is_verified: postData.owner?.is_verified,
      },
    };

  } catch (error: any) {
    console.error("HTML scraping fallback failed:", error);
    // This is the end of the line, so we return a final error
    return {
      success: false,
      media: [],
      postType: "post",
      error: "All extraction methods failed.",
    };
  }
}

export async function getInstagramMedia(url: string): Promise<DownloadResult> {
  // Method 1: GraphQL API
  try {
    console.log("Processing Instagram URL with GraphQL method:", url);
    const igId = getId(url);
    if (!igId) {
      return {
        success: false,
        media: [],
        postType: "post",
        error: "Invalid Instagram URL",
      };
    }

    const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";
    const xIgAppId = "936619743392459";

    const graphql = new URL(`https://www.instagram.com/api/graphql`);
    graphql.searchParams.set("variables", JSON.stringify({ shortcode: igId, child_comment_count: 0, fetch_comment_count: 0, parent_comment_count: 0, has_threaded_comments: false }));
    graphql.searchParams.set("doc_id", "10015901848480474");
    graphql.searchParams.set("lsd", "AVqbxe3J_YA");

    const response = await fetch(graphql, {
      method: "POST",
      headers: {
        "User-Agent": userAgent,
        "Content-Type": "application/x-www-form-urlencoded",
        "X-IG-App-ID": xIgAppId,
        "X-FB-LSD": "AVqbxe3J_YA",
        "X-ASBD-ID": "129477",
        "Sec-Fetch-Site": "same-origin"
      }
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed with status ${response.status}`);
    }

    const json = await response.json();
    const items = json?.data?.xdt_shortcode_media;
    if (!items) {
      throw new Error("No data received from Instagram GraphQL API.");
    }

    // If we get here, the primary method was successful
    const media: z.infer<typeof MediaItemSchema>[] = [];
    let postType: "post" | "story" | "reel" = "post";
    if (items.is_video) {
      postType = "reel";
      if(items.video_url) {
        media.push({
          url: items.video_url,
          type: "video",
          thumbnail: items.display_url,
        });
      }
    } else if (items.edge_sidecar_to_children) {
      postType = "post";
      for (const edge of items.edge_sidecar_to_children.edges) {
        const node = edge.node;
        if (node.is_video) {
          if (node.video_url) {
            media.push({
              url: node.video_url,
              type: "video",
              thumbnail: node.display_url,
            });
          }
        } else {
          if (node.display_url) {
            media.push({
              url: node.display_url,
              type: "image",
            });
          }
        }
      }
    } else {
      postType = "post";
      if (items.display_url) {
        media.push({
          url: items.display_url,
          type: "image",
        });
      }
    }
    
    if (url.includes("/reel/")) {
      postType = "reel"
    } else if (url.includes("/stories/")) {
      postType = "story"
    } else if (url.includes("/tv/")) {
      postType = "reel" 
    }

    return {
      success: true,
      media,
      postType,
      postInfo: {
        owner_username: items.owner?.username,
        owner_fullname: items.owner?.full_name,
        likes: items.edge_media_preview_like?.count,
        is_verified: items.owner?.is_verified,
      },
    };

  } catch (error: any) {
    console.error("Instagram GraphQL extraction failed, trying fallback:", error.message);
    // If we land here, the primary method failed. Now we try the fallback.
    return getInstagramMediaFromHtml(url);
  }
} 