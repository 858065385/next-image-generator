// 简单的内存存储，用于开发环境
const memoryStorage = {
  users: new Map(),
  creditUsage: new Map(),
  effectResults: []
};

export class MemoryStorage {
  static saveUser(user) {
    const key = user.email || user.uuid;
    memoryStorage.users.set(key, {
      ...user,
      createdAt: new Date().toISOString()
    });
    console.log('User saved to memory:', key);
  }

  static getUserByEmail(email) {
    return memoryStorage.users.get(email);
  }

  static getUserByUuidAndEmail(uuid, email) {
    // 首先尝试通过UUID查找
    for (const [key, user] of memoryStorage.users) {
      if (user.uuid === uuid) return user;
    }
    // 然后尝试通过email查找
    return memoryStorage.users.get(email);
  }

  static saveCreditUsage(creditUsage) {
    memoryStorage.creditUsage.set(creditUsage.user_id, {
      ...creditUsage,
      createdAt: new Date().toISOString()
    });
    console.log('Credit usage saved to memory:', creditUsage.user_id);
  }

  static getCreditUsageByUserId(userId) {
    return memoryStorage.creditUsage.get(userId);
  }

  static saveEffectResult(effectResult) {
    memoryStorage.effectResults.push({
      ...effectResult,
      createdAt: new Date().toISOString()
    });
    console.log('Effect result saved to memory:', effectResult.result_id);
  }

  static getEffectResultsByUserId(userId, limit = 12) {
    return memoryStorage.effectResults
      .filter(r => r.user_id === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }

  static clear() {
    memoryStorage.users.clear();
    memoryStorage.creditUsage.clear();
    memoryStorage.effectResults = [];
  }
}