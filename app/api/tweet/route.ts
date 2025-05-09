import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

// Maximum file size for direct upload (5MB in bytes)
const MAX_DIRECT_UPLOAD_SIZE = 5 * 1024 * 1024

export async function POST(req: NextRequest) {
  // Get the token from NextAuth JWT
  const token = await getToken({ 
    req, 
    secret: process.env.AUTH_SECRET 
  })
  
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }
  
  try {
    const formData = await req.formData()
    const image = formData.get("image") as File
    const message = formData.get("message") as string || "Test tweet from Naked Deadlines app! #productivity"
    
    // For Twitter API, we need an access token
    // Get it from the token we received from NextAuth
    const accessToken = token.accessToken as string
    
    let mediaId: string
    
    // Check file size to determine upload method
    if (image.size <= MAX_DIRECT_UPLOAD_SIZE) {
      try {
        // Try direct upload first for files under 5MB
        console.log("Attempting direct media upload (file size: " + image.size + " bytes)")
        mediaId = await uploadMediaDirect(image, accessToken)
      } catch (uploadError) {
        // console.error("Direct upload failed, falling back to chunked upload:", uploadError)
        throw uploadError
        // Fall back to chunked upload if direct upload fails
        // mediaId = await uploadImageToTwitter(image, accessToken)
      }
    } else {
      console.log("File exceeds 5MB limit, using chunked upload (file size: " + image.size + " bytes)")
      throw new Error(`File size exceeds 5MB limit for direct upload: ${image.size} bytes`)
      // Use chunked upload for files larger than 5MB
      // mediaId = await uploadImageToTwitter(image, accessToken)
    }
    
    // Post the tweet with the image
    if (!mediaId) {
      throw new Error("Media ID is undefined after upload process")
    }
    await new Promise(resolve => setTimeout(resolve, 5 * 1000)) // mimic the check status but since we have rate limit dont check
    
    const tweet = await postTweetWithMedia(message, mediaId, accessToken)
    
    return NextResponse.json({ success: true, tweetId: tweet.data.id })
  } catch (error) {
    console.error("Error tweeting:", error)
    return NextResponse.json({ error: "Failed to tweet" }, { status: 500 })
  }
}

// Function for direct media upload (for files under 5MB)
async function uploadMediaDirect(image: File, accessToken: string): Promise<string> {
  // Check file size
  if (image.size > MAX_DIRECT_UPLOAD_SIZE) {
    throw new Error(`File size exceeds 5MB limit for direct upload: ${image.size} bytes`)
  }
  
  const arrayBuffer = await image.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  
  // Create FormData for the direct upload
  const formData = new FormData()
  
  // Create a Blob from the buffer with the correct MIME type
  const mediaBlob = new Blob([buffer], { type: image.type })
  
  // 1. Append the media file itself with proper name
  formData.append("media", mediaBlob, image.name || 'image')
  
  // 2. Append the media_category for a tweet image
  formData.append("media_category", "tweet_image")
  
  // Make the direct upload request
  const response = await fetch("https://api.x.com/2/media/upload", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`
      // Content-Type is automatically set by fetch for FormData
    },
    body: formData
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Twitter direct media upload error: ${response.status} - ${errorText}`)
  }
  
  const data = await response.json()
  // console.log("Direct upload response:", JSON.stringify(data))
  
  // Twitter API v2 returns media_key instead of media_id_string
  if (data.id) {
    return data.id;
  } else {
    throw new Error(`Twitter API did not return a media_key or media_id_string: ${JSON.stringify(data)}`)
  }
}

// Function to upload image to Twitter using v2 API with chunked upload
async function uploadImageToTwitter(image: File, accessToken: string) {
  // Convert File to ArrayBuffer
  const arrayBuffer = await image.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  
  // Step 1: INIT - Initialize the upload
  const initResponse = await fetch("https://api.x.com/2/media/upload/initialize", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      media_category: "tweet_image", // For images
      media_type: image.type,
      total_bytes: buffer.length
    })
  })
  
  if (!initResponse.ok) {
    const errorText = await initResponse.text()
    throw new Error(`Twitter media upload INIT error: ${initResponse.status} - ${errorText}`)
  }
  
  const initData = await initResponse.json()
  const mediaId = initData.media_id_string
  
  // Step 2: APPEND - Upload the media in chunks
  const chunkSize = 1000000 // 1MB chunks
  for (let i = 0; i < buffer.length; i += chunkSize) {
    const chunk = buffer.slice(i, i + chunkSize)
    const segmentIndex = Math.floor(i / chunkSize)
    
    // Create FormData with the chunk
    const formData = new FormData()
    formData.append("media", new Blob([chunk]), image.name || 'media_chunk')
    
    // Construct URL with query parameter for segment_index
    const appendUrl = new URL(`https://api.x.com/2/media/upload/${mediaId}/append`)
    appendUrl.searchParams.set("segment_index", segmentIndex.toString())
    
    const appendResponse = await fetch(appendUrl.toString(), {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        // Content-Type is automatically set by fetch for FormData
      },
      body: formData
    })
    
    if (!appendResponse.ok) {
      const errorText = await appendResponse.text()
      console.error("APPEND Error Body:", errorText) // Log error body for debugging
      throw new Error(`Twitter media upload APPEND error: ${appendResponse.status} - ${errorText}`)
    }
    // Note: Successful APPEND usually returns 204 No Content, no JSON body
  }
  
  // Step 3: FINALIZE - Complete the upload
  const finalizeResponse = await fetch(`https://api.x.com/2/media/upload/${mediaId}/finalize`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    }
  })
  
  if (!finalizeResponse.ok) {
    const errorText = await finalizeResponse.text()
    throw new Error(`Twitter media upload FINALIZE error: ${finalizeResponse.status} - ${errorText}`)
  }
  
  // Wait for media processing to complete (optional but recommended)
  const finalizeData = await finalizeResponse.json()
  if (finalizeData.processing_info && finalizeData.processing_info.state !== "succeeded") {
    await waitForMediaProcessing(mediaId, accessToken, finalizeData.processing_info)
  }
  
  return mediaId
}

// Helper function to wait for media processing to complete
async function waitForMediaProcessing(mediaId: string, accessToken: string, processingInfo: any) {
  if (processingInfo.state === "succeeded") {
    return
  }
  
  const checkAfterSecs = processingInfo.check_after_secs || 1
  
  // Wait for the specified time
  await new Promise(resolve => setTimeout(resolve, checkAfterSecs * 1000))
  
  // Check status
  const statusResponse = await fetch(`https://api.x.com/2/media/upload/${mediaId}/status`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    }
  })
  
  if (!statusResponse.ok) {
    throw new Error(`Twitter media status check error: ${statusResponse.status}`)
  }
  
  const statusData = await statusResponse.json()
  
  if (statusData.processing_info.state === "failed") {
    throw new Error(`Media processing failed: ${statusData.processing_info.error.message}`)
  }
  
  if (statusData.processing_info.state !== "succeeded") {
    // Recursive call to check again after the specified time
    await waitForMediaProcessing(mediaId, accessToken, statusData.processing_info)
  }
}

// Function to post a tweet with media
async function postTweetWithMedia(text: string, mediaId: string, accessToken: string) {
  const response = await fetch("https://api.x.com/2/tweets", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      text,
      media: { media_ids: [mediaId] }
    })
  })
  
  if (!response.ok) {
    throw new Error(`Twitter API error: ${response.status}`)
  }
  
  return await response.json()
}
