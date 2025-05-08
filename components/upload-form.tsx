"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImagePreview } from "@/components/image-preview"
import { FriendEmailForm } from "@/components/friend-email-form"
import { Upload, Camera, Bomb, Twitter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/auth-provider"
import { saveTimer } from "@/services/timer-service"
import { TimerData } from "@/types/timer"
import { useToast } from "@/components/ui/use-toast"

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
  const [isTweeting, setIsTweeting] = useState(false)
  const [tweetResult, setTweetResult] = useState<{ success: boolean; message: string } | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  // Load image from local storage when component mounts
  useEffect(() => {
    // Only run in the browser, not during server-side rendering
    if (typeof window !== 'undefined') {
      const savedImagePreview = localStorage.getItem('nakedDeadlines_imagePreview');
      if (savedImagePreview) {
        setImagePreview(savedImagePreview);
        
        // Convert base64 to File object
        const fetchImageFile = async () => {
          try {
            const response = await fetch(savedImagePreview);
            const blob = await response.blob();
            const fileName = localStorage.getItem('nakedDeadlines_imageName') || 'image.jpg';
            const fileType = localStorage.getItem('nakedDeadlines_imageType') || 'image/jpeg';
            const file = new File([blob], fileName, { type: fileType });
            setImage(file);
          } catch (error) {
            console.error('Error converting saved image to File:', error);
          }
        };
        
        fetchImageFile();
      }
    }
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // When a new image is uploaded, we'll replace the old one
      const file = e.target.files[0]
      setImage(file)

      // Create a preview URL for the image
      const reader = new FileReader()
      reader.onloadend = () => {
        const previewUrl = reader.result as string;
        setImagePreview(previewUrl)
        
        // Save to local storage - this automatically replaces any previous image
        if (typeof window !== 'undefined') {
          localStorage.setItem('nakedDeadlines_imagePreview', previewUrl);
          localStorage.setItem('nakedDeadlines_imageName', file.name);
          localStorage.setItem('nakedDeadlines_imageType', file.type);
        }
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

  const handleTestTweet = async () => {
    if (!image) {
      setTweetResult({ success: false, message: "Please upload an image first" })
      return
    }
    
    setIsTweeting(true)
    setTweetResult(null)
    
    try {
      const formData = new FormData()
      formData.append("image", image)
      formData.append("message", `Test tweet 🙈 #productivity`)
      
      const response = await fetch("/api/tweet", {
        method: "POST",
        body: formData
      })
      
      if (!response.ok) {
        throw new Error(`Failed to tweet: ${response.status}`)
      }
      
      const result = await response.json()
      setTweetResult({ 
        success: true, 
        message: `Tweet posted successfully! Tweet ID: ${result.tweetId}` 
      })
    } catch (error) {
      console.error("Error sending test tweet:", error)
      setTweetResult({ 
        success: false, 
        message: `Failed to tweet: ${error instanceof Error ? error.message : String(error)}` 
      })
    } finally {
      setIsTweeting(false)
    }
  }

  // Function to clear the image from state and local storage
  const clearSavedImage = () => {
    setImage(null);
    setImagePreview(null);
    
    // Clear from local storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nakedDeadlines_imagePreview');
      localStorage.removeItem('nakedDeadlines_imageName');
      localStorage.removeItem('nakedDeadlines_imageType');
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSaveError(null)

    const isFormValid = () => {
      return !(!image ||
        (!deadline && activeTab === "date") ||
        ((!durationHours || durationHours === "0") &&
          (!durationMinutes || durationMinutes === "0") &&
          activeTab === "duration") ||
        !friendEmail ||
        !goalDescription)
    }

    if (!isFormValid()) {
      setIsSubmitting(false)
      return
    }

    try {
      if (!user?.name) {
        throw new Error("You must be logged in to start a timer")
      }

      // Calculate the deadline timestamp
      let deadlineDate: Date

      if (activeTab === "date") {
        // Combine date and time
        const [year, month, day] = deadline.split("-").map(Number)
        const [hours, minutes] = deadlineTime.split(":").map(Number)

        deadlineDate = new Date(year, month - 1, day, hours, minutes)
      } else {
        // Convert hours and minutes to milliseconds and add to current time
        const hoursMs = Number.parseInt(durationHours || "0") * 60 * 60 * 1000
        const minutesMs = Number.parseInt(durationMinutes || "0") * 60 * 1000
        deadlineDate = new Date(Date.now() + hoursMs + minutesMs)
      }
      
      // Convert to ISO string for storage
      const deadlineTimestamp = deadlineDate.toISOString()

      // We're keeping the image entirely local to the browser
      // No image data is ever sent to the server for privacy reasons
      // Generate a unique key for the image in local storage
      const imageKey = `nakedDeadlines_${user.name}_${Date.now()}`
      
      // Save the current image with the new key
      if (imagePreview) {
        localStorage.setItem(`${imageKey}_preview`, imagePreview)
        if (image) {
          localStorage.setItem(`${imageKey}_name`, image.name)
          localStorage.setItem(`${imageKey}_type`, image.type)
        }
      }

      // Generate a UUID for the confirmation token
      // This will be used in the verification link sent to the friend
      const confirmationToken = crypto.randomUUID();
      
      // Save timer data to Supabase
      const timerData = {
        username: user.name,
        imagekey: imageKey,
        goaldescription: goalDescription,
        deadline: deadlineTimestamp,
        friendemail: friendEmail,
        confirmationtoken: confirmationToken,
        isverified: false, // Default to unverified until friend confirms
        createdat: new Date().toISOString() // Set creation time on client side
      }

      const result = await saveTimer(timerData)

      if (!result.success) {
        throw new Error(result.error || "Failed to save timer data")
      }

      // Redirect to the timer page - no need to pass username in URL
      // The timer will use the authenticated user's information
      router.push('/timer')
    } catch (error) {
      console.error("Failed to start timer:", error)
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
      setSaveError(errorMessage)
      toast({
        title: "Error starting timer",
        description: errorMessage,
        variant: "destructive",
      })
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
                
                <div className="mt-2 p-3 border-2 border-green-400 rounded-md bg-green-100 dark:bg-green-900/30">
                  <p className="text-sm font-bold flex items-center">
                    <span className="mr-2">🔒</span>
                    Your photos are 100% private and stored ONLY in your browser.
                  </p>
                  <p className="text-xs mt-1">
                    Images are never uploaded to our servers. Your privacy is our priority! The image will be uploaded to twitter if you fail your deadline however.
                  </p>
                </div>

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
      {/* Test Tweet Button */}
      {user && image && (
        <div className="mt-4 p-4 border-t border-dashed border-primary/30">
          <div className="flex flex-col items-center">
            <p className="text-sm font-medium mb-2">Test the Twitter integration:</p>
            <Button 
              type="button" 
              onClick={handleTestTweet} 
              disabled={isTweeting || !image} 
              variant="outline"
              className="gap-2 relative"
            >
              {isTweeting ? (
                <>
                  <span className="opacity-0">Test Tweet This Image</span>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                      <span>Posting...</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Twitter className="h-4 w-4" />
                  Test Tweet This Image
                </>
              )}
            </Button>
            
            {tweetResult && (
              <div className={`mt-2 p-2 rounded text-sm ${tweetResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {tweetResult.message}
              </div>
            )}
          </div>
        </div>
      )}
      
      <CardFooter className="flex justify-end bg-gradient-to-r from-primary/10 to-secondary/10 rounded-b-lg p-6">
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 font-bold text-lg px-8 bounce-hover disabled:opacity-30 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500 disabled:hover:from-gray-400 disabled:hover:to-gray-500 relative"
        >
          {isSubmitting ? (
            <>
              <span className="opacity-0">Start The Countdown! 🚀</span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Starting...</span>
                </div>
              </div>
            </>
          ) : (
            "Start The Countdown! 🚀"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
