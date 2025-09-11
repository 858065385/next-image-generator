import { getServerSession } from "next-auth";
import { authOptions } from "@/shared/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (session) {
      return Response.json({
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
        user: null
      });
    }
  } catch (error) {
    console.error("Session error:", error);
    return Response.json({
      user: null
    }, { status: 500 });
  }
}