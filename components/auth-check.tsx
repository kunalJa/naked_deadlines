"use client"

import type React from "react"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Twitter } from "lucide-react"
import Link from "next/link"
import { TimerChecker } from "@/components/timer-checker"

export function AuthCheck({ children }: { children: React.ReactNode }) {
  const { user, isLoading, signIn } = useAuth()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 p-8 border rounded-lg bg-card">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Sign in to get started</h2>
          <p className="text-muted-foreground">Connect with Twitter to create your motivational deadlines</p>
        </div>

        <Button onClick={signIn} className="gap-2">
          <Twitter className="h-4 w-4" />
          Sign in with Twitter
        </Button>

        <p className="text-[0.65rem] text-muted-foreground/70 max-w-md text-center">
          By signing in, you authorize the app to post to your Twitter account if you fail to meet your deadlines. You
          agree to our{" "}
          <Link href="/terms" className="text-primary hover:underline">
            Terms and Conditions
          </Link>
          . All images must comply with{" "}
          <a
            href="https://help.twitter.com/en/rules-and-policies/twitter-rules"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Twitter's Terms of Service
          </a>
          .
        </p>
      </div>
    )
  }

  return <TimerChecker>{children}</TimerChecker>
}
