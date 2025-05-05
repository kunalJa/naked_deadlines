"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImagePreview } from "@/components/image-preview"
import { FriendEmailForm } from "@/components/friend-email-form"
import { Upload, Camera, Bomb } from "lucide-react"
import { startTimer } from "@/lib/actions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function UploadForm() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [deadline, setDeadline] = useState<string>("")
  const [deadlineTime, setDeadlineTime] = useState<string>("12:00")
  const [durationHours, setDurationHours] = useState<string>("24")
  const [durationMinutes, setDurationMinutes] = useState<string>("0")
  const [friendEmail, setFriendEmail] = useState<string>("")
  const [goalDescription, setGoalDescription] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("date")

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImage(file)

      // Create a preview URL for the image
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadClick = () => {
    // Trigger the hidden file input when the button is clicked
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !image ||
      (!deadline && activeTab === "date") ||
      ((!durationHours || durationHours === "0") &&
        (!durationMinutes || durationMinutes === "0") &&
        activeTab === "duration") ||
      !friendEmail ||
      !goalDescription
    ) {
      // Show validation error
      return
    }

    setIsSubmitting(true)

    try {
      // Calculate the deadline timestamp
      let deadlineTimestamp: number

      if (activeTab === "date") {
        // Combine date and time
        const [year, month, day] = deadline.split("-").map(Number)
        const [hours, minutes] = deadlineTime.split(":").map(Number)

        const deadlineDate = new Date(year, month - 1, day, hours, minutes)
        deadlineTimestamp = deadlineDate.getTime()
      } else {
        // Convert hours and minutes to milliseconds and add to current time
        const hoursMs = Number.parseInt(durationHours || "0") * 60 * 60 * 1000
        const minutesMs = Number.parseInt(durationMinutes || "0") * 60 * 1000
        deadlineTimestamp = Date.now() + hoursMs + minutesMs
      }

      // In a real app, we would upload the image to a server here
      // For now, we'll just simulate the API call

      // Start the timer
      await startTimer({
        imageId: "temp-image-id", // This would be the ID of the uploaded image
        deadline: deadlineTimestamp,
        friendEmail,
        goalDescription,
      })

      // Redirect to the timer page
      router.push("/timer")
    } catch (error) {
      console.error("Failed to start timer:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Generate time options for the select
  const generateTimeOptions = () => {
    const options = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const formattedHour = hour.toString().padStart(2, "0")
        const formattedMinute = minute.toString().padStart(2, "0")
        const time = `${formattedHour}:${formattedMinute}`
        const label = `${hour % 12 || 12}:${formattedMinute} ${hour < 12 ? "AM" : "PM"}`
        options.push({ value: time, label })
      }
    }
    return options
  }

  const timeOptions = generateTimeOptions()

  const isFormValid =
    image &&
    friendEmail &&
    goalDescription &&
    ((activeTab === "date" && deadline && deadlineTime) ||
      (activeTab === "duration" &&
        ((durationHours && durationHours !== "0") || (durationMinutes && durationMinutes !== "0"))))

  return (
    <Card className="w-full border-4 border-primary/30 rounded-xl shadow-xl">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-t-lg">
        <CardTitle className="text-2xl font-extrabold text-center">Create Your Motivational Deadline! 🎯</CardTitle>
        <CardDescription className="text-center text-base">
          Upload a photo that will be EXPOSED if you don't complete your goal in time! 😱
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-accent/20 p-4 rounded-lg">
                <Label htmlFor="image" className="flex items-center gap-2 text-lg font-bold">
                  <Camera className="h-5 w-5 text-primary" />
                  Upload Your "Motivational" Photo
                </Label>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />

                {/* Single upload button */}
                <Button
                  type="button"
                  onClick={handleUploadClick}
                  className="w-full mt-2 gap-2 bg-accent hover:bg-accent/90 text-accent-foreground bounce-hover"
                >
                  <Upload className="h-4 w-4" />
                  {image ? "Change Photo" : "Choose a Photo"}
                </Button>

                {/* Show selected file name if an image is selected */}
                {image && (
                  <div className="mt-2 text-sm bg-white/50 dark:bg-black/20 p-2 rounded flex items-center">
                    <div className="w-6 h-6 bg-accent/30 rounded-full flex items-center justify-center mr-2">
                      <Camera className="h-3 w-3" />
                    </div>
                    <span className="truncate">{image.name}</span>
                  </div>
                )}

                <p className="text-sm text-muted-foreground mt-2 italic">
                  Choose wisely! This photo will be tweeted if you fail! 🙈
                </p>
              </div>

              <div className="bg-secondary/20 p-4 rounded-lg">
                <Label htmlFor="goal" className="text-lg font-bold">
                  What's Your Goal? 🏆
                </Label>
                <Input
                  id="goal"
                  placeholder="What do you want to accomplish?"
                  value={goalDescription}
                  onChange={(e) => setGoalDescription(e.target.value)}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-2 italic">
                  Be specific so your friend knows exactly what to verify!
                </p>
              </div>

              <div className="bg-primary/20 p-4 rounded-lg">
                <Label className="flex items-center gap-2 text-lg font-bold">
                  <Bomb className="h-5 w-5 text-primary" />
                  Set Your Deadline ⏰
                </Label>
                <Tabs defaultValue="date" value={activeTab} onValueChange={setActiveTab} className="mt-2">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="date">Specific Date</TabsTrigger>
                    <TabsTrigger value="duration">Duration</TabsTrigger>
                  </TabsList>
                  <TabsContent value="date" className="pt-2">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <Label htmlFor="deadline-date" className="text-sm">
                            Date
                          </Label>
                          <Input
                            id="deadline-date"
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                            className="flex-1"
                          />
                        </div>
                        <div className="flex-1">
                          <Label htmlFor="deadline-time" className="text-sm">
                            Time
                          </Label>
                          <Select value={deadlineTime} onValueChange={setDeadlineTime}>
                            <SelectTrigger id="deadline-time" className="w-full">
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="duration" className="pt-2">
                    <div className="space-y-2">
                      <Label className="text-sm">Duration</Label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <Input
                            type="number"
                            min="0"
                            max="168"
                            value={durationHours}
                            onChange={(e) => setDurationHours(e.target.value)}
                            className="flex-1"
                          />
                          <Label className="text-xs text-center block mt-1">Hours</Label>
                        </div>
                        <div className="flex-1">
                          <Input
                            type="number"
                            min="0"
                            max="59"
                            value={durationMinutes}
                            onChange={(e) => setDurationMinutes(e.target.value)}
                            className="flex-1"
                          />
                          <Label className="text-xs text-center block mt-1">Minutes</Label>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {durationHours !== "0" && `${durationHours} hour${durationHours === "1" ? "" : "s"}`}
                        {durationHours !== "0" && durationMinutes !== "0" && " and "}
                        {durationMinutes !== "0" && `${durationMinutes} minute${durationMinutes === "1" ? "" : "s"}`}
                        {(durationHours !== "0" || durationMinutes !== "0") && " from now"}
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <FriendEmailForm email={friendEmail} setEmail={setFriendEmail} />
            </div>

            <div className="flex flex-col items-center justify-center">
              <ImagePreview imageUrl={imagePreview} progress={0} showTowel={true} />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end bg-gradient-to-r from-primary/10 to-secondary/10 rounded-b-lg p-6">
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 font-bold text-lg px-8 bounce-hover disabled:opacity-30 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500 disabled:hover:from-gray-400 disabled:hover:to-gray-500"
        >
          {isSubmitting ? "Starting..." : "Start The Countdown! 🚀"}
        </Button>
      </CardFooter>
    </Card>
  )
}
