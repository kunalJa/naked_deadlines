"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { BathroomDecorations } from "@/components/bathroom-decorations"
import { Home, HeartHandshake } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function FailurePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bathroom-background relative overflow-hidden">
        <BathroomDecorations />
      <div className="container mx-auto px-4 py-8 relative z-10">
      <div className="container flex flex-col items-center justify-center py-12 relative">
      
      <Card className="w-full max-w-md mx-auto bg-white/80 backdrop-blur-sm border border-blue-200 shadow-lg relative z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 to-blue-100/30 z-0 rounded-lg"></div>
        
        <CardHeader className="relative z-10 text-center bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-t-lg pb-4">
          <CardTitle className="text-2xl font-bold text-blue-700">
            Not Every Journey Ends as Planned
          </CardTitle>
          <CardDescription className="text-blue-600">
            But every experience teaches us something valuable
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6 px-6 pb-4 relative z-10">
          <div className="space-y-4 text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <HeartHandshake className="w-8 h-8 text-blue-500" />
            </div>
            
            <p className="text-lg font-medium text-blue-800">
              Your embarrassing photo has been shared with the world.
            </p>
            
            <p className="text-sm text-blue-600">
              We hope you made at least some progress on your goal! The world has seen your naked truth, but this is just one moment in your journey.
            </p>
            
            <blockquote className="italic border-l-4 border-blue-300 pl-3 py-2 text-blue-700 bg-blue-50/50 rounded-r-md mt-4">
              "Some things are O. K."
            </blockquote>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center pb-6 relative z-10">
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Start a New Goal
            </Link>
          </Button>
        </CardFooter>
      </Card>
        </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
