import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/backend/config/db';

export async function POST() {
  try {
    const db = await getDb();
    
    // 检查表是否已存在
    const tableExists = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'admin_logs'
      )
    `);
    
    if (tableExists.rows[0].exists) {
      return NextResponse.json({
        code: 0,
        message: 'Admin logs table already exists'
      });
    }
    
    // 创建 admin_logs 表
    await db.query(`
      CREATE TABLE admin_logs (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        action VARCHAR(100) NOT NULL,
        details TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 创建索引
    await db.query(`
      CREATE INDEX idx_admin_logs_user_id ON admin_logs(user_id)
    `);
    
    await db.query(`
      CREATE INDEX idx_admin_logs_created_at ON admin_logs(created_at)
    `);
    
    return NextResponse.json({
      code: 0,
      message: 'Admin logs table created successfully'
    });
    
  } catch (error) {
    console.error('Init admin logs error:', error);
    return NextResponse.json({
      code: -1,
      error: error.message
    }, { status: 500 });
  }
}