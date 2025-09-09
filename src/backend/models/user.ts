import { getDb } from "../config/db";
import { User } from "../type/type";
import { QueryResultRow } from "pg";

export async function insertUser(user: User) {
  const db = await getDb();
  const res = await db.query(
    `INSERT INTO users 
          (uuid, email, created_at, nickname, avatar_url, locale, signin_type, signin_ip, signin_provider, signin_openid, update_time) 
          VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `,
    [
      user.uuid,
      user.email,
      user.created_at || "",
      user.nickname,
      user.avatar_url,
      user.locale || "",
      user.signin_type || "",
      user.signin_ip || "",
      user.signin_provider || "",
      user.signin_openid || "",
      new Date(),
    ]
  );
  return res;
}

export async function getByEmail(email: string): Promise<User | undefined> {
  let retries = 3;
  let lastError;
  
  while (retries > 0) {
    try {
      const db = getDb();
      const res = await db.query(`SELECT * FROM users WHERE email = $1 LIMIT 1`, [
        email,
      ]);
      if (res.rowCount === 0) {
        return undefined;
      }

      const { rows } = res;
      return formatUser(rows[0]);
    } catch (error) {
      lastError = error;
      console.error(`Database query failed (${retries} retries left):`, error);
      retries--;
      if (retries > 0) {
        // 等待一段时间后重试
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  throw lastError;
}

export async function getByUuidAndEmail(uuid: string, email: string) {
  let retries = 3;
  let lastError;
  
  while (retries > 0) {
    try {
      const db = getDb();
      const res = await db.query(
        `SELECT * FROM users WHERE uuid = $1 AND email = $2 LIMIT 1`,
        [uuid, email]
      );
      if (res.rowCount === 0) {
        return undefined;
      }
      return formatUser(res.rows[0]);
    } catch (error) {
      lastError = error;
      console.error(`Database query failed (${retries} retries left):`, error);
      retries--;
      if (retries > 0) {
        // 等待一段时间后重试
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  throw lastError;
}

export async function searchUsersByKeyword(keyword: string, page: number = 1, limit: number = 20) {
  const db = await getDb();
  const offset = (page - 1) * limit;
  
  // 搜索 UUID、邮箱或昵称
  const searchQuery = `
    SELECT *, 
           (SELECT COUNT(*) FROM users 
            WHERE uuid ILIKE $1 OR email ILIKE $1 OR nickname ILIKE $1) as total
    FROM users 
    WHERE uuid ILIKE $1 OR email ILIKE $1 OR nickname ILIKE $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3
  `;
  
  const searchTerm = `%${keyword}%`;
  const res = await db.query(searchQuery, [searchTerm, limit, offset]);
  
  const users = res.rows.map(row => formatUser(row));
  const total = res.rows[0]?.total || 0;
  
  return { users, total };
}

export async function getAllUsersWithPagination(page: number = 1, limit: number = 20) {
  const db = await getDb();
  const offset = (page - 1) * limit;
  
  const query = `
    SELECT * FROM users 
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
  `;
  
  const res = await db.query(query, [limit, offset]);
  
  return res.rows.map(row => formatUser(row));
}

export function formatUser(row: QueryResultRow): User {
  const user: User = {
    id: row.id,
    uuid: row.uuid,
    email: row.email,
    created_at: row.created_at,
    nickname: row.nickname,
    avatar_url: row.avatar_url,
    locale: row.locale,
    signin_type: row.signin_type,
    signin_ip: row.signin_ip,
    signin_provider: row.signin_provider,
    signin_openid: row.signin_openid,
    update_time: row.update_time,
  };

  return user;
}
