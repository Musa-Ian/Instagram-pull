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

async function getInstagramMediaFromOembed(url: string): Promise<DownloadResult> {
  try {
    console.log("Attempting oEmbed scraping for:", url);
    const oembedUrl = `https://api.instagram.com/oembed?url=${encodeURIComponent(url)}`;
    const response = await fetch(oembedUrl);
    
    if (!response.ok) {
      throw new Error(`oEmbed request failed with status ${response.status}`);
    }

    const responseText = await response.text();
    // If we receive HTML, it's a login/age-gate wall.
    if (responseText.trim().startsWith("<!DOCTYPE html>")) {
      throw new Error("AGE_RESTRICTED");
    }

    const json = JSON.parse(responseText);
    
    if (!json.thumbnail_url) {
      throw new Error("No media found in oEmbed response.");
    }
    
    // oEmbed is limited; it only provides a thumbnail. We have to infer the content type.
    // It's not perfect but a good last resort.
    const isVideo = url.includes("/reel/") || url.includes("/tv/");

    return {
      success: true,
      media: [{
        url: json.thumbnail_url, // This will be lower quality
        type: isVideo ? "video" : "image",
        thumbnail: json.thumbnail_url
      }],
      postType: isVideo ? "reel" : "post",
      postInfo: {
        owner_username: json.author_name,
      },
    };

  } catch (error: any) {
    console.error("oEmbed scraping failed:", error);
    // If we detected the specific age-restricted error, pass it up.
    if (error.message === "AGE_RESTRICTED") {
      throw new Error("This post may be private or age-restricted and cannot be downloaded.");
    }
    // Otherwise, continue to the final fallback.
    return getInstagramMediaFromHtml(url);
  }
}

export async function getInstagramMedia(url: string): Promise<DownloadResult> {
  // Use a regex to extract the base URL, removing any tracking parameters
  const urlMatch = url.match(/(https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|reels|stories|tv)\/[a-zA-Z0-9\-_]+)/);
  if (urlMatch) {
    url = urlMatch[0];
  }
  
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
    // If we land here, the primary method failed. Now we try the oEmbed method.
    return getInstagramMediaFromOembed(url);
  }
}

function getUsernameFromUrl(url: string): string | null {
  try {
    const urlObject = new URL(url);
    const pathParts = urlObject.pathname.split('/').filter(Boolean);
    // For post URLs like /p/xxxx/, the username is in the post data, not the URL.
    // But for profile URLs like /username/, it's the first part.
    // The scraper needs to handle post URLs, but for a privacy check, we need to find a username if possible.
    if (pathParts.length > 0 && pathParts[0] !== 'p' && pathParts[0] !== 'reel' && pathParts[0] !== 'reels' && pathParts[0] !== 'stories' && pathParts[0] !== 'tv') {
      return pathParts[0];
    }
    // If it's a post/reel URL, we can't get username from URL alone. The main functions will get it from the post data.
    return null;
  } catch (error) {
    console.error("Could not extract username from URL:", error);
    return null;
  }
}

export async function isProfilePrivate(url: string): Promise<boolean> {
  const username = getUsernameFromUrl(url);
  // If it's a post URL, we can't reliably check privacy without fetching the post,
  // which defeats the purpose of a quick check. The main function will handle the error.
  if (!username) {
    return false; // Assume public to let the main download function try
  }

  try {
    console.log(`Checking privacy for username: ${username}`);
    const profileUrl = `https://www.instagram.com/${username}/`;
    const response = await fetch(profileUrl);
    const html = await response.text();

    // Instagram embeds a JSON object with profile data in the HTML
    const match = html.match(/<script type="application\/ld\+json">(.+?)<\/script>/);
    if (match && match[1]) {
      const jsonData = JSON.parse(match[1]);
      // A common pattern for private profiles in this data
      if (jsonData.mainEntityofPage?.interactionStatistic?.userInteractionCount === undefined) {
          // This is a strong indicator of a private profile, but not guaranteed.
          // The most reliable is checking the main JSON blob.
      }
    }
    
    // A more reliable method is finding the main sharedData object
    const scriptTags = html.match(/<script type="text\/javascript">window\._sharedData = (.+?);<\/script>/);
    if (scriptTags && scriptTags[1]) {
        const sharedData = JSON.parse(scriptTags[1]);
        const isPrivate = sharedData.entry_data?.ProfilePage?.[0]?.graphql?.user?.is_private;
        if (typeof isPrivate === 'boolean') {
            console.log(`Profile is private: ${isPrivate}`);
            return isPrivate;
        }
    }
    
    // Fallback if the above structures change
    return html.includes('"is_private":true');

  } catch (error) {
    console.error("Failed to check profile privacy:", error);
    // If we can't determine privacy for any reason, assume it's public
    // and let the main download function handle the potential failure.
    return false;
  }
} 