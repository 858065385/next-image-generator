import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export interface AuthContext {
  session: any;
  user?: any;
  isAdmin?: boolean;
}

// 管理员 UUID 白名单
const ADMIN_UUIDS = [
  '10086',  // 主管理员
  // 可以添加更多管理员 UUID
  // 'admin2',
  // 'admin3',
];

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
 * 检查用户是否在管理员列表中
 */
export async function requireAdmin(request: NextRequest): Promise<AuthContext | NextResponse> {
  // 开发环境直接通过
  if (process.env.NODE_ENV === 'development') {
    return await requireAuth(request);
  }
  
  const authResult = await requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult; // 返回错误响应
  }
  
  try {
    const userUuid = authResult.session.user.uuid || authResult.session.user.id;
    
    if (!ADMIN_UUIDS.includes(userUuid)) {
      console.warn(`Unauthorized admin access attempt by UUID: ${userUuid}`);
      return NextResponse.json(
        { code: 403, error: 'Forbidden', message: '权限不足' },
        { status: 403 }
      );
    }
    
    return { ...authResult, isAdmin: true };
  } catch (error) {
    console.error('Admin check error:', error);
    return NextResponse.json(
      { code: 500, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * 检查用户是否只能访问自己的数据
 */
export async function requireSelf(request: NextRequest, userUuid: string): Promise<AuthContext | NextResponse> {
  // 开发环境直接通过
  if (process.env.NODE_ENV === 'development') {
    return await requireAuth(request);
  }
  
  const authResult = await requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  try {
    const currentUserUuid = authResult.session.user.uuid || authResult.session.user.id;
    
    // 管理员可以访问所有用户数据
    if (ADMIN_UUIDS.includes(currentUserUuid)) {
      return { ...authResult, isAdmin: true };
    }
    
    // 普通用户只能访问自己的数据
    if (currentUserUuid !== userUuid) {
      console.warn(`Unauthorized access attempt: UUID ${currentUserUuid} trying to access ${userUuid}'s data`);
      return NextResponse.json(
        { code: 403, error: 'Forbidden', message: '只能访问自己的数据' },
        { status: 403 }
      );
    }
    
    return authResult;
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

export function withAdmin(handler: (request: NextRequest, context: AuthContext) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const authResult = await requireAdmin(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    return handler(request, authResult);
  };
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