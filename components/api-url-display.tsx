"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ApiUrlDisplay() {
  const [apiUrl, setApiUrl] = useState("/api/download")
  const { toast } = useToast()

  useEffect(() => {
    // This code runs only on the client, after the component has mounted
    setApiUrl(`${window.location.origin}/api/download`)
  }, [])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiUrl)
    toast({
      title: "Copied!",
      description: "API URL copied to clipboard.",
    })
  }

  return (
    <div className="bg-gray-50 p-3 rounded-lg">
      <div className="flex items-center justify-between">
        <code className="text-sm">{apiUrl}</code>
        <Button size="sm" variant="outline" onClick={copyToClipboard}>
          <Copy className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
} 