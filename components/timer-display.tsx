"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ImagePreview } from "@/components/image-preview"
import { Progress } from "@/components/ui/progress"
import { Share2, AlertTriangle, Hourglass, Twitter } from "lucide-react"
import { ChickenOutModal } from "@/components/chicken-out-modal"
import { SuccessCelebration } from "@/components/success-celebration"
import { getActiveTimer, deleteTimer, cleanupVerifiedTimer } from "@/services/timer-service"
import { TimerData } from "@/types/timer"
import { useAuth } from "@/components/auth-provider"
import { signOut } from "next-auth/react"

// Default confirmation URL (in a real app, this would be dynamically generated)
const CONFIRMATION_BASE_URL = typeof window !== 'undefined' ? `${window.location.origin}/confirm` : ''

export function TimerDisplay() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  // We'll use both signOut from next-auth/react and useAuth's user context
  
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [progress, setProgress] = useState<number>(0)
  const [timerData, setTimerData] = useState<TimerData | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true) // Add loading state
  
  // No need to track timer data changes separately
  const [isChickenOutModalOpen, setIsChickenOutModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // States for tweet functionality
  const [isTweeting, setIsTweeting] = useState(false)
  const [tweetResult, setTweetResult] = useState<{success: boolean, message: string} | null>(null)

  // Function to check if the JWT is expired
  const checkJwtExpiration = async () => {
    try {
      // Fetch the session status from the API
      const response = await fetch('/api/auth/session');
      if (!response.ok) {
        throw new Error('Failed to fetch session');
      }
      
      const session = await response.json();
      
      // If no session exists or the session is empty, consider token expired
      if (!session || Object.keys(session).length === 0 || !session.user) {
        console.log('Session expired or not found');
        return true; // Token is expired or invalid
      }
      
      // Check if the session has an expiry timestamp
      if (session.expires) {
        const expiryTime = new Date(session.expires).getTime();
        const currentTime = Date.now();
        
        // If the expiry time is in the past, the token is expired
        if (expiryTime <= currentTime) {
          console.log('Session has expired based on timestamp');
          return true;
        }
      }
      
      return false; // Token is valid
    } catch (error) {
      console.error('Error checking JWT expiration:', error);
      return true; // Assume expired on error
    }
  };
  
  // Handle session expiration
  const handleSessionExpired = async () => {
    console.log('Handling expired session...');
    setIsTweeting(false)
    // Use the signOut function from auth provider to properly log the user out
    try {
      // Don't delete the image data, as per requirements
      // Sign out properly and redirect to home with session_expired=true query parameter
      await signOut({ redirect: false });
      router.push('/?session_expired=true');
    } catch (error) {
      console.error('Error signing out:', error);
      // Fallback in case signOut fails
      router.push('/?session_expired=true');
    }
  };
  
  useEffect(() => {
    // This effect only runs once on component mount
    const fetchTimerData = async () => {
      // First, check if JWT is expired
      const isExpired = await checkJwtExpiration();
      
      if (isExpired) {
        handleSessionExpired();
        return;
      }
      
      if (!user) {
        setError('You must be logged in to view your timer');
        return;
      }
      
      // Check for email_status parameter in the URL
      const emailStatus = searchParams.get('email_status');
      if (emailStatus === 'failed') {
        setStatusMessage({
          type: 'info',
          message: 'Your timer was created successfully, but we could not send the verification email to your friend. They will still be able to verify your goal with the link below.'
        });
      }

      try {
        // Fetch timer data only once
        const result = await getActiveTimer();

        if (!result.success || !result.data) {
          throw new Error(result.error || 'Failed to load timer');
        }

        // Now we know result.data is not undefined
        setTimerData(result.data);
        
        // Check if the timer is already verified
        if (result.data.isverified) {
          setShowSuccessCelebration(true);
        }
        
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
          
          // We won't delete the timer from Supabase, allowing the user to continue
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load timer'
        setError(errorMessage)
      } finally {
        // Set loading to false regardless of success or failure
        setIsLoading(false)
      }
    }

    fetchTimerData()
    // Empty dependency array means this effect runs once on mount
    // We include user as a dependency since we need it to be available
  }, [user, router])

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
        clearInterval(interval);
        
        // When timer hits 0, first check if the goal has been verified
        const checkAndTweet = async () => {
          const isVerified = await checkVerificationStatus();
          
          // If not verified, send the embarrassing tweet
          if (!isVerified && !isTweeting) {
            setStatusMessage({
              type: 'error',
              message: 'Time is up! Your goal was not verified. Posting your embarrassing image to Twitter...'
            });
            
            // Call the tweet function to post the image
            await sendTweet();
          }
        };
        
        // Execute the check and tweet function
        checkAndTweet();
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [timerData])

  const formatTimeRemaining = () => {
    if (timeRemaining <= 0) return "00:00:00"

    // Calculate time units
    const totalSeconds = Math.floor(timeRemaining / 1000)
    const totalMinutes = Math.floor(totalSeconds / 60)
    const totalHours = Math.floor(totalMinutes / 60)
    const totalDays = Math.floor(totalHours / 24)
    const weeks = Math.floor(totalDays / 7)
    
    // Calculate remaining units after extracting larger units
    const days = totalDays % 7
    const hours = totalHours % 24
    const minutes = totalMinutes % 60
    const seconds = totalSeconds % 60

    // Format based on the largest unit present
    if (weeks > 0) {
      // Format: XwXd XX:XX:XX
      return `${weeks}w${days}d ${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    } else if (days > 0) {
      // Format: Xd XX:XX:XX
      return `${days}d ${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    } else {
      // Format: XX:XX:XX (hours:minutes:seconds)
      return [
        hours.toString().padStart(2, "0"),
        minutes.toString().padStart(2, "0"),
        seconds.toString().padStart(2, "0"),
      ].join(":")
    }
  }

  // State for verification status message
  const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'error' | 'info' | null, message: string}>({
    type: null,
    message: ''
  });

  // State to track if we should show the success celebration view
  const [showSuccessCelebration, setShowSuccessCelebration] = useState(false);

  // Function to send the tweet with the embarrassing image
  const sendTweet = async () => {
    if (!imagePreview || !timerData) return;
    
    setIsTweeting(true);
    setTweetResult(null);
    
    try {
      // First, convert the base64 image to a File object
      const response = await fetch(imagePreview);
      const blob = await response.blob();
      const imageName = `embarrassing_${Date.now()}.jpg`;
      const imageFile = new File([blob], imageName, { type: 'image/jpeg' });
      
      // Create FormData and append image and message
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("message", `I didn't complete my goal: ${timerData.goaldescription} 😱 #NakedDeadlines`);
      
      // Send to the tweet API endpoint
      const response2 = await fetch("/api/tweet", {
        method: "POST",
        body: formData
      });
      
      // Check for authentication errors (401 Unauthorized)
      if (response2.status === 401) {
        console.log('Authentication token expired. Logging out and redirecting...');
        setStatusMessage({
          type: 'error',
          message: 'Your login session has expired. Please sign in again to complete this action.'
        });
        
        // Handle expired session properly by signing out and redirecting with query param
        setTimeout(() => {
          handleSessionExpired();
        }, 3000);
        
        return;
      }
      
      if (!response2.ok) {
        throw new Error(`Failed to tweet: ${response2.status}`);
      }
      
      const result = await response2.json();
      setTweetResult({ 
        success: true, 
        message: `Your embarrassing image has been tweeted! Tweet ID: ${result.tweetId}` 
      });
      
      setStatusMessage({
        type: 'info',
        message: 'Your embarrassing image has been tweeted! The shame is complete.'
      });
      
      // Delete the timer from the database after successful tweet
      try {
        console.log('Deleting timer after successful tweet...');
        const deleteResult = await deleteTimer();
        if (deleteResult.success) {
          console.log('Timer deleted successfully after tweeting');
          
          // Clear local storage data
          if (typeof window !== 'undefined') {
            localStorage.removeItem('nakedDeadlines_imagePreview');
            localStorage.removeItem('nakedDeadlines_imageName');
            localStorage.removeItem('nakedDeadlines_imageType');
          }
          
          // Redirect to the failure page after a short delay
          setTimeout(() => {
            router.push('/failure');
          }, 5000);
        } else {
          console.error('Failed to delete timer after tweeting:', deleteResult.error);
        }
      } catch (deleteError) {
        console.error('Error deleting timer after tweeting:', deleteError);
      }
    } catch (error) {
      console.error("Error sending tweet:", error);
      setTweetResult({ 
        success: false, 
        message: `Failed to tweet: ${error instanceof Error ? error.message : String(error)}` 
      });
      
      setStatusMessage({
        type: 'error',
        message: `Failed to tweet embarrassing image: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsTweeting(false);
    }
  };

  // Function to check if the timer has been verified by the friend
  const checkVerificationStatus = async () => {
    if (!timerData) return;
    
    // Set status to loading
    setStatusMessage({
      type: 'info',
      message: 'Checking verification status...'
    });
    
    try {
      // Call the API to get the latest timer data
      const result = await getActiveTimer();
      
      if (result.success && result.data) {
        // Update the timer data with the latest verification status
        setTimerData(result.data);
        
        // Show celebration view if verified
        if (result.data.isverified) {
          setShowSuccessCelebration(true);
          return true; // Return true if verified
        } else {
          setStatusMessage({
            type: 'info',
            message: "Your friend hasn't verified your goal completion yet."
          });
          return false; // Return false if not verified
        }
      } else {
        setStatusMessage({
          type: 'error',
          message: 'Could not check verification status.'
        });
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to check verification status'
      setStatusMessage({
        type: 'error',
        message: errorMessage
      });
      return false;
    }
  }
  
  const handleShareLink = () => {
    if (!timerData) return
    
    // Use the confirmation token for the URL instead of username
    const confirmationUrl = `${window.location.origin}/confirm/${timerData.confirmationtoken}`
    
    // Log the confirmation URL to the console for testing
    console.log('Confirmation URL:', confirmationUrl)
    
    if (navigator.share) {
      navigator.share({
        title: "Verify my goal completion",
        text: `Please verify that I've completed my goal: ${timerData.goaldescription}`,
        url: confirmationUrl,
      })
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(confirmationUrl)
      
      // Update status message instead of toast
      setStatusMessage({
        type: 'success',
        message: "Confirmation link copied to clipboard"
      })
    }
  }

  const handleChickenOut = () => {
    setIsChickenOutModalOpen(true)
  }

  const handleConfirmChickenOut = async () => {
    if (!timerData) return
    
    try {
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
      
      // Redirect to home page
      router.push("/")
    } catch (error) {
      // Handle error silently without toast
      console.error('Failed to cancel timer:', error)
      setIsChickenOutModalOpen(false)
    }
  }

  // Render UI based on state
  
  // Function to check for new timers after deletion
  const checkForNewTimers = async () => {
    setIsLoading(true);
    try {
      const result = await getActiveTimer();
      
      if (result.success && result.data) {
        // Found a new active timer
        setTimerData(result.data);
        setShowSuccessCelebration(false);
        
        // Load the image from local storage
        const imageKey = result.data?.imagekey;
        const storedImagePreview = imageKey ? localStorage.getItem(`${imageKey}_preview`) : null;
        if (storedImagePreview) {
          setImagePreview(storedImagePreview);
        }
      } else {
        // No new timer found
        setTimerData(null);
        setImagePreview(null);
      }
    } catch (error) {
      // Handle error if needed
      console.error('Error checking for new timers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show success celebration if the goal has been verified
  if (showSuccessCelebration && timerData) {
    return <SuccessCelebration 
      timerData={timerData} 
      imagePreview={imagePreview} 
      onTimerDeleted={checkForNewTimers} 
    />
  }

  // Calculate a fun message based on progress
  const getProgressMessage = () => {
    if (progress < 25) return "Still plenty of time! You got this! 💪"
    if (progress < 50) return "Clock is ticking! Better get moving! ⏱️"
    if (progress < 75) return "Uh oh! Your photo is getting more exposed! 👀"
    return "HURRY UP! Your photo is almost fully revealed! 😱"
  }

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <Card className="w-full border-4 border-primary/30 rounded-xl shadow-xl">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-t-lg">
          <CardTitle className="text-2xl font-extrabold text-center">Loading Timer...</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <div className="py-8 space-y-4 flex flex-col items-center">
            <div className="h-12 w-12 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            <p>Loading your timer data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  // If no timer data is found, show a message card instead of redirecting
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
  } else {
    return (
      <>
        <Card className="w-full border-4 border-primary/30 rounded-xl shadow-xl">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-t-lg">
            <CardTitle className="text-2xl font-extrabold text-center">⏰ Tick Tock! The Curtain's Opening! ⏰</CardTitle>
            <CardDescription className="text-center text-base">
              Goal: <span className="font-bold">{timerData?.goaldescription}</span>
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
                  
                  {statusMessage.type && (
                    <div className={`mt-2 p-3 border-2 rounded-md ${
                      statusMessage.type === 'success' ? 'border-green-400 bg-green-100 dark:bg-green-900/30' : 
                      statusMessage.type === 'error' ? 'border-red-400 bg-red-100 dark:bg-red-900/30' : 
                      'border-blue-400 bg-blue-100 dark:bg-blue-900/30'
                    }`}>
                      <p className="text-sm font-medium">
                        {statusMessage.type === 'success' && '✅ '}
                        {statusMessage.type === 'error' && '❌ '}
                        {statusMessage.type === 'info' && 'ℹ️ '}
                        {statusMessage.message}
                      </p>
                    </div>
                  )}
                  
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
  
                  <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <Button
                      onClick={handleShareLink}
                      variant="outline"
                      className="w-full gap-2 bounce-hover border-2 border-secondary"
                    >
                      <Share2 className="h-4 w-4" />
                      Copy Confirmation Link
                    </Button>
                    
                    <Button
                      onClick={checkVerificationStatus}
                      variant="outline"
                      className="w-full sm:w-auto gap-2 border-2 border-primary"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 2v6h-6"></path>
                        <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                        <path d="M3 12a9 9 0 0 0 15 6.7L21 16"></path>
                        <path d="M21 16v6h-6"></path>
                      </svg>
                      Refresh
                    </Button>
                  </div>
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
}
