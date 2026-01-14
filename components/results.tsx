"use client"

import { useState } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Copy } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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

  const [activeId, setActiveId] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {validMedia.map((item, index) => (
        <DropdownMenu key={item.url || index}>
          <DropdownMenuTrigger asChild>
            <Card className="overflow-hidden group cursor-pointer relative aspect-square">
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
                  {/* Play icon overlay for videos */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
                      <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[10px] border-l-white border-b-[5px] border-b-transparent ml-1" />
                    </div>
                  </div>
                </div>
              )}

              {/* Desktop Hover Overlay - Hidden on touch devices/mobile */}
              <div className="hidden md:flex absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center gap-2">
                <Button
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent opening the dropdown menu
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
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent opening the dropdown menu
                    onCopy(item.url);
                  }}
                  disabled={!item.url}
                  className="rounded-full h-12 w-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                  title="Copy Link"
                >
                  <Copy className="w-5 h-5" />
                </Button>
              </div>
            </Card>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            <DropdownMenuItem onClick={() => onDownload(item.url, index, item.type)}>
              <Download className="mr-2 h-4 w-4" />
              <span>Download {item.type === 'video' ? 'Video' : 'Photo'}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCopy(item.url)}>
              <Copy className="mr-2 h-4 w-4" />
              <span>Copy {item.type === 'video' ? 'Video' : 'Photo'} URL</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ))}
    </div>
  )
} 