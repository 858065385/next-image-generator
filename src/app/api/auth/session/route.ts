import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserByEmail } from "@/backend/services/user";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (session) {
      // 通过邮箱从数据库获取用户信息
      const dbUser = await getUserByEmail(session.user.email);
      
      if (dbUser) {
        return Response.json({
          user: {
            id: dbUser.id,
            uuid: dbUser.uuid,
            email: dbUser.email,
            nickname: dbUser.nickname,
            avatar_url: dbUser.avatar_url,
            created_at: dbUser.created_at,
          }
        });
      } else {
        // 如果数据库中没有找到用户，返回 session 中的基本信息
        return Response.json({
          user: {
            id: session.user.id,
            uuid: session.user.id,
            email: session.user.email,
            nickname: session.user.name || session.user.email?.split('@')[0],
            avatar_url: session.user.image,
          }
        });
      }
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