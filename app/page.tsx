import { Suspense } from "react"
import { Header } from "@/components/header"
import { UploadForm } from "@/components/upload-form"
import { AuthCheck } from "@/components/auth-check"
import { Footer } from "@/components/footer"
import { TimerChecker } from "@/components/timer-checker"
import { BathroomDecorations } from "@/components/bathroom-decorations"
import { ActiveTimerRedirect } from "@/components/active-timer-redirect"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bathroom-background relative overflow-hidden">
        <BathroomDecorations />

        <div className="container mx-auto px-4 py-8 relative z-10">
          <section className="max-w-4xl mx-auto">
            <div className="text-center mb-12 bathroom-sign">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
                Complete Your Goals, Or Face Exposure
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto bubble-text">
                Upload a photo, set a deadline, and if you don't complete your goal in time, the photo gets tweeted from
                your account. Social pressure meets productivity.
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
