import { Suspense } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ConfirmationForm } from "@/components/confirmation-form"
import { BathroomDecorations } from "@/components/bathroom-decorations"

interface ConfirmationPageProps {
  params: {
    token: string
  }
}

export default async function ConfirmationPage({ params }: ConfirmationPageProps) {
  const { token } = await params

  return (
    <div className="flex min-h-screen flex-col relative overflow-hidden">
      {/* Add bathroom decorations */}
      <BathroomDecorations />
      
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        <section className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Confirm Goal Completion</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              You've been asked to verify that your friend has completed their goal.
            </p>
            {/* Add token information for debugging */}
            <p className="text-xs text-muted-foreground mt-2">Confirmation ID: {token}</p>
          </div>

          <Suspense fallback={<div className="h-96 flex items-center justify-center">Loading...</div>}>
            <ConfirmationForm token={token} />
          </Suspense>
        </section>
      </main>
      <Footer />
    </div>
  )
}
