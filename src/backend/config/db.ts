import { Pool, Client } from "pg";

// 链接池，所有的连接都维护在这个连接池里面
let globalPool: Pool;

export function getDb() {
  if (!globalPool) {
    const connectionString = process.env.POSTGRES_URL;

    globalPool = new Pool({
      connectionString,
      ssl: { 
        rejectUnauthorized: false
      },
      max: 3, // 进一步减少连接数
      idleTimeoutMillis: 5000, // 更短的空闲时间
      connectionTimeoutMillis: 10000, // 更长的连接超时
      // 添加连接保持选项
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    });

    // 监听连接错误
    globalPool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      // 重新创建连接池
      globalPool = null;
    });

    // 测试连接
    globalPool.query('SELECT NOW()', (err) => {
      if (err) {
        console.error('Database connection test failed:', err);
        globalPool = null;
      } else {
        console.log('Database connection test successful');
      }
    });
  }

  return globalPool;
}

// 创建一个简单的查询函数，自动处理连接
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  let client;
  try {
    // 尝试从连接池获取连接
    const pool = getDb();
    client = await pool.connect();
    const result = await client.query(text, params);
    const duration = Date.now() - start;
    console.log('executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}