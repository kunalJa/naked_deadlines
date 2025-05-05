"use server"

import { revalidatePath } from "next/cache"

// In a real app, these functions would interact with a database
// and external services like email and Twitter API

interface TimerData {
  imageId: string
  deadline: number
  friendEmail: string
  goalDescription: string
}

// Mock in-memory storage - in a real app, this would be a database
const activeTimers = new Map<string, any>()

// Add a default test token for development purposes
const DEFAULT_TEST_TOKEN = "test-token-123"
activeTimers.set(DEFAULT_TEST_TOKEN, {
  imageId: "default-image-id",
  deadline: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
  friendEmail: "friend@example.com",
  goalDescription: "Test goal description",
  token: DEFAULT_TEST_TOKEN,
  createdAt: Date.now(),
  isCompleted: false,
})

/**
 * Starts a new timer for a goal
 */
export async function startTimer(data: TimerData) {
  try {
    // Generate a unique token for this timer
    const token = Math.random().toString(36).substring(2, 15)

    // Store the timer data
    const timerData = {
      ...data,
      token,
      createdAt: Date.now(),
      isCompleted: false,
    }

    activeTimers.set(token, timerData)

    // In a real app, we would:
    // 1. Store the image and timer data in a database
    // 2. Send an email to the friend with the confirmation link
    // 3. Schedule a job to tweet the image if not confirmed by deadline

    console.log("Timer started:", timerData)

    return { success: true, token }
  } catch (error) {
    console.error("Failed to start timer:", error)
    throw new Error("Failed to start timer")
  }
}

/**
 * Gets the active timer for the current user
 */
export async function getActiveTimer() {
  try {
    // In a real app, we would fetch the active timer from the database
    // based on the current user's ID

    // For now, we'll just return the first timer in our mock storage
    const timers = Array.from(activeTimers.values())
    return timers[0] || null
  } catch (error) {
    console.error("Failed to get active timer:", error)
    throw new Error("Failed to get active timer")
  }
}

/**
 * Confirms that a goal has been completed
 */
export async function confirmGoalCompletion(token: string) {
  try {
    console.log("Confirming goal completion for token:", token)

    // In a real app, we would:
    // 1. Validate the token
    // 2. Mark the goal as completed in the database
    // 3. Cancel the scheduled tweet job

    // For development, accept any token that starts with "test-"
    const isTestToken = token.startsWith("test-")

    if (!activeTimers.has(token) && !isTestToken) {
      console.error("Token not found in activeTimers:", token)
      console.log("Available tokens:", Array.from(activeTimers.keys()))

      // For development purposes, use the default test token
      token = DEFAULT_TEST_TOKEN
    }

    // Get the timer data (either the real one or the default test one)
    const timerData = activeTimers.get(token) || activeTimers.get(DEFAULT_TEST_TOKEN)

    if (!timerData) {
      throw new Error("No timer data found")
    }

    timerData.isCompleted = true
    activeTimers.set(token, timerData)

    console.log("Goal completed:", timerData)

    // Revalidate the timer page to reflect the changes
    revalidatePath("/timer")

    return { success: true }
  } catch (error) {
    console.error("Failed to confirm goal completion:", error)
    throw new Error("Failed to confirm goal completion")
  }
}

/**
 * Tweets the image if the goal is not completed by the deadline
 * This would be called by a scheduled job in a real app
 */
export async function tweetImageIfNotCompleted(token: string) {
  try {
    if (!activeTimers.has(token)) {
      throw new Error("Invalid token")
    }

    const timerData = activeTimers.get(token)

    if (timerData.isCompleted) {
      console.log("Goal was completed, not tweeting image")
      return { success: true, tweeted: false }
    }

    if (Date.now() < timerData.deadline) {
      console.log("Deadline not reached yet, not tweeting image")
      return { success: true, tweeted: false }
    }

    // In a real app, we would:
    // 1. Get the image from storage
    // 2. Use the Twitter API to tweet the image

    console.log("Tweeting image for uncompleted goal:", timerData)

    return { success: true, tweeted: true }
  } catch (error) {
    console.error("Failed to tweet image:", error)
    throw new Error("Failed to tweet image")
  }
}
