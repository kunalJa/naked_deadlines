"use client"

import Link from "next/link"
import { UserNav } from "@/components/user-nav"
import { Bath } from "lucide-react"
import { usePathname } from "next/navigation"

export function Header() {
  const pathname = usePathname()

  return (
    <header className="border-b bg-gradient-to-r from-primary/20 to-secondary/20">
      <div className="container flex h-16 items-center px-4">
        <div className="flex-1 flex items-center gap-2">
          <Bath className="h-8 w-8 text-primary animate-bounce" />
          <Link
            href="/"
            className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary"
          >
            NakedDeadlines
          </Link>
        </div>

        <nav className="hidden md:flex items-center justify-center gap-6 flex-1">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-primary bounce-hover ${
              pathname === "/" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Home
          </Link>
          <Link
            href="/how-it-works"
            className={`text-sm font-medium transition-colors hover:text-primary bounce-hover ${
              pathname === "/how-it-works" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            How It Works
          </Link>
        </nav>

        <div className="flex-1 flex items-center justify-end">
          <UserNav />
        </div>
      </div>
    </header>
  )
}
