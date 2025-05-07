import Link from "next/link"
import { Bath, AlertCircle } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-gradient-to-r from-primary/20 to-secondary/20">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row py-4 px-6 mx-auto">
        <div className="flex items-center gap-2">
          <Bath className="h-5 w-5 text-primary" />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} NakedDeadlines. Exposing procrastination since 2023! 🙈
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/privacy" className="text-sm text-muted-foreground hover:underline bounce-hover">
            Privacy
          </Link>
          <Link href="/terms" className="text-sm text-muted-foreground hover:underline bounce-hover">
            Terms
          </Link>
        </div>
      </div>

      <div className="w-full bg-muted/50 py-2">
        <div className="container flex items-center justify-center gap-2 text-xs text-muted-foreground px-6 mx-auto">
          <AlertCircle className="h-3 w-3" />
          <p>
            NakedDeadlines is not affiliated with, endorsed by, or sponsored by Twitter. Twitter is a trademark of X
            Corp.
          </p>
        </div>
      </div>
    </footer>
  )
}
