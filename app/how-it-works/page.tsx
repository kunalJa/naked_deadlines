import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Clock, ImageIcon, Mail, Twitter, Bath, ShowerHeadIcon as Shower } from "lucide-react"
import Link from "next/link"

export default function HowItWorksPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <section className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              How NakedDeadlines Works
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A fun (and slightly terrifying) way to keep you accountable! 🙈
            </p>
          </div>

          <div className="space-y-12">
            <Card className="border-4 border-primary/30 rounded-xl shadow-xl overflow-hidden">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 bounce-hover">
                      <ImageIcon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">1. Upload a Photo</h3>
                    <p className="text-muted-foreground">
                      Choose a photo you'd rather keep private! The more embarrassing, the more motivating! 😅
                    </p>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mb-4 bounce-hover">
                      <Clock className="h-8 w-8 text-secondary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">2. Set a Deadline</h3>
                    <p className="text-muted-foreground">
                      Pick when your goal needs to be completed. The shower curtain starts to open as time passes! 🚿
                    </p>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-4 bounce-hover">
                      <Mail className="h-8 w-8 text-accent" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">3. Add a Friend</h3>
                    <p className="text-muted-foreground">
                      Your friend gets a link to verify your goal completion. Choose someone who won't let you cheat!
                      👮‍♀️
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <ArrowRight className="h-8 w-8 text-primary animate-bounce" />
            </div>

            <Card className="border-4 border-primary/30 rounded-xl shadow-xl overflow-hidden">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4 bounce-hover">
                      <Shower className="h-8 w-8 text-green-600 dark:text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">If You Complete Your Goal 🎉</h3>
                    <p className="text-muted-foreground mb-4">
                      Your friend confirms your completion before the curtain fully opens!
                    </p>
                    <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-md w-full border-2 border-green-300 dark:border-green-800">
                      <p className="font-bold text-green-600 dark:text-green-500">
                        Your photo stays private and is deleted! You're safe! 🎊
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4 bounce-hover">
                      <Bath className="h-8 w-8 text-red-600 dark:text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">If You Miss Your Deadline 😱</h3>
                    <p className="text-muted-foreground mb-4">
                      The curtain fully opens and your friend doesn't confirm in time!
                    </p>
                    <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-md w-full border-2 border-red-300 dark:border-red-800">
                      <p className="font-bold text-red-600 dark:text-red-500">
                        Your photo is automatically tweeted from your account! Exposed! 🙈
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center mt-12">
              <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                Ready to Get Motivated? 🚀
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Sign in with Twitter, set your first goal, and experience the power of social pressure!
              </p>
              <Button
                asChild
                size="lg"
                className="gap-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 font-bold text-lg px-8 bounce-hover"
              >
                <Link href="/">
                  <Twitter className="h-5 w-5" />
                  Get Started Now!
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
