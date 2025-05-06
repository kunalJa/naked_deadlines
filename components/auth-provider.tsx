"use client"

import type React from "react"

import { createContext, useContext } from "react"
import { SessionProvider, useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "next-auth/react"
import type { Session } from "next-auth"

// Define the user type
type User = {
  id?: string;
  name: string;
  email?: string;
  image?: string;
  twitterHandle?: string;
} | null;

type AuthContextType = {
  user: User
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

function AuthProviderContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const isLoading = status === "loading"
  
  // Map the session user to our User type
  const user: User = session?.user ? {
    // In NextAuth v4, user.id might not be available by default
    // We can use a unique identifier based on available data
    id: session.user.email || "user-id",
    name: session.user.name || "User",
    email: session.user.email || undefined,
    image: session.user.image || undefined,
    twitterHandle: (session.user as any).twitterHandle,
  } : null

  const handleSignIn = async () => {
    await nextAuthSignIn("twitter")
  }

  const handleSignOut = async () => {
    await nextAuthSignOut()
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading, 
        signIn: handleSignIn, 
        signOut: handleSignOut 
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProviderContent>{children}</AuthProviderContent>
    </SessionProvider>
  )
}

export const useAuth = () => useContext(AuthContext)
