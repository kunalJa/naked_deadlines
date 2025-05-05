"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ImagePreview } from "@/components/image-preview"
import { CheckCircle2, XCircle } from "lucide-react"
import { confirmGoalCompletion } from "@/lib/actions"

interface ConfirmationFormProps {
  token: string
}

// Mock data - in a real app this would come from the server
const mockConfirmationData = {
  userName: "John Doe",
  goalDescription: "Complete my project proposal",
  imageUrl: "/placeholder.svg?height=400&width=400",
  deadline: Date.now() + 2 * 60 * 60 * 1000, // 2 hours from now
}

export function ConfirmationForm({ token }: ConfirmationFormProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [confirmationData, setConfirmationData] = useState(mockConfirmationData)
  const [isConfirming, setIsConfirming] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchConfirmationData = async () => {
      try {
        // In a real app, this would fetch the confirmation data from the server
        // const data = await getConfirmationData(token)
        // setConfirmationData(data)

        // For now, we'll use the mock data
        setConfirmationData({
          ...mockConfirmationData,
          token: token, // Add the token to the confirmation data
        })
        setIsLoading(false)
      } catch (error) {
        console.error("Failed to fetch confirmation data:", error)
        setError("Invalid or expired confirmation link")
        setIsLoading(false)
      }
    }

    fetchConfirmationData()
  }, [token])

  const handleConfirm = async () => {
    setIsConfirming(true)
    setError(null) // Clear any previous errors

    try {
      // In a real app, this would call the API to confirm the goal completion
      await confirmGoalCompletion(token)
      setIsConfirmed(true)
    } catch (error) {
      console.error("Failed to confirm goal completion:", error)
      setError("Failed to confirm goal completion. Please try again.")
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
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-red-600">Error</CardTitle>
          <CardDescription>We couldn't process your confirmation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6">
            <XCircle className="h-16 w-16 text-red-600 mb-4" />
            <p className="text-center">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isConfirmed) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-green-600">Goal Confirmed!</CardTitle>
          <CardDescription>
            You've successfully confirmed that {confirmationData.userName} completed their goal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6">
            <CheckCircle2 className="h-16 w-16 text-green-600 mb-4" />
            <p className="text-center">
              The photo will not be tweeted. Thank you for helping your friend stay accountable!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Confirm Goal Completion</CardTitle>
        <CardDescription>
          {confirmationData.userName} has asked you to verify they've completed their goal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Goal</h3>
              <p>{confirmationData.goalDescription}</p>
            </div>

            <div>
              <h3 className="text-lg font-medium">Deadline</h3>
              <p>{new Date(confirmationData.deadline).toLocaleString()}</p>
            </div>

            <div className="bg-muted p-4 rounded-md">
              <h3 className="text-lg font-medium mb-2">Your Role</h3>
              <p className="text-sm">
                If you confirm that {confirmationData.userName} has completed their goal, the photo will not be tweeted.
                If you don't confirm before the deadline, the photo will be automatically tweeted from their account.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <ImagePreview imageUrl={confirmationData.imageUrl} progress={50} showTowel={true} />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleConfirm} disabled={isConfirming} className="gap-2">
          {isConfirming ? "Confirming..." : "Confirm Goal Completion"}
          <CheckCircle2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
