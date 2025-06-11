"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const Results = dynamic(() => import("@/components/results"), {
  ssr: false,
  loading: () => (
    <div className="text-center py-4">
      <Loader2 className="w-8 h-8 animate-spin mx-auto" />
      <p className="text-sm text-gray-500 mt-2">Loading results...</p>
    </div>
  ),
})

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
}

export default function Downloader() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DownloadResult | null>(null)
  const { toast } = useToast()

  const handleDownload = async () => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter an Instagram URL",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url.trim() }),
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        toast({
          title: "Success!",
          description: `Found ${data.media.length} media item(s)`,
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to process URL",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const downloadMedia = async (mediaUrl: string, index: number, type: string) => {
    try {
      toast({ title: "Starting download...", description: "Please wait while we prepare your file." });
      
      // Use the proxy to fetch the media
      const response = await fetch(`/api/proxy?url=${encodeURIComponent(mediaUrl)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch via proxy: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      const extension = type === "video" ? "mp4" : "jpg";
      const filename = `instagram_${type}_${index + 1}.${extension}`;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(blobUrl);

      toast({ title: "Download started!", description: `Your ${type} is saving.` });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download Failed",
        description: "Could not download the file. Try copying the link.",
        variant: "destructive",
      });
    }
  };

  const copyUrlToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied to Clipboard!",
      description: "The media URL has been copied.",
    });
  };

  return (
    <Card className="max-w-2xl mx-auto mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Download Instagram Media
        </CardTitle>
        <CardDescription>Paste any Instagram post, story, or reel URL to download the media</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="https://www.instagram.com/p/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleDownload()}
            className="flex-1"
          />
          <Button onClick={handleDownload} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {loading ? "Processing..." : "Download"}
          </Button>
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="text-sm text-gray-600">Trying multiple methods to extract media...</div>
            <div className="text-xs text-gray-500 mt-1">This may take a few seconds</div>
          </div>
        )}

        {result && (
          <div className="mt-6">
            {result.success ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Media found!</span>
                  <Badge variant="secondary">{result.postType}</Badge>
                </div>
                <Results media={result.media} onDownload={downloadMedia} onCopy={copyUrlToClipboard} />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Download Failed</span>
                </div>
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{result.error}</div>
                <div className="text-xs text-gray-500">
                  Try with a different Instagram URL or check if the post is public.
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 