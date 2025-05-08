"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ImagePreview } from "@/components/image-preview"
import { Progress } from "@/components/ui/progress"
import { Share2, AlertTriangle, Hourglass } from "lucide-react"
import { ChickenOutModal } from "@/components/chicken-out-modal"
import { getActiveTimer, deleteTimer } from "@/services/timer-service"
import { TimerData } from "@/types/timer"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"

// Default confirmation URL (in a real app, this would be dynamically generated)
const CONFIRMATION_BASE_URL = typeof window !== 'undefined' ? `${window.location.origin}/confirm` : ''

export function TimerDisplay() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [progress, setProgress] = useState<number>(0)
  const [timerData, setTimerData] = useState<TimerData | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // No need to track timer data changes separately
  const [isChickenOutModalOpen, setIsChickenOutModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // This effect only runs once on component mount
    const fetchTimerData = async () => {
      if (!user) {
        setError('You must be logged in to view your timer');
        return;
      }

      try {
        // Fetch timer data only once
        const result = await getActiveTimer();

        if (!result.success || !result.data) {
          throw new Error(result.error || 'Failed to load timer');
        }

        // Now we know result.data is not undefined
        setTimerData(result.data);
        
        // Load the image from local storage using the imagekey
        const imageKey = result.data?.imagekey;
        const storedImagePreview = imageKey ? localStorage.getItem(`${imageKey}_preview`) : null;
        
        if (storedImagePreview) {
          // Image exists, continue with the timer
          setImagePreview(storedImagePreview)
        } else {
          // Image doesn't exist, but we'll continue anyway with a placeholder
          
          // Use a placeholder image instead of failing
          setImagePreview('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTk5OTkiPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=')
          
          // Show a warning toast but don't block the timer
          toast({
            title: "Image Not Found",
            description: "Your timer will continue, but the original image couldn't be loaded.",
            variant: "default", // Changed from warning to default since warning isn't a valid variant
          })
          
          // We won't delete the timer from Supabase, allowing the user to continue
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load timer'
        setError(errorMessage)
        toast({
          title: "Error loading timer",
          description: errorMessage,
          variant: "destructive",
        })
        
        // Redirect to home page after a short delay if there's an error
        setTimeout(() => {
          router.push('/')
        }, 3000)
      }
    }

    fetchTimerData()
    // Empty dependency array means this effect runs once on mount
    // We include user as a dependency since we need it to be available
  }, [user, router, toast])

  useEffect(() => {
    // Only run this effect when we have timer data
    if (!timerData) {
      console.log('Skipping timer calculation - no timer data');
      return;
    }

    console.log('Starting timer calculation with data:', timerData);

    // Convert ISO strings to Date objects and then to timestamps
    const deadlineDate = new Date(timerData.deadline)
    // If createdat is missing, fall back to now minus 1 hour
    const createdDate = timerData.createdat ? new Date(timerData.createdat) : new Date(Date.now() - 3600000)
    const startTimeMs = createdDate.getTime()
    const endTimeMs = deadlineDate.getTime()
    const totalDuration = endTimeMs - startTimeMs
    
    // Calculate initial time remaining
    const now = Date.now()
    const initialTimeRemaining = Math.max(0, endTimeMs - now)
    setTimeRemaining(initialTimeRemaining)

    const interval = setInterval(() => {
      const currentTime = Date.now()
      const remaining = Math.max(0, endTimeMs - currentTime)
      setTimeRemaining(remaining)

      // Calculate progress (0-100)
      const elapsed = currentTime - startTimeMs
      const progressPercent = Math.min(100, (elapsed / totalDuration) * 100)
      setProgress(progressPercent)

      if (remaining <= 0) {
        clearInterval(interval)
        // In a real app, this would trigger the tweet to be sent
        toast({
          title: "Time's up!",
          description: "Your deadline has passed. Your image will be tweeted soon!",
          variant: "destructive",
        })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [timerData, toast])

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
    if (!timerData) return
    
    const confirmationUrl = `${CONFIRMATION_BASE_URL}/${timerData.username}`
    
    if (navigator.share) {
      navigator.share({
        title: "Verify my goal completion",
        text: `Please verify that I've completed my goal: ${timerData.goaldescription}`,
        url: confirmationUrl,
      })
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(confirmationUrl)
      toast({
        title: "Link copied!",
        description: "Confirmation link copied to clipboard",
      })
    }
  }

  const handleChickenOut = () => {
    setIsChickenOutModalOpen(true)
  }

  const handleConfirmChickenOut = async () => {
    if (!timerData) return
    
    try {
      setIsLoading(true)
      
      // First, immediately clear the image from local storage to prevent accidental tweeting
      // even if there's an error with Supabase
      if (timerData.imagekey) {
        localStorage.removeItem(`${timerData.imagekey}_preview`)
        localStorage.removeItem(`${timerData.imagekey}_name`)
        localStorage.removeItem(`${timerData.imagekey}_type`)
        console.log('Successfully deleted local image data')
      }
      
      // Then delete the timer from Supabase
      const result = await deleteTimer()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to cancel timer')
      }
      
      setIsChickenOutModalOpen(false)
      toast({
        title: "Timer cancelled",
        description: "You've chickened out! Your image is safe... for now.",
      })
      
      // Redirect to home page
      router.push("/")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel timer'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  // Render UI based on state
  
  if (error) {
    return (
      <Card className="w-full border-4 border-destructive/30 rounded-xl shadow-xl">
        <CardHeader className="bg-destructive/10 rounded-t-lg">
          <CardTitle className="text-2xl font-extrabold text-center">⚠️ Error Loading Timer ⚠️</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <p>{error}</p>
          <p className="mt-4">Redirecting to home page...</p>
        </CardContent>
      </Card>
    )
  }
  
  if (!timerData) {
    return (
      <Card className="w-full border-4 border-primary/30 rounded-xl shadow-xl">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-t-lg">
          <CardTitle className="text-2xl font-extrabold text-center">No Active Timer Found</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <p>You don't have any active timers. Create a new one to get started!</p>
          <Button 
            onClick={() => router.push('/')}
            className="mt-4 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
          >
            Create New Timer
          </Button>
        </CardContent>
      </Card>
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
            Goal: <span className="font-bold">{timerData.goaldescription}</span>
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
                  We've sent a confirmation link to <span className="font-bold">{timerData.friendemail}</span>. They
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
              <ImagePreview imageUrl={imagePreview || '/placeholder.svg?height=400&width=400'} progress={progress} showTowel={true} />
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
