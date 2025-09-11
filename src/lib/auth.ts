import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  pages: {
    signIn: '/signin',
    signOut: '/signout',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user && account) {
        token.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      }
      return token;
    },
    async session({ session, token }) {
      if (token.user) {
        session.user = token.user;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account && account.provider === 'google') {
        // 检查用户是否已经存在，不存在则创建
        try {
          const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user: {
                email: user.email,
                name: user.name,
                image: user.image,
              },
              account: {
                type: 'oauth',
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            }),
          });
          
          const data = await response.json();
          if (!response.ok) {
            console.error('Failed to register user:', data);
          }
        } catch (error) {
          console.error('Error registering user during sign in:', error);
        }
      }
      return true;
    },
  },
};