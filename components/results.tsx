"use client"

import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Copy } from "lucide-react"

interface MediaItem {
  url: string
  type: "image" | "video"
  thumbnail?: string
}

interface ResultsProps {
  media: MediaItem[]
  onDownload: (url: string, index: number, type: string, username?: string) => void
  onCopy: (url: string) => void;
}

export default function Results({ media, onDownload, onCopy }: ResultsProps) {
  // Filter out media items that don't have a valid URL
  const validMedia = media.filter(item => typeof item.url === 'string' && item.url.startsWith('http'));

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {validMedia.map((item, index) => (
        <Card key={item.url || index} className="overflow-hidden group">
          <div className="relative aspect-square">
            {item.type === "image" ? (
              <Image
                src={item.url}
                alt={`Instagram Media ${index + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                className="object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-black flex items-center justify-center">
                <video
                  src={item.url}
                  poster={item.thumbnail}
                  controls
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                size="icon"
                onClick={() => onDownload(item.url, index, item.type)}
                disabled={!item.url}
                className="rounded-full h-12 w-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                title="Download"
              >
                <Download className="w-5 h-5" />
              </Button>
              <Button
                size="icon"
                onClick={() => onCopy(item.url)}
                disabled={!item.url}
                className="rounded-full h-12 w-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                title="Copy Link"
              >
                <Copy className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
} 