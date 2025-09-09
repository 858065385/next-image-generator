import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      uuid?: string;
      nickname?: string;
      email?: string;
      avatar_url?: string;
      created_at?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user?: {
      id: string;
      uuid: string;
      nickname: string;
      email: string;
      avatar_url: string;
      created_at: string;
    };
  }
}