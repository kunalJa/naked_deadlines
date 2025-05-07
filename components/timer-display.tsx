"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ImagePreview } from "@/components/image-preview"
import { Progress } from "@/components/ui/progress"
import { Share2, AlertTriangle, Hourglass } from "lucide-react"
import { ChickenOutModal } from "@/components/chicken-out-modal"

// Mock data - in a real app this would come from the server
const mockTimerData = {
  imageUrl: "/placeholder.svg?height=400&width=400",
  deadline: Date.now() + 24 * 60 * 1000, // 24 hours from now
  goalDescription: "Complete my project proposal",
  friendEmail: "friend@example.com",
  confirmationUrl: "https://example.com/confirm/abc123",
}

export function TimerDisplay() {
  const router = useRouter()
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [progress, setProgress] = useState<number>(0)
  const [timerData, setTimerData] = useState(mockTimerData)
  const [isLoading, setIsLoading] = useState(true)
  const [isChickenOutModalOpen, setIsChickenOutModalOpen] = useState(false)

  useEffect(() => {
    const fetchTimerData = async () => {
      try {
        // In a real app, this would fetch the timer data from the server
        // const data = await getActiveTimer()
        // setTimerData(data)

        // For now, we'll use the mock data
        setTimerData(mockTimerData)
        setIsLoading(false)
      } catch (error) {
        console.error("Failed to fetch timer data:", error)
        setIsLoading(false)
      }
    }

    fetchTimerData()
  }, [])

  useEffect(() => {
    if (isLoading || !timerData) return

    const totalDuration = timerData.deadline - Date.now()
    const initialTimeRemaining = Math.max(0, timerData.deadline - Date.now())
    setTimeRemaining(initialTimeRemaining)

    const interval = setInterval(() => {
      const remaining = Math.max(0, timerData.deadline - Date.now())
      setTimeRemaining(remaining)

      // Calculate progress (0-100)
      const elapsed = totalDuration - remaining
      const progressPercent = Math.min(100, (elapsed / totalDuration) * 100)
      setProgress(progressPercent)

      if (remaining <= 0) {
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isLoading, timerData])

  const formatTimeRemaining = () => {
    if (timeRemaining <= 0) return "00:00:00"

    const hours = Math.floor(timeRemaining / (1000 * 60 * 60))
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000)

    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      seconds.toString().padStart(2, "0"),
    ].join(":")
  }

  const handleShareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: "Verify my goal completion",
        text: `Please verify that I've completed my goal: ${timerData.goalDescription}`,
        url: timerData.confirmationUrl,
      })
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(timerData.confirmationUrl)
      alert("Confirmation link copied to clipboard!")
    }
  }

  const handleChickenOut = () => {
    setIsChickenOutModalOpen(true)
  }

  const handleConfirmChickenOut = () => {
    // In a real app, this would call an API to cancel the timer
    setIsChickenOutModalOpen(false)
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Calculate a fun message based on progress
  const getProgressMessage = () => {
    if (progress < 25) return "Still plenty of time! You got this! 💪"
    if (progress < 50) return "Clock is ticking! Better get moving! ⏱️"
    if (progress < 75) return "Uh oh! Your photo is getting more exposed! 👀"
    return "HURRY UP! Your photo is almost fully revealed! 😱"
  }

  return (
    <>
      <Card className="w-full border-4 border-primary/30 rounded-xl shadow-xl">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-t-lg">
          <CardTitle className="text-2xl font-extrabold text-center">⏰ Tick Tock! The Curtain's Opening! ⏰</CardTitle>
          <CardDescription className="text-center text-base">
            Goal: <span className="font-bold">{timerData.goalDescription}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="space-y-2 bg-accent/20 p-4 rounded-lg">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Hourglass className="h-5 w-5 text-primary animate-pulse" />
                  Time Remaining
                </h3>
                <div className="text-5xl font-bold tabular-nums text-center py-4 bg-white dark:bg-black rounded-lg shadow-inner">
                  {formatTimeRemaining()}
                </div>
                <Progress value={progress} className="h-4 bg-secondary/30" />
                <p className="text-center font-medium text-primary mt-2">{getProgressMessage()}</p>
              </div>

              <div className="space-y-2 bg-primary/20 p-4 rounded-lg">
                <h3 className="text-xl font-bold">Verification Status</h3>
                <p className="text-sm">
                  We've sent a confirmation link to <span className="font-bold">{timerData.friendEmail}</span>. They
                  need to verify your goal completion before the deadline!
                </p>
                
                <div className="p-3 border-2 border-green-400 rounded-md bg-green-100 dark:bg-green-900/30">
                  <p className="text-sm font-bold flex items-center">
                    <span className="mr-2">🔒</span>
                    Your photo is stored ONLY in your browser.
                  </p>
                  <p className="text-xs mt-1">
                    For privacy, your image remains local until deadline expiration. It will only be uploaded if you fail to complete your goal in time.
                  </p>
                </div>

                <div className="flex items-center p-3 border-2 border-yellow-400 rounded-md bg-yellow-100 dark:bg-yellow-900/30">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                  <p className="text-sm font-bold">
                    You can't stop this timer yourself! Only your friend can save you! 😈
                  </p>
                </div>

                <Button
                  onClick={handleShareLink}
                  variant="outline"
                  className="w-full mt-2 gap-2 bounce-hover border-2 border-secondary"
                >
                  <Share2 className="h-4 w-4" />
                  Share Confirmation Link With Your Friend!
                </Button>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center">
              <ImagePreview imageUrl={timerData.imageUrl} progress={progress} showTowel={true} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-b-lg p-6 flex justify-between">
          <Button variant="outline" className="font-bold" onClick={handleChickenOut}>
            Chicken Out 🐔
          </Button>
          <p className="text-sm font-medium text-center">
            {timeRemaining > 0
              ? "Complete your goal and have your friend confirm it before the curtain fully opens! 🚿"
              : "Time's up! Your image has been tweeted for all to see! 🙈"}
          </p>
        </CardFooter>
      </Card>

      <ChickenOutModal
        isOpen={isChickenOutModalOpen}
        onClose={() => setIsChickenOutModalOpen(false)}
        onConfirm={handleConfirmChickenOut}
      />
    </>
  )
}
