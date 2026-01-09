"use client"

import { useState } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Copy, Play } from "lucide-react"

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

  // Track which videos are playing
  const [playing, setPlaying] = useState<Record<number, boolean>>({})

  const togglePlay = (index: number) => {
    setPlaying(prev => ({ ...prev, [index]: !prev[index] }))
  }

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
              <div className="w-full h-full bg-black flex items-center justify-center relative">
                {playing[index] ? (
                  <video
                    src={item.url}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <>
                    {item.thumbnail ? (
                      <Image
                        src={item.thumbnail}
                        alt={`Video Thumbnail ${index + 1}`}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-900" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                      <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                        <Play className="w-6 h-6 text-white fill-white" />
                      </div>
                    </div>
                    {/* Click overlay to start playing */}
                    <div
                      className="absolute inset-0 cursor-pointer z-20"
                      onClick={() => togglePlay(index)}
                    />
                  </>
                )}
              </div>
            )}
            <div className={`absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none ${playing[index] ? 'hidden' : ''}`}>
              <div className="flex gap-2 pointer-events-auto">
                <Button
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload(item.url, index, item.type);
                  }}
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
          </div>
        </Card>
      ))}
    </div>
  )
} 