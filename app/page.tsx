"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Instagram, Smartphone, Copy, CheckCircle, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const Downloader = dynamic(() => import("@/components/downloader"), { ssr: false })

export default function HomePage() {
  const [isClient, setIsClient] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const copyApiUrl = () => {
    if (!isClient) return
    const apiUrl = `${window.location.origin}/api/download`
    navigator.clipboard.writeText(apiUrl)
    toast({
      title: "Copied!",
      description: "API URL copied to clipboard",
    })
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
        <Downloader />

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
                  {isClient ? `${window.location.origin}/api/download` : "/api/download"}
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
