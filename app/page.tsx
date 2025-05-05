import { Suspense } from "react"
import { Header } from "@/components/header"
import { UploadForm } from "@/components/upload-form"
import { AuthCheck } from "@/components/auth-check"
import { Footer } from "@/components/footer"
import { Bath, Droplets, ShowerHeadIcon as Shower, Waves } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bathroom-background relative overflow-hidden">
        {/* Decorative bathroom elements */}
        <div className="absolute top-10 left-10 animate-float hidden md:block">
          <Shower className="h-16 w-16 text-blue-400" />
        </div>
        <div className="absolute bottom-20 right-10 animate-float-delay hidden md:block">
          <Bath className="h-16 w-16 text-pink-400" />
        </div>
        <div className="absolute top-40 right-20 animate-spin-slow hidden md:block">
          <Droplets className="h-12 w-12 text-blue-300" />
        </div>
        <div className="absolute bottom-40 left-20 animate-bounce hidden md:block">
          <Waves className="h-12 w-12 text-blue-300" />
        </div>

        {/* Rubber ducks */}
        <div className="rubber-duck duck-1"></div>
        <div className="rubber-duck duck-2"></div>
        <div className="rubber-duck duck-3"></div>

        {/* Water droplets */}
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className={`water-drop drop-${i + 1}`}></div>
        ))}

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
                <UploadForm />
              </AuthCheck>
            </Suspense>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
