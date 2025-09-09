import { getDb } from "../config/db";
import { MemoryStorage } from "../lib/memoryStorage";

// 检查是否使用内存存储
const USE_MEMORY_STORAGE = process.env.USE_MEMORY_STORAGE === 'true' || 
                          process.env.NODE_ENV === 'development';

export class DatabaseManager {
  static isUsingMemory() {
    return USE_MEMORY_STORAGE;
  }

  static async saveUser(user) {
    if (USE_MEMORY_STORAGE) {
      MemoryStorage.saveUser(user);
      return user;
    }
    
    const db = getDb();
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
    return res.rows[0];
  }

  static async getByEmail(email: string) {
    if (USE_MEMORY_STORAGE) {
      return MemoryStorage.getUserByEmail(email);
    }

    const db = getDb();
    const res = await db.query(`SELECT * FROM users WHERE email = $1 LIMIT 1`, [
      email,
    ]);
    if (res.rowCount === 0) {
      return undefined;
    }
    return this.formatUser(res.rows[0]);
  }

  static async getByUuidAndEmail(uuid: string, email: string) {
    if (USE_MEMORY_STORAGE) {
      return MemoryStorage.getUserByUuidAndEmail(uuid, email);
    }

    const db = getDb();
    const res = await db.query(
      `SELECT * FROM users WHERE uuid = $1 AND email = $2 LIMIT 1`,
      [uuid, email]
    );
    if (res.rowCount === 0) {
      return undefined;
    }
    return this.formatUser(res.rows[0]);
  }

  static formatUser(row: any) {
    return {
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
  }

  static async createEffectResult(effectResult: any) {
    if (USE_MEMORY_STORAGE) {
      MemoryStorage.saveEffectResult(effectResult);
      return effectResult;
    }

    const db = getDb();
    const res = await db.query(
      `INSERT INTO effect_result (result_id, original_id, user_id, effect_id, effect_name, prompt, url, original_url, storage_type, running_time, credit, request_params, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
      [
        effectResult.result_id,
        effectResult.original_id,
        effectResult.user_id,
        effectResult.effect_id,
        effectResult.effect_name,
        effectResult.prompt,
        effectResult.url,
        effectResult.original_url,
        effectResult.storage_type,
        effectResult.running_time,
        effectResult.credit,
        effectResult.request_params,
        effectResult.status,
        effectResult.created_at,
      ]
    );
    return res.rows[0];
  }

  static async getEffectResultsByUserId(userId: string, limit: number = 12) {
    if (USE_MEMORY_STORAGE) {
      return MemoryStorage.getEffectResultsByUserId(userId, limit);
    }

    const db = getDb();
    const res = await db.query(
      `SELECT original_id, user_id, effect_name, url, running_time, credit, status, created_at FROM effect_result WHERE user_id = $1 ORDER BY id DESC LIMIT $2`,
      [userId, limit]
    );
    return res.rows;
  }

  static getCreditUsageByUserId(userId: string) {
    if (USE_MEMORY_STORAGE) {
      return MemoryStorage.getCreditUsageByUserId(userId);
    }
    
    // 对于数据库模式，应该异步调用，但这里保持同步接口
    // 实际使用时会通过credit_usage服务处理
    return null;
  }
}