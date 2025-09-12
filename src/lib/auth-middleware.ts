import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getUserByEmail } from '@/backend/services/user';

export interface AuthContext {
  session: any;
  user?: any;
}

/**
 * 检查用户是否已登录
 */
export async function requireAuth(request: NextRequest): Promise<AuthContext | NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { code: 401, error: 'Unauthorized', message: '请先登录' },
        { status: 401 }
      );
    }
    
    return { session };
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      { code: 500, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * 检查用户是否具有指定角色
 */
export async function requireRole(request: NextRequest, role: string): Promise<AuthContext | NextResponse> {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult; // 返回错误响应
  }
  
  try {
    const user = await getUserByEmail(authResult.session.user.email);
    
    if (!user || user.role !== role) {
      return NextResponse.json(
        { code: 403, error: 'Forbidden', message: '权限不足' },
        { status: 403 }
      );
    }
    
    return { ...authResult, user };
  } catch (error) {
    console.error('Role check error:', error);
    return NextResponse.json(
      { code: 500, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * 检查是否是管理员
 */
export async function requireAdmin(request: NextRequest): Promise<AuthContext | NextResponse> {
  return await requireRole(request, 'admin');
}

/**
 * 检查用户是否只能访问自己的数据
 */
export async function requireSelf(request: NextRequest, userUuid: string): Promise<AuthContext | NextResponse> {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  try {
    const user = await getUserByEmail(authResult.session.user.email);
    
    // 管理员可以访问所有用户数据
    if (user.role === 'admin') {
      return { ...authResult, user };
    }
    
    // 普通用户只能访问自己的数据
    if (user.uuid !== userUuid) {
      return NextResponse.json(
        { code: 403, error: 'Forbidden', message: '只能访问自己的数据' },
        { status: 403 }
      );
    }
    
    return { ...authResult, user };
  } catch (error) {
    console.error('Self access check error:', error);
    return NextResponse.json(
      { code: 500, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * 开发环境检查（仅在开发环境可用）
 */
export async function requireDev(request: NextRequest): Promise<AuthContext | NextResponse> {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { code: 404, error: 'Not Found', message: '接口不存在' },
      { status: 404 }
    );
  }
  
  return await requireAuth(request);
}

/**
 * 创建包装器函数，简化 API 路由的使用
 */
export function withAuth(handler: (request: NextRequest, context: AuthContext) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const authResult = await requireAuth(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    return handler(request, authResult);
  };
}

export function withRole(role: string) {
  return function (handler: (request: NextRequest, context: AuthContext) => Promise<NextResponse>) {
    return async (request: NextRequest) => {
      const authResult = await requireRole(request, role);
      
      if (authResult instanceof NextResponse) {
        return authResult;
      }
      
      return handler(request, authResult);
    };
  };
}

export function withAdmin(handler: (request: NextRequest, context: AuthContext) => Promise<NextResponse>) {
  return withRole('admin')(handler);
}

export function withSelf(userUuidParam: string = 'uuid') {
  return function (handler: (request: NextRequest, context: AuthContext) => Promise<NextResponse>) {
    return async (request: NextRequest, context: { params: Record<string, string> }) => {
      const userUuid = context.params[userUuidParam];
      const authResult = await requireSelf(request, userUuid);
      
      if (authResult instanceof NextResponse) {
        return authResult;
      }
      
      return handler(request, { ...authResult, ...context });
    };
  };
}

export function withDev(handler: (request: NextRequest, context: AuthContext) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const authResult = await requireDev(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    return handler(request, authResult);
  };
}