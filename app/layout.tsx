import type React from "react"
import type { Metadata } from "next/types"
import { Inter } from "next/font/google"
import "./globals.css"

import { AuthProvider } from "@/components/auth-provider"
import { LoadingProvider } from "@/components/page-loading"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "NakedDeadlines - Motivational Goal Tracker",
  description: "Complete your goals on time, or risk exposure. Social pressure meets productivity.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className}`}>
        <LoadingProvider>
            <AuthProvider>{children}</AuthProvider>
        </LoadingProvider>
      </body>
    </html>
  )
}
