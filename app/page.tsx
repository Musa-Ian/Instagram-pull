"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Instagram, Smartphone, Copy, CheckCircle, AlertCircle, Loader2, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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

export default function HomePage() {
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

  const copyApiUrl = () => {
    const apiUrl = `${window.location.origin}/api/download`
    navigator.clipboard.writeText(apiUrl)
    toast({
      title: "Copied!",
      description: "API URL copied to clipboard",
    })
  }

  const downloadMedia = async (mediaUrl: string, index: number, type: string) => {
    try {
      // Create a more descriptive filename
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-")
      const extension = type === "video" ? "mp4" : "jpg"
      const filename = `instagram_${type}_${timestamp}_${index + 1}.${extension}`

      // For direct URLs, we can use a different approach
      if (mediaUrl.startsWith("http")) {
        // Create a temporary link element
        const link = document.createElement("a")
        link.href = mediaUrl
        link.download = filename
        link.target = "_blank"
        link.rel = "noopener noreferrer"

        // Add to DOM, click, and remove
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast({
          title: "Download Started",
          description: `${type} download initiated`,
        })
      } else {
        toast({
          title: "Invalid URL",
          description: "Unable to download this media",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Download error:", error)
      toast({
        title: "Download Failed",
        description: "Unable to download media",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Instagram className="w-8 h-8 text-pink-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Instagram Pull
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Download Instagram posts, stories, and reels with ease</p>
          <p className="text-sm text-gray-500 mt-2">
            Built by <span className="font-semibold">Ian Musa</span>
          </p>
        </div>

        {/* Important Notice */}
        <Alert className="max-w-2xl mx-auto mb-8">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Note:</strong> This service works best with public Instagram posts. Private posts, stories, or
            restricted content may not be accessible. If one method fails, the system automatically tries alternative
            approaches.
          </AlertDescription>
        </Alert>

        {/* Main Download Card */}
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

            {/* Loading indicator with more details */}
            {loading && (
              <div className="text-center py-4">
                <div className="text-sm text-gray-600">Trying multiple methods to extract media...</div>
                <div className="text-xs text-gray-500 mt-1">This may take a few seconds</div>
              </div>
            )}

            {/* Results */}
            {result && (
              <div className="mt-6">
                {result.success ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Media found!</span>
                      <Badge variant="secondary">{result.postType}</Badge>
                    </div>
                    <div className="grid gap-3">
                      {result.media.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {item.thumbnail && (
                              <img
                                src={item.thumbnail || "/placeholder.svg"}
                                alt="Thumbnail"
                                className="w-12 h-12 object-cover rounded"
                                onError={(e) => {
                                  e.currentTarget.src = "/placeholder.svg?height=48&width=48"
                                }}
                              />
                            )}
                            <div>
                              <p className="font-medium capitalize">{item.type}</p>
                              <p className="text-sm text-gray-500">
                                {item.quality ? `${item.quality} quality` : `Media ${index + 1}`}
                              </p>
                              {item.url && (
                                <p className="text-xs text-gray-400 truncate max-w-[200px]">
                                  {item.url.substring(0, 50)}...
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => downloadMedia(item.url, index, item.type)}
                            disabled={!item.url || item.url.includes("placeholder.svg")}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
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

        {/* iOS Shortcuts Integration */}
        <Card className="max-w-2xl mx-auto mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              iOS Shortcuts Integration
            </CardTitle>
            <CardDescription>Use this API endpoint with iOS Shortcuts for seamless downloads</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <code className="text-sm">
                  {typeof window !== "undefined" ? `${window.location.origin}/api/download` : "/api/download"}
                </code>
                <Button size="sm" variant="outline" onClick={copyApiUrl}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p>
                <strong>Method:</strong> POST
              </p>
              <p>
                <strong>Content-Type:</strong> application/json
              </p>
              <p>
                <strong>Body:</strong> {'{ "url": "instagram_url_here" }'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Download className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Multiple Methods</h3>
                <p className="text-sm text-gray-600">Uses 4 different extraction methods for maximum success</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Smartphone className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">iOS Shortcuts</h3>
                <p className="text-sm text-gray-600">Seamless integration with iOS Shortcuts app</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Reliable</h3>
                <p className="text-sm text-gray-600">Automatic fallback system for maximum success rate</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t">
          <p className="text-gray-500 text-sm">© 2024 Instagram Pull by Ian Musa. Open source project.</p>
        </div>
      </div>
    </div>
  )
}
