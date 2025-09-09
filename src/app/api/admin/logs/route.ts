import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/backend/config/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const action = searchParams.get('action');
    const userId = searchParams.get('user_id');
    
    const db = await getDb();
    const offset = (page - 1) * limit;
    
    let whereClause = '';
    let params = [];
    let paramIndex = 1;
    
    // 构建查询条件
    if (action) {
      whereClause += `WHERE action = $${paramIndex}`;
      params.push(action);
      paramIndex++;
    }
    
    if (userId) {
      if (whereClause) {
        whereClause += ` AND user_id = $${paramIndex}`;
      } else {
        whereClause += `WHERE user_id = $${paramIndex}`;
      }
      params.push(userId);
      paramIndex++;
    }
    
    // 获取日志列表
    const query = `
      SELECT 
        al.*,
        u.nickname as user_nickname,
        u.email as user_email
      FROM admin_logs al
      LEFT JOIN users u ON al.user_id = u.uuid
      ${whereClause}
      ORDER BY al.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    params.push(limit, offset);
    const result = await db.query(query, params);
    
    // 获取总数
    const countQuery = `
      SELECT COUNT(*) as total
      FROM admin_logs
      ${whereClause}
    `;
    const countParams = params.slice(0, -2); // 移除 limit 和 offset
    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);
    
    // 处理详情字段（如果是JSON）
    const logs = result.rows.map(log => {
      try {
        if (log.details) {
          log.details = JSON.parse(log.details);
        }
      } catch (e) {
        // 不是JSON格式，保持原样
      }
      return log;
    });
    
    return NextResponse.json({
      code: 0,
      message: 'Success',
      data: {
        logs,
        pagination: {
          current_page: page,
          page_size: limit,
          total_items: total,
          total_pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get admin logs error:', error);
    return NextResponse.json({
      code: -1,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}