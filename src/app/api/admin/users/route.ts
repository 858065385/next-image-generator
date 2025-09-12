export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { searchUsers, getAllUsers } from '@/backend/services/user';

export async function GET(request: NextRequest) {
  try {
    // 检查管理员权限
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({
        code: 401,
        error: 'Unauthorized'
      }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    let users;
    let total = 0;
    
    if (search) {
      // 搜索用户
      const result = await searchUsers(search, page, limit);
      users = result.users;
      total = result.total;
    } else {
      // 获取所有用户
      users = await getAllUsers(page, limit);
      total = users.length; // 这里应该从数据库获取总数
    }
    
    return NextResponse.json({
      code: 0,
      message: 'Success',
      data: {
        users,
        pagination: {
          current_page: page,
          page_size: limit,
          total_items: total,
          total_pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({
      code: -1,
      error: error.message
    }, { status: 500 });
  }
}