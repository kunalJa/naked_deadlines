import NextAuth from "next-auth/next"
import TwitterProvider from "next-auth/providers/twitter"
import { JWT } from "next-auth/jwt"
import { Session } from "next-auth"

// Extend the default session user type
declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      twitterHandle?: string;
    };
  }
}

// Define types for callbacks
interface Token extends JWT {
  accessToken?: string;
  twitterHandle?: string;
}

interface SessionWithToken extends Session {
  accessToken?: string;
  twitterHandle?: string;
}

/**
 * NextAuth configuration with Twitter provider for NextAuth v4
 */
export const authOptions = {
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: "2.0", // OAuth 2.0
      authorization: {
        params: {
          scope: "tweet.read tweet.write users.read offline.access media.write",
        },
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  },
  callbacks: {
    async jwt({ token, account, profile }: { token: Token; account: any; profile?: any }) {
        // Persist the OAuth access_token to the token right after signin
        if (account && profile) {
          token.accessToken = account.access_token;
          if (profile.data?.username) {
            token.twitterHandle = profile.data.username;
          } else {
            throw new Error("OAuth profile incomplete. Please ensure the necessary permissions were granted to the application.");
          }
        }

      return token;
    },
    async session({ session, token }: { session: SessionWithToken; token: Token }) {
      // Send properties to the client, like an access_token from a provider
      session.accessToken = token.accessToken;
      
      // Pass the Twitter handle to the client session
      if (token.twitterHandle) {
        session.twitterHandle = token.twitterHandle;
        
        // Also add it to the user object if it exists
        if (session.user) {
          session.user.twitterHandle = token.twitterHandle;
        }
      }
      
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
  trustHost: true, // Important for production
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
