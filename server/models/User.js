const { query, transaction } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class User {
  constructor() {
    this.tableName = 'users';
  }

  // 创建用户
  async create(userData) {
    const { openid, nickname, avatar, gender, birthday, signature } = userData;
    const id = uuidv4();
    
    const sql = `
      INSERT INTO ${this.tableName} 
      (id, openid, nickname, avatar, gender, birthday, signature) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await query(sql, [id, openid, nickname, avatar, gender, birthday, signature]);
    
    if (result.success) {
      return await this.findById(id);
    }
    return null;
  }

  // 根据ID查找用户
  async findById(id) {
    const sql = `
      SELECT u.*, up.favorite_games, up.skill_level, up.privacy,
             up.notification_enabled, up.sound_enabled, up.vibration_enabled
      FROM ${this.tableName} u
      LEFT JOIN user_preferences up ON u.id = up.user_id
      WHERE u.id = ? AND u.status = 'active'
    `;
    
    const result = await query(sql, [id]);
    return result.success && result.data.length > 0 ? this.formatUserData(result.data[0]) : null;
  }

  // 根据openid查找用户
  async findByOpenid(openid) {
    const sql = `
      SELECT u.*, up.favorite_games, up.skill_level, up.privacy,
             up.notification_enabled, up.sound_enabled, up.vibration_enabled
      FROM ${this.tableName} u
      LEFT JOIN user_preferences up ON u.id = up.user_id
      WHERE u.openid = ? AND u.status = 'active'
    `;
    
    const result = await query(sql, [openid]);
    return result.success && result.data.length > 0 ? this.formatUserData(result.data[0]) : null;
  }

  // 更新用户基本信息
  async update(id, userData) {
    const fields = [];
    const values = [];
    
    Object.keys(userData).forEach(key => {
      if (userData[key] !== undefined && key !== 'id') {
        fields.push(`${key} = ?`);
        values.push(userData[key]);
      }
    });
    
    if (fields.length === 0) return false;
    
    values.push(id);
    
    const sql = `
      UPDATE ${this.tableName} 
      SET ${fields.join(', ')} 
      WHERE id = ? AND status = 'active'
    `;
    
    const result = await query(sql, values);
    return result.success;
  }

  // 更新用户偏好设置
  async updatePreferences(userId, preferences) {
    const { favorite_games, skill_level, privacy, notification_enabled, sound_enabled, vibration_enabled } = preferences;
    
    // 检查是否已存在偏好记录
    const checkSql = 'SELECT id FROM user_preferences WHERE user_id = ?';
    const checkResult = await query(checkSql, [userId]);
    
    if (checkResult.success && checkResult.data.length > 0) {
      // 更新现有记录
      const fields = [];
      const values = [];
      
      if (favorite_games !== undefined) {
        fields.push('favorite_games = ?');
        values.push(JSON.stringify(favorite_games));
      }
      if (skill_level !== undefined) {
        fields.push('skill_level = ?');
        values.push(skill_level);
      }
      if (privacy !== undefined) {
        fields.push('privacy = ?');
        values.push(privacy);
      }
      if (notification_enabled !== undefined) {
        fields.push('notification_enabled = ?');
        values.push(notification_enabled);
      }
      if (sound_enabled !== undefined) {
        fields.push('sound_enabled = ?');
        values.push(sound_enabled);
      }
      if (vibration_enabled !== undefined) {
        fields.push('vibration_enabled = ?');
        values.push(vibration_enabled);
      }
      
      if (fields.length > 0) {
        values.push(userId);
        const updateSql = `UPDATE user_preferences SET ${fields.join(', ')} WHERE user_id = ?`;
        return await query(updateSql, values);
      }
    } else {
      // 创建新记录
      const insertSql = `
        INSERT INTO user_preferences 
        (id, user_id, favorite_games, skill_level, privacy, notification_enabled, sound_enabled, vibration_enabled)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const id = uuidv4();
      return await query(insertSql, [
        id, userId, 
        JSON.stringify(favorite_games || []), 
        skill_level || 'beginner',
        privacy || 'public',
        notification_enabled !== false,
        sound_enabled !== false,
        vibration_enabled !== false
      ]);
    }
  }

  // 更新用户等级和经验
  async updateLevel(userId, experienceGained, coinsGained = 0) {
    const sql = `
      UPDATE ${this.tableName} 
      SET experience = experience + ?, 
          coins = coins + ?,
          level = FLOOR((experience + ?) / 1000) + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND status = 'active'
    `;
    
    const result = await query(sql, [experienceGained, coinsGained, experienceGained, userId]);
    return result.success;
  }

  // 更新最后登录时间
  async updateLastLogin(userId) {
    const sql = `UPDATE ${this.tableName} SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?`;
    return await query(sql, [userId]);
  }

  // 获取用户统计信息
  async getUserStats(userId) {
    const sql = 'SELECT * FROM user_stats WHERE id = ?';
    const result = await query(sql, [userId]);
    return result.success && result.data.length > 0 ? result.data[0] : null;
  }

  // 搜索用户
  async searchUsers(keyword, limit = 20, offset = 0) {
    const sql = `
      SELECT id, nickname, avatar, level, created_at
      FROM ${this.tableName} 
      WHERE nickname LIKE ? AND status = 'active'
      ORDER BY level DESC, created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const result = await query(sql, [`%${keyword}%`, limit, offset]);
    return result.success ? result.data : [];
  }

  // 获取排行榜
  async getLeaderboard(gameType = null, limit = 50) {
    let sql = `
      SELECT u.id, u.nickname, u.avatar, u.level,
             MAX(gr.score) as best_score,
             COUNT(gr.id) as games_played,
             AVG(gr.score) as avg_score
      FROM users u
      INNER JOIN game_records gr ON u.id = gr.user_id
      WHERE u.status = 'active'
    `;
    
    const params = [];
    
    if (gameType) {
      sql += ' AND gr.game_type = ?';
      params.push(gameType);
    }
    
    sql += `
      GROUP BY u.id, u.nickname, u.avatar, u.level
      ORDER BY best_score DESC, games_played DESC
      LIMIT ?
    `;
    params.push(limit);
    
    const result = await query(sql, params);
    return result.success ? result.data : [];
  }

  // 格式化用户数据
  formatUserData(userData) {
    if (!userData) return null;
    
    return {
      id: userData.id,
      openid: userData.openid,
      nickname: userData.nickname,
      avatar: userData.avatar,
      gender: userData.gender,
      birthday: userData.birthday,
      signature: userData.signature,
      level: userData.level,
      experience: userData.experience,
      coins: userData.coins,
      status: userData.status,
      last_login_at: userData.last_login_at,
      created_at: userData.created_at,
      updated_at: userData.updated_at,
      preferences: {
        favorite_games: userData.favorite_games ? JSON.parse(userData.favorite_games) : [],
        skill_level: userData.skill_level || 'beginner',
        privacy: userData.privacy || 'public',
        notification_enabled: !!userData.notification_enabled,
        sound_enabled: !!userData.sound_enabled,
        vibration_enabled: !!userData.vibration_enabled
      }
    };
  }

  // 删除用户（软删除）
  async softDelete(userId) {
    const sql = `UPDATE ${this.tableName} SET status = 'inactive' WHERE id = ?`;
    const result = await query(sql, [userId]);
    return result.success;
  }
}

module.exports = new User();