"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { CheckCircle2, AlertCircle } from "lucide-react"

interface ImagePreviewProps {
  imageUrl: string | null
  progress: number // 0 to 100
  showTowel: boolean
  isCompleted?: boolean
}

export function ImagePreview({ imageUrl, progress, showTowel, isCompleted = false }: ImagePreviewProps) {
  const [curtainPosition, setCurtainPosition] = useState(0)
  const [waterDroplets, setWaterDroplets] = useState<Array<{ id: number; left: number; delay: number }>>([])

  // Update curtain position based on progress
  useEffect(() => {
    if (showTowel) {
      setCurtainPosition(progress)
    }
  }, [progress, showTowel])

  // Generate water droplets
  useEffect(() => {
    if (progress > 0) {
      // Create 10 water droplets with random positions
      const droplets = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        left: Math.random() * 80 + 10, // Random position between 10% and 90%
        delay: Math.random() * 2, // Random delay between 0 and 2 seconds
      }))
      setWaterDroplets(droplets)
    } else {
      setWaterDroplets([])
    }
  }, [progress > 0])

  // Generate random emojis for decoration
  const emojis = ["🙈", "👀", "😱", "🫣", "😂", "🤭", "😅", "🤪"]

  if (!imageUrl) {
    return (
      <Card className="w-full h-64 flex items-center justify-center bg-muted">
        <p className="text-muted-foreground">Image preview will appear here</p>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="relative w-full aspect-square rounded-md overflow-hidden shadow-lg">
        {/* Shower scene container */}
        <div className="absolute inset-0 z-10 shower-scene">
          {/* Image */}
          <div className="absolute inset-0">
            <Image src={imageUrl || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
          </div>

          {/* Water droplets */}
          {waterDroplets.map((droplet) => (
            <div
              key={droplet.id}
              className="water-droplet"
              style={{
                left: `${droplet.left}%`,
                top: "10%",
                animationDelay: `${droplet.delay}s`,
                zIndex: 25,
              }}
            />
          ))}

          {/* Fun emoji decorations */}
          {emojis.map((emoji, index) => (
            <div
              key={index}
              className="emoji-decoration"
              style={{
                top: `${Math.random() * 80 + 10}%`,
                left: `${Math.random() * 80 + 10}%`,
                animationDelay: `${index * 0.3}s`,
                zIndex: 25,
              }}
            >
              {emoji}
            </div>
          ))}

          {/* Shower curtains */}
          {showTowel && !isCompleted && (
            <>
              <div
                className="curtain-left"
                style={{
                  transform: `translateX(-${curtainPosition}%)`,
                }}
              />
              <div
                className="curtain-right"
                style={{
                  transform: `translateX(${curtainPosition}%)`,
                }}
              />
            </>
          )}

          {/* Shower curtain rod and rings */}
          <div className="curtain-rod"></div>
          <div className="curtain-rings">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="curtain-ring"></div>
            ))}
          </div>
        </div>

        {isCompleted && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-40">
            <div className="text-center">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-2" />
              <p className="text-white font-bold text-xl">SAFE! 🎉</p>
            </div>
          </div>
        )}

        {!isCompleted && progress >= 100 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-40">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-2" />
              <p className="text-white font-bold text-xl">EXPOSED! 😱</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 text-center">
        {isCompleted ? (
          <p className="text-sm font-medium text-green-600 dark:text-green-500">
            Woohoo! Goal completed! Your image is safe and sound! 🎉
          </p>
        ) : progress >= 100 ? (
          <p className="text-sm font-medium text-red-600 dark:text-red-500">
            Oh no! Time's up! Your image is now on Twitter for all to see! 🙈
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {progress > 0 ? `${Math.floor(progress)}% exposed! Hurry up!` : "Curtains closed... for now! 😉"}
          </p>
        )}
      </div>
    </div>
  )
}
