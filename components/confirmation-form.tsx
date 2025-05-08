"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ImagePreview } from "@/components/image-preview"
import { CheckCircle2, XCircle, Home, Twitter } from "lucide-react"
import { confirmGoalCompletion } from "@/lib/actions"

interface ConfirmationFormProps {
  token: string
}

// Define the interface for our confirmation data
interface ConfirmationData {
  userName: string;
  goalDescription: string;
  imageUrl: string;
  deadline: number;
  createdat: number; // Added createdat property
  token: string;
}

// Initial data - will be replaced with data from the API
const initialConfirmationData: ConfirmationData = {
  userName: "Loading...",
  goalDescription: "Loading...",
  imageUrl: "/placeholder.svg?height=400&width=400",
  deadline: Date.now() + 2 * 60 * 60 * 1000, // Placeholder
  createdat: Date.now() - 24 * 60 * 60 * 1000, // Placeholder, one day ago
  token: ""
}

// Calculate progress percentage based on time elapsed between createdat and deadline
const calculateProgress = (createdAt: number, deadline: number): number => {
  const now = Date.now();
  const totalDuration = deadline - createdAt;
  const elapsed = now - createdAt;
  
  // Calculate percentage (0-100)
  let percentage = Math.floor((elapsed / totalDuration) * 100);
  
  // Ensure percentage is between 0 and 100
  percentage = Math.max(0, Math.min(percentage, 100));
  
  return percentage;
};

export function ConfirmationForm({ token }: ConfirmationFormProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [confirmationData, setConfirmationData] = useState<ConfirmationData>(initialConfirmationData)
  const [isConfirming, setIsConfirming] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [isAlreadyVerified, setIsAlreadyVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchConfirmationData = async () => {
      try {
        setIsLoading(true)
        // Fetch the timer data using the token
        const response = await fetch(`/api/confirm?token=${encodeURIComponent(token)}`)
        const result = await response.json()
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch confirmation data')
        }
        
        // Check if the timer is already verified
        if (result.data.isverified) {
          setIsAlreadyVerified(true)
        }
        
        // Use the data from the API response
        setConfirmationData({
          userName: result.data.username,
          goalDescription: result.data.goaldescription,
          deadline: new Date(result.data.deadline).getTime(),
          createdat: new Date(result.data.createdat).getTime(),
          // Use the provided embarrassing placeholder image instead of the actual photo
          imageUrl: '/images/embarass.jpg',
          token: token
        })
        setIsLoading(false)
      } catch (error) {
        console.error("Failed to fetch confirmation data:", error)
        setError(error instanceof Error ? error.message : "Invalid or expired confirmation link")
        setIsLoading(false)
      }
    }

    fetchConfirmationData()
  }, [token])

  const handleConfirm = async () => {
    setIsConfirming(true)
    setError(null) // Clear any previous errors

    try {
      // Call our API endpoint to verify the timer
      const response = await fetch(`/api/confirm?token=${encodeURIComponent(token)}`, {
        method: 'PUT', // Use PUT to update the verification status
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to confirm goal completion')
      }
      
      setIsConfirmed(true)
    } catch (error) {
      console.error("Failed to confirm goal completion:", error)
      setError(error instanceof Error ? error.message : "Failed to confirm goal completion. Please try again.")
      // Don't set isConfirmed to true if there was an error
    } finally {
      setIsConfirming(false)
    }
  }

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="w-full relative overflow-hidden bg-gradient-to-b from-blue-50 to-blue-100 border-blue-200">
        {/* Floating bubbles */}
        <div className="absolute top-5 right-8 w-8 h-8 rounded-full bg-blue-100 opacity-70 animate-float"></div>
        <div className="absolute top-20 left-12 w-5 h-5 rounded-full bg-blue-200 opacity-60 animate-float-delay"></div>
        <div className="absolute bottom-10 right-20 w-6 h-6 rounded-full bg-blue-100 opacity-50 animate-float-slow"></div>
        
        <CardHeader className="relative z-10">
          <CardTitle className="text-red-600">Error</CardTitle>
          <CardDescription>We couldn't process your confirmation</CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="flex flex-col items-center justify-center p-6 bg-white/50 rounded-lg">
            <XCircle className="h-16 w-16 text-red-600 mb-4" />
            <p className="text-center">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show the same confirmation card for both cases: when user just confirmed or when it was already confirmed
  if (isConfirmed || isAlreadyVerified) {
    return (
      <Card className="w-full relative overflow-hidden bg-gradient-to-b from-blue-50 to-blue-100 border-blue-200">
        {/* Floating bubbles */}
        <div className="absolute top-5 right-8 w-8 h-8 rounded-full bg-blue-100 opacity-70 animate-float"></div>
        <div className="absolute top-20 left-12 w-5 h-5 rounded-full bg-blue-200 opacity-60 animate-float-delay"></div>
        <div className="absolute bottom-10 right-20 w-6 h-6 rounded-full bg-blue-100 opacity-50 animate-float-slow"></div>
        
        <CardHeader className="relative z-10">
          <CardTitle className="text-blue-600">Goal Confirmed!</CardTitle>
          <CardDescription>
            {isAlreadyVerified 
              ? `${confirmationData.userName}'s goal has already been confirmed` 
              : `You've successfully confirmed that ${confirmationData.userName} completed their goal`}
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="flex flex-col items-center justify-center p-6 bg-white/50 rounded-lg">
            <CheckCircle2 className="h-16 w-16 text-blue-600 mb-4" />
            <p className="text-center text-blue-800 mb-6">
              The photo will not be tweeted. Thank you for helping your friend stay accountable!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
              <Button variant="outline" className="gap-2 border-blue-300 hover:bg-blue-100" onClick={() => window.open('/', '_blank')}>
                <Home className="h-4 w-4" />
                Create Your Own Naked Deadline!
              </Button>
              
              <Button variant="outline" className="gap-2 border-blue-300 hover:bg-blue-100 text-blue-800" 
                onClick={() => {
                  const tweetText = `I just saved ${confirmationData.userName} from embarrassment by confirming their goal was completed! Try #NakedDeadlines for your own goals.`;
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
                }}
              >
                <Twitter className="h-4 w-4" />
                Tweet About It
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full relative overflow-hidden bg-gradient-to-b from-blue-50 to-blue-100 border-blue-200">
      {/* Floating bubbles */}
      <div className="absolute top-5 right-8 w-8 h-8 rounded-full bg-blue-100 opacity-70 animate-float"></div>
      <div className="absolute top-20 left-12 w-5 h-5 rounded-full bg-blue-200 opacity-60 animate-float-delay"></div>
      <div className="absolute bottom-10 right-20 w-6 h-6 rounded-full bg-blue-100 opacity-50 animate-float-slow"></div>
      
      <CardHeader className="relative z-10">
        <CardTitle className="text-blue-700">Confirm Goal Completion</CardTitle>
        <CardDescription>
          {confirmationData.userName} has asked you to verify they've completed their goal
        </CardDescription>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-white/50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-blue-700">Goal</h3>
              <p>{confirmationData.goalDescription}</p>
            </div>

            <div className="bg-white/50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-blue-700">Deadline</h3>
              <p>{new Date(confirmationData.deadline).toLocaleString()}</p>
            </div>

            <div className="bg-blue-100/70 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-medium mb-2 text-blue-700">Your Role</h3>
              <p className="text-sm">
                If you confirm that {confirmationData.userName} has completed their goal, the photo will not be tweeted.
                If you don't confirm before the deadline, the photo will be automatically tweeted from their account.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center bg-white/50 p-4 rounded-lg">
            {/* Calculate progress based on time difference between createdat and deadline */}
            <ImagePreview 
              imageUrl={confirmationData.imageUrl} 
              progress={calculateProgress(confirmationData.createdat, confirmationData.deadline)} 
              showTowel={true} 
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between items-center relative z-10">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" className="gap-2 border-blue-300 hover:bg-blue-100" onClick={() => window.open('/', '_blank')}>
            <Home className="h-4 w-4" />
            Create Your Own Naked Deadline!
          </Button>
          
          <Button variant="outline" className="gap-2 border-blue-300 hover:bg-blue-100 text-blue-800" 
            onClick={() => {
              const tweetText = `I hold ${confirmationData.userName}'s fate in my hands! 😈 Their embarrassing photo will be tweeted if they don't complete their goal on time. #NakedDeadlines`;
              window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
            }}
          >
            <Twitter className="h-4 w-4" />
            Tweet About Your Power 😈
          </Button>
        </div>
        
        <Button onClick={handleConfirm} disabled={isConfirming} className="gap-2 bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
          {isConfirming ? "Confirming..." : "Confirm Goal Completion"}
          <CheckCircle2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
