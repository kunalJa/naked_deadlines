"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { getActiveTimer } from "@/services/timer-service"

export function TimerChecker({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user } = useAuth()
  const [isChecking, setIsChecking] = useState(false) // Start with false until we know user is authenticated

  useEffect(() => {
    // Only run the check if we have a user
    if (!user?.name) {
      return; // Exit early if no user - don't set isChecking
    }
    
    setIsChecking(true); // Only start checking when we have a user
    
    // Add a safety timeout to prevent the component from getting stuck
    const safetyTimeout = setTimeout(() => {
      setIsChecking(false);
    }, 5000); // 5 second timeout
    
    // Immediately check for an active timer
    const checkForActiveTimer = async () => {
      try {
        const result = await getActiveTimer();
        
        // Clear the safety timeout since we got a response
        clearTimeout(safetyTimeout);
        
        if (result.success && result.data) {
          // Only redirect if we're not already on the timer page
          if (!window.location.pathname.includes('/timer')) {
            router.push('/timer');
            // Don't set isChecking to false here since we're redirecting
          } else {
            // Already on timer page, just stop checking
            setIsChecking(false);
          }
        } else {
          // No active timer is a normal state, not an error
          setIsChecking(false);
        }
      } catch (error) {
        // Clear the safety timeout since we got a response
        clearTimeout(safetyTimeout);
        setIsChecking(false);
      }
    };
    
    checkForActiveTimer();
    
    // Clean up the safety timeout if the component unmounts
    return () => {
      clearTimeout(safetyTimeout);
    };
  }, [user, router])

  if (isChecking) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return <>{children}</>
}
