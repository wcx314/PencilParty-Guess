const { query, transaction } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class GameRecord {
  constructor() {
    this.tableName = 'game_records';
  }

  // 创建游戏记录
  async create(recordData) {
    const {
      user_id, game_type, room_id, score = 0, duration = 0,
      gameResult = 'playing', accuracy = 0, combo_max = 0,
      experience_gained = 0, coins_gained = 0, details = {}
    } = recordData;
    
    const id = uuidv4();
    
    const sql = `
      INSERT INTO ${this.tableName} 
      (id, user_id, game_type, room_id, score, duration, gameResult,
       accuracy, combo_max, experience_gained, coins_gained, details, started_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;
    
    const queryResult = await query(sql, [
      id, user_id, game_type, room_id, score, duration, gameResult,
      accuracy, combo_max, experience_gained, coins_gained, JSON.stringify(details)
    ]);
    
    if (queryResult.success) {
      return await this.findById(id);
    }
    return null;
  }

  // 根据ID查找游戏记录
  async findById(id) {
    const sql = `
      SELECT gr.*, u.nickname, u.avatar, u.level
      FROM ${this.tableName} gr
      LEFT JOIN users u ON gr.user_id = u.id
      WHERE gr.id = ?
    `;
    
    const result = await query(sql, [id]);
    return result.success && result.data.length > 0 ? this.formatRecordData(result.data[0]) : null;
  }

  // 更新游戏记录
  async update(id, updateData) {
    const fields = [];
    const values = [];
    
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== 'id') {
        if (key === 'details') {
          fields.push(`${key} = ?`);
          values.push(JSON.stringify(updateData[key]));
        } else {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      }
    });
    
    if (fields.length === 0) return false;
    
    // 如果游戏结束，设置结束时间
    if (updateData.result && updateData.result !== 'playing') {
      fields.push('finished_at = CURRENT_TIMESTAMP');
    }
    
    values.push(id);
    
    const sql = `
      UPDATE ${this.tableName} 
      SET ${fields.join(', ')} 
      WHERE id = ?
    `;
    
    const result = await query(sql, values);
    return result.success;
  }

  // 完成游戏
  async finishGame(id, finalData) {
    const { score, duration, result, accuracy, combo_max, experience_gained, coins_gained, details } = finalData;
    
    return await transaction(async (connection) => {
      // 更新游戏记录
      const updateSql = `
        UPDATE ${this.tableName} 
        SET score = ?, duration = ?, result = ?, accuracy = ?, combo_max = ?, 
            experience_gained = ?, coins_gained = ?, details = ?, 
            finished_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      await connection.execute(updateSql, [
        score, duration, result, accuracy, combo_max,
        experience_gained, coins_gained, JSON.stringify(details), id
      ]);
      
      // 获取游戏记录信息
      const recordSql = 'SELECT user_id, game_type FROM game_records WHERE id = ?';
      const [recordRows] = await connection.execute(recordSql, [id]);
      
      if (recordRows.length > 0) {
        const { user_id, game_type } = recordRows[0];
        
        // 更新用户经验和金币
        const userUpdateSql = `
          UPDATE users 
          SET experience = experience + ?, 
              coins = coins + ?,
              level = FLOOR((experience + ?) / 1000) + 1,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `;
        
        await connection.execute(userUpdateSql, [
          experience_gained, coins_gained, experience_gained, user_id
        ]);
        
        // 更新排行榜
        await this.updateLeaderboard(connection, user_id, game_type, score, duration, accuracy);
        
        return {
          user_id,
          game_type,
          score,
          experience_gained,
          coins_gained
        };
      }
      
      throw new Error('游戏记录不存在');
    });
  }

  // 更新排行榜
  async updateLeaderboard(connection, userId, gameType, score, duration, accuracy) {
    const leaderboardSql = `
      INSERT INTO leaderboards (user_id, game_type, score, duration, accuracy, rank_type, period_date)
      VALUES (?, ?, ?, ?, ?, 'alltime', CURDATE())
      ON DUPLICATE KEY UPDATE 
        score = GREATEST(score, VALUES(score)),
        duration = VALUES(duration),
        accuracy = VALUES(accuracy),
        created_at = CURRENT_TIMESTAMP
    `;
    
    await connection.execute(leaderboardSql, [userId, gameType, score, duration, accuracy]);
  }

  // 获取用户游戏记录
  async getUserRecords(userId, gameType = null, limit = 20, offset = 0) {
    let sql = `
      SELECT gr.*, gt.name as game_name, gt.icon as game_icon
      FROM ${this.tableName} gr
      LEFT JOIN game_types gt ON gr.game_type = gt.code
      WHERE gr.user_id = ?
    `;
    
    const params = [userId];
    
    if (gameType) {
      sql += ' AND gr.game_type = ?';
      params.push(gameType);
    }
    
    sql += `
      ORDER BY gr.created_at DESC
      LIMIT ? OFFSET ?
    `;
    params.push(limit, offset);
    
    const result = await query(sql, params);
    return result.success ? result.data.map(record => this.formatRecordData(record)) : [];
  }

  // 获取用户游戏统计
  async getUserGameStats(userId) {
    const sql = `
      SELECT 
        game_type,
        COUNT(*) as total_games,
        MAX(score) as best_score,
        AVG(score) as avg_score,
        SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN result = 'lose' THEN 1 ELSE 0 END) as losses,
        SUM(CASE WHEN result = 'draw' THEN 1 ELSE 0 END) as draws,
        SUM(duration) as total_duration,
        AVG(accuracy) as avg_accuracy,
        MAX(combo_max) as best_combo,
        SUM(experience_gained) as total_experience,
        SUM(coins_gained) as total_coins
      FROM ${this.tableName}
      WHERE user_id = ? AND result IN ('win', 'lose', 'draw')
      GROUP BY game_type
    `;
    
    const result = await query(sql, [userId]);
    return result.success ? result.data : [];
  }

  // 获取排行榜
  async getLeaderboard(gameType = null, rankType = 'alltime', limit = 50) {
    let sql = `
      SELECT l.*, u.nickname, u.avatar, u.level
      FROM leaderboards l
      INNER JOIN users u ON l.user_id = u.id
      WHERE u.status = 'active'
    `;
    
    const params = [];
    
    if (gameType) {
      sql += ' AND l.game_type = ?';
      params.push(gameType);
    }
    
    if (rankType !== 'alltime') {
      sql += ' AND l.rank_type = ?';
      params.push(rankType);
    }
    
    sql += `
      ORDER BY l.score DESC, l.created_at ASC
      LIMIT ?
    `;
    params.push(limit);
    
    const result = await query(sql, params);
    return result.success ? result.data : [];
  }

  // 获取游戏类型统计
  async getGameTypeStats(gameType = null, timeRange = '7d') {
    let sql = `
      SELECT 
        DATE(gr.created_at) as date,
        game_type,
        COUNT(*) as games_played,
        AVG(score) as avg_score,
        COUNT(DISTINCT gr.user_id) as unique_players
      FROM ${this.tableName} gr
      WHERE gr.created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY)
    `;
    
    const params = [];
    
    if (gameType) {
      sql += ' AND gr.game_type = ?';
      params.push(gameType);
    }
    
    sql += `
      GROUP BY DATE(gr.created_at), gr.game_type
      ORDER BY date DESC, games_played DESC
    `;
    
    const result = await query(sql, params);
    return result.success ? result.data : [];
  }

  // 获取热门游戏
  async getPopularGames(limit = 10, timeRange = '7d') {
    const sql = `
      SELECT 
        gt.code, gt.name, gt.icon,
        COUNT(gr.id) as total_games,
        COUNT(DISTINCT gr.user_id) as unique_players,
        AVG(gr.score) as avg_score,
        AVG(gr.duration) as avg_duration
      FROM game_types gt
      LEFT JOIN game_records gr ON gt.code = gr.game_type
        AND gr.created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY)
      WHERE gt.status = 'active'
      GROUP BY gt.code, gt.name, gt.icon
      ORDER BY total_games DESC, unique_players DESC
      LIMIT ?
    `;
    
    const result = await query(sql, [limit]);
    return result.success ? result.data : [];
  }

  // 格式化游戏记录数据
  formatRecordData(recordData) {
    if (!recordData) return null;
    
    return {
      id: recordData.id,
      user_id: recordData.user_id,
      game_type: recordData.game_type,
      game_name: recordData.game_name,
      game_icon: recordData.game_icon,
      room_id: recordData.room_id,
      score: recordData.score,
      duration: recordData.duration,
      result: recordData.result,
      accuracy: parseFloat(recordData.accuracy) || 0,
      combo_max: recordData.combo_max,
      experience_gained: recordData.experience_gained,
      coins_gained: recordData.coins_gained,
      details: recordData.details ? JSON.parse(recordData.details) : {},
      started_at: recordData.started_at,
      finished_at: recordData.finished_at,
      created_at: recordData.created_at,
      updated_at: recordData.updated_at,
      user_info: recordData.nickname ? {
        nickname: recordData.nickname,
        avatar: recordData.avatar,
        level: recordData.level
      } : null
    };
  }
}

module.exports = new GameRecord();