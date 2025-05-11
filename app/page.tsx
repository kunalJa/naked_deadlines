"use client"

import { Suspense, useEffect, useState } from "react"
import { Header } from "@/components/header"
import { UploadForm } from "@/components/upload-form"
import { AuthCheck } from "@/components/auth-check"
import { Footer } from "@/components/footer"
import { TimerChecker } from "@/components/timer-checker"
import { BathroomDecorations } from "@/components/bathroom-decorations"
import { ActiveTimerRedirect } from "@/components/active-timer-redirect"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, LogIn } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

export default function Home() {
  const searchParams = useSearchParams();
  const sessionExpired = searchParams.get('session_expired');
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bathroom-background relative overflow-hidden">
        <BathroomDecorations />

        <div className="container mx-auto px-4 py-8 relative z-10">
          {sessionExpired === 'true' && (
            <Card className="w-full max-w-md mx-auto mb-8 bg-white/80 backdrop-blur-sm border border-blue-200 shadow-lg relative z-10">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 to-blue-100/30 z-0 rounded-lg"></div>
              
              <CardHeader className="relative z-10 text-center bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-t-lg pb-4">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <AlertCircle className="w-6 h-6 text-blue-500" />
                </div>
                <CardTitle className="text-2xl font-bold text-blue-700">
                  Session Expired
                </CardTitle>
                <CardDescription className="text-blue-600">
                  Your login session has timed out
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-4 px-6 pb-4 relative z-10">
                <div className="space-y-4 text-center">
                  <p className="text-blue-800">
                    For security reasons, your session has expired after a period of inactivity.
                  </p>
                  
                  <p className="text-sm text-blue-600">
                    Don't worry! Your timers are still active. If you pressed create timer, it likely did not get created. You'll need to sign in again to see timers and create new ones.
                  </p>
                  
                  <Button asChild className="bg-blue-600 hover:bg-blue-700 mt-4">
                    <Link href="/api/auth/signin?callbackUrl=/">
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In Again
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        
          <section className="max-w-4xl mx-auto">
            <div className="text-center mb-12 bathroom-sign">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
                Complete Your Goals, Or Face Exposure
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto bubble-text">
                Upload a photo, set a deadline, and if you don't complete your goal in time, the photo gets tweeted from
                your account. Social pressure meets productivity. No images are uploaded to any servers, they are stored only on your device.
              </p>
            </div>

            <Suspense fallback={<div className="h-96 flex items-center justify-center">Loading...</div>}>
              <AuthCheck>
                <ActiveTimerRedirect>
                  <UploadForm />
                </ActiveTimerRedirect>
              </AuthCheck>
            </Suspense>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
