"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { UserNav } from "@/components/user-nav"
import { Bath, Menu, X } from "lucide-react"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useLoading } from "@/components/page-loading"

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { startLoading } = useLoading()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }
  
  // Custom navigation handler that shows loading indicator immediately
  const handleNavigation = (path: string) => {
    if (path === pathname) return;
    startLoading();
    router.push(path);
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }

  return (
    <header className="border-b bg-gradient-to-r from-primary/20 to-secondary/20">
      <div className="container grid grid-cols-2 md:grid-cols-3 w-full items-center h-16 px-6 mx-auto">
        {/* Logo - Left */}
        <div className="justify-self-start flex flex-1 items-center gap-2">
          <Bath className="h-8 w-8 text-primary animate-bounce" />
          <Link
            href="/"
            className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary"
          >
            NakedDeadlines
          </Link>
        </div>

        {/* Desktop Navigation - Center */}
        <div className="justify-self-center hidden md:flex justify-center gap-6 flex-1">
          <div className="flex space-x-6">
            <button
              onClick={() => handleNavigation('/')}
              className={`text-sm font-medium transition-colors hover:text-primary hover:bg-primary/10 border-none bg-transparent cursor-pointer px-4 py-2 rounded-md ${
                pathname === "/" ? "text-primary bg-primary/5" : "text-muted-foreground"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavigation('/how-it-works')}
              className={`text-sm font-medium transition-colors hover:text-primary hover:bg-primary/10 border-none bg-transparent cursor-pointer px-4 py-2 rounded-md ${
                pathname === "/how-it-works" ? "text-primary bg-primary/5" : "text-muted-foreground"
              }`}
            >
              How It Works
            </button>
          </div>
        </div>

        {/* User Nav - Right */}
        <div className="justify-self-end flex flex-1 items-center justify-end">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileMenu}
            className="md:hidden"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
          <UserNav />
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <nav className="flex flex-col py-4 px-6 gap-2">
            <button
              onClick={() => handleNavigation('/')}
              className={`text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary border-none bg-transparent cursor-pointer w-full py-3 px-4 rounded-md text-center ${
                pathname === "/" ? "text-primary bg-primary/5" : "text-muted-foreground"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavigation('/how-it-works')}
              className={`text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary border-none bg-transparent cursor-pointer w-full py-3 px-4 rounded-md text-center ${
                pathname === "/how-it-works" ? "text-primary bg-primary/5" : "text-muted-foreground"
              }`}
            >
              How It Works
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}
