"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TimerData } from "@/types/timer"
import { deleteTimer, cleanupVerifiedTimer } from "@/services/timer-service"


interface SuccessCelebrationProps {
  timerData: TimerData;
  imagePreview: string | null;
  onTimerDeleted: () => void; // Callback for when timer is deleted
}

export function SuccessCelebration({ timerData, imagePreview, onTimerDeleted }: SuccessCelebrationProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  // Function to handle timer deletion
  const handleDeleteTimer = async () => {
    setIsDeleting(true)
    try {
      // First, delete the timer from Supabase
      const deleteResult = await deleteTimer();
      
      if (!deleteResult.success) {
        throw new Error(deleteResult.error || 'Failed to delete timer')
      }
      
      // Then, clean up local storage
      if (timerData.imagekey) {
        localStorage.removeItem(`${timerData.imagekey}_preview`);
        localStorage.removeItem(`${timerData.imagekey}_name`);
        localStorage.removeItem(`${timerData.imagekey}_type`);
      }
      
      // Update status message instead of toast
      setStatusMessage('Timer successfully deleted')
      
      // Call the callback to check for new timers
      onTimerDeleted()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      // Update status message instead of toast
      setStatusMessage(`Failed to delete timer: ${errorMessage}`)
      setIsDeleting(false)
    }
  }

  // Create bubbles for decoration
  const bubbles = Array.from({ length: 15 }).map((_, i) => (
    <div 
      key={i} 
      className={`absolute rounded-full bg-blue-400/30 animate-float-bubble z-0`}
      style={{
        width: `${Math.random() * 30 + 10}px`,
        height: `${Math.random() * 30 + 10}px`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${Math.random() * 5 + 5}s`
      }}
    />
  ));

  return (
    <Card className="w-full border-4 border-blue-400/50 rounded-xl shadow-xl animate-fade-in overflow-hidden relative">
      {/* Bathroom decoration elements */}
      <div className="absolute top-4 right-4 animate-spin-slow text-blue-400/40 z-0">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V6Z" />
          <path d="M19 6a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V6Z" />
          <path d="M9 16a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-4Z" />
          <path d="M19 16a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-4Z" />
        </svg>
      </div>
      
      <div className="absolute bottom-4 left-4 animate-bounce text-blue-400/40 z-0">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 21h10" />
          <rect x="5" y="3" width="14" height="6" rx="2" />
          <path d="M6 9v9" />
          <path d="M18 9v9" />
        </svg>
      </div>
      
      {/* Add bubbles */}
      {bubbles}
      
      <CardHeader className="bg-gradient-to-r from-blue-400/30 to-blue-600/30 rounded-t-lg relative z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-blue-500/10 z-0" />
        <CardTitle className="text-3xl font-extrabold text-center bg-clip-text relative z-10">
          🎉 Congratulations! 🎉
        </CardTitle>
        <CardDescription className="text-center text-lg font-medium relative z-10">
          You successfully completed your goal!
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 text-center relative z-10 bg-gradient-to-b from-blue-50/50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20">
        {/* More bathroom elements */}
        <div className="py-6 space-y-6">
          <div className="relative w-full max-w-xs mx-auto h-40 overflow-hidden rounded-lg shadow-md border-4 border-blue-300/50">
            {/* Water ripple effect */}
            <div className="absolute inset-0 bg-blue-100/30 dark:bg-blue-900/30 z-5"></div>
            
            {imagePreview && (
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/70 to-transparent z-10"></div>
            )}
            {imagePreview ? (
              <img 
                src={imagePreview} 
                alt="Your goal evidence" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-100 dark:bg-blue-900">
                <p className="text-blue-500">Image not available</p>
              </div>
            )}
            
            {/* Rubber duck decoration */}
            <div className="absolute top-2 right-2 z-20 animate-bounce" style={{animationDuration: '3s'}}>
              <span className="text-xl">🦆</span>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-3 z-20 bg-gradient-to-t from-blue-600/80 to-transparent">
              <p className="text-white font-bold text-sm">
                {timerData?.goaldescription}
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Share Your Achievement!</h3>
            <p className="text-sm">
              Would you like to share your success with the world?
            </p>
            
            <Button
              className="w-full mt-4 bg-[#1DA1F2] hover:bg-[#1a94e0] text-white gap-2"
              onClick={() => {
                // In a real app, this would open Twitter share dialog
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I just completed my goal: ${timerData?.goaldescription}! #NakedDeadlines`)}`, '_blank');
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
              </svg>
              Tweet About Your Success
            </Button>
            
            <Button
              variant="default"
              className="w-full mt-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800"
              onClick={handleDeleteTimer}
              disabled={isDeleting}
            >
              {isDeleting ? 'Processing...' : 'Delete This Timer'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
