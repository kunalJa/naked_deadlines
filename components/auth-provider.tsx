"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type User = {
  id: string
  name: string
  email: string
  image?: string
  twitterHandle?: string
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Mock authentication for development
  useEffect(() => {
    // Simulate auth check
    const checkAuth = async () => {
      try {
        // In a real app, this would be a fetch to an API endpoint
        // that checks the session
        const mockUser = localStorage.getItem("mockUser")

        if (mockUser) {
          setUser(JSON.parse(mockUser))
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Auth check failed:", error)
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const signIn = async () => {
    setIsLoading(true)

    try {
      // Mock sign in - in a real app this would redirect to Twitter OAuth
      // For now, we'll just set a mock user
      const mockUser: User = {
        id: "123",
        name: "Test User",
        email: "test@example.com",
        twitterHandle: "@testuser",
      }

      localStorage.setItem("mockUser", JSON.stringify(mockUser))
      setUser(mockUser)
      router.refresh()
    } catch (error) {
      console.error("Sign in failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    setIsLoading(true)

    try {
      // Mock sign out
      localStorage.removeItem("mockUser")
      setUser(null)
      router.refresh()
    } catch (error) {
      console.error("Sign out failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
