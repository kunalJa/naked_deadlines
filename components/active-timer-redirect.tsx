"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { getActiveTimer } from "@/services/timer-service"

export function ActiveTimerRedirect({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user } = useAuth()
  const [isChecking, setIsChecking] = useState(true)
  
  useEffect(() => {
    // Only check for active timers if the user is logged in with Twitter
    if (user?.twitterHandle) {
      const checkForActiveTimer = async () => {
        try {
          setIsChecking(true)
          const result = await getActiveTimer()
          
          // If there's an active timer, redirect to the timer page
          if (result.success && result.data) {
            router.push('/timer')
          } else {
            setIsChecking(false)
          }
        } catch (error) {
          setIsChecking(false)
        }
      }
      
      checkForActiveTimer()
    } else {
      // If user is not logged in, don't check for timers
      setIsChecking(false)
    }
  }, [user, router])
  
  // Show a loading state while checking for active timers
  if (isChecking) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }
  
  // If no active timer or not logged in, show the children (upload form)
  return <>{children}</>
}
