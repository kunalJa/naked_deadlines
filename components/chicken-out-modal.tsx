"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface ChickenOutModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function ChickenOutModal({ isOpen, onClose, onConfirm }: ChickenOutModalProps) {
  const [confirmed, setConfirmed] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [paymentAttempts, setPaymentAttempts] = useState(0)
  
  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setConfirmed(false)
      setPaymentStatus('idle')
    }
  }, [isOpen])

  // Helper function to get the base URL
  const getBaseUrl = () => {
    return window.location.origin;
  }
  
  const handleConfirm = async () => {
    // If we've tried twice, just proceed without payment
    if (paymentAttempts >= 2) {
      onConfirm()
      setConfirmed(false)
      setPaymentStatus('idle')
      setPaymentAttempts(0)
      return
    }
    
    try {
      setPaymentStatus('loading')
      
      const baseUrl = getBaseUrl();
      // Create checkout session
      const response = await fetch(`${baseUrl}/api/payments/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Include credentials to ensure the auth cookie is sent
        credentials: 'include'
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        // If we get an authentication error, just proceed with chicken out
        // This simplifies the flow for users
        // if (response.status === 401) {
        //   console.log('Authentication error, proceeding with chicken out anyway')
        //   onConfirm()
        //   setConfirmed(false)
        //   setPaymentStatus('idle')
        //   setPaymentAttempts(prev => prev + 1)
        //   return
        // }
        
        throw new Error(result.error || 'Failed to create checkout session')
      }
      
      // Redirect to the checkout page directly
      if (result.data?.url) {
        // Store the fact that we're in the middle of a payment
        localStorage.setItem('chicken_out_payment_pending', 'true')
        window.location.href = result.data.url
        return
      }
      
      throw new Error('No checkout URL returned')
      
    } catch (error) {
      console.error('Payment error:', error)
      setPaymentStatus('error')
      setPaymentAttempts(prev => prev + 1)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-1 pb-2">
          <DialogTitle className="text-center text-xl font-bold text-yellow-500">🐔 BAWK BAWK BAWK! 🐔</DialogTitle>
          <DialogDescription className="text-center text-base">
            Are you REALLY going to chicken out right now?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="bg-yellow-100 p-3 rounded-lg border-2 border-yellow-300">
            <p className="font-bold text-center text-sm">Your photo is THIS CLOSE to being tweeted!</p>
            <div className="flex justify-center my-2">
              <div className="relative w-16 h-16 bg-muted rounded-full overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-2xl">🙈</div>
                <div
                  className="absolute inset-0 bg-gradient-to-t from-transparent to-background"
                  style={{ height: "60%" }}
                ></div>
              </div>
            </div>
            <p className="text-center italic text-xs">
              Its gonna cost you...
            </p>
          </div>
          
          {paymentStatus === 'error' && (
            <div className="p-3 rounded-lg border-2 border-red-300 bg-red-50">
              <p className="text-center text-sm text-red-600">
                {paymentAttempts < 2 
                  ? "Payment failed. Please try again." 
                  : "Payment failed again. Sorry, lets just skip the price."}
              </p>
            </div>
          )}
          
          {paymentStatus === 'success' && (
            <div className="p-3 rounded-lg border-2 border-green-300 bg-green-50">
              <p className="text-center text-sm text-green-600">
                Payment successful! Processing your chicken out request...
              </p>
            </div>
          )}

          <div className="flex items-start space-x-2">
            <Checkbox
              id="confirm"
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(!!checked)}
              className="mt-1"
            />
            <Label
              htmlFor="confirm"
              className="text-xs font-medium leading-tight peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Yes, I'm a chicken. Bawk bawk. 🐔 I can't finish this goal and accept eternal shame.
            </Label>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <div className="flex flex-col sm:flex-row w-full gap-2 sm:justify-between">
            <Button type="button" variant="outline" onClick={onClose} className="sm:flex-1">
              I'll finish my goal! 💪
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={!confirmed || paymentStatus === 'loading'}
              onClick={handleConfirm}
              className="sm:flex-1"
            >
              {paymentStatus === 'loading' ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : paymentAttempts >= 2 ? (
                "Chicken out for free 🐔"
              ) : (
                "I'm chickening out 🐔"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
