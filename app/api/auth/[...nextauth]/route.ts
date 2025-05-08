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
  },
  callbacks: {
    async jwt({ token, account, profile }: { token: Token; account: any; profile?: any }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        
        // Log the full profile and account objects to see all available data
        // console.log("Twitter OAuth Profile:", JSON.stringify(profile, null, 2));
        // console.log("Twitter OAuth Account:", JSON.stringify(account, null, 2));
        
        // Try to extract Twitter handle from various possible locations
        if (profile?.screen_name) {
          token.twitterHandle = profile.screen_name;
        } else if (profile?.data?.username) {
          token.twitterHandle = profile.data.username;
        } else if (token.name && token.name.startsWith('@')) {
          token.twitterHandle = token.name.substring(1);
        } else if (token.name) {
          // If we can't find it elsewhere, use the name as a fallback
          token.twitterHandle = token.name;
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
      
      // console.log("Session being sent to client:", JSON.stringify(session, null, 2));
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
