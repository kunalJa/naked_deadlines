import NextAuth from "next-auth/next"
import TwitterProvider from "next-auth/providers/twitter"
import { JWT } from "next-auth/jwt"
import { Session } from "next-auth"

// Define types for callbacks
interface Token extends JWT {
  accessToken?: string;
}

interface SessionWithToken extends Session {
  accessToken?: string;
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
    async jwt({ token, account }: { token: Token; account: any }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
      }
      console.log("Auth Token Object:", JSON.stringify(token, null, 2));
      return token;
    },
    async session({ session, token }: { session: SessionWithToken; token: Token }) {
      // Send properties to the client, like an access_token from a provider
      session.accessToken = token.accessToken;
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
