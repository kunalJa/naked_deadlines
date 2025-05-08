import { Suspense } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { TimerDisplay } from "@/components/timer-display"
import { AuthCheck } from "@/components/auth-check"
import { BathroomDecorations } from "@/components/bathroom-decorations"

export default function TimerPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bathroom-background relative overflow-hidden">
        <BathroomDecorations />
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          <section className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Your Deadline is Running</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Complete your goal before time runs out, or your photo will be tweeted.
              </p>
            </div>

            <Suspense fallback={<div className="h-96 flex items-center justify-center">Loading...</div>}>
              <AuthCheck>
                <TimerDisplay />
              </AuthCheck>
            </Suspense>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
