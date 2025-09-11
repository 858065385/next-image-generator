export const dynamic = 'force-dynamic';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (session) {
      return Response.json({
        authenticated: true,
        user: {
          id: session.user.id,
          uuid: session.user.uuid || session.user.id,
          email: session.user.email,
          nickname: session.user.name || session.user.email?.split('@')[0],
          avatar_url: session.user.image,
        }
      });
    } else {
      return Response.json({
        authenticated: false,
        user: null
      });
    }
  } catch (error) {
    console.error("Auth test error:", error);
    return Response.json({
      authenticated: false,
      user: null
    }, { status: 500 });
  }
}