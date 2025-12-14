const express = require('express');
const router = express.Router();
const GameRecord = require('../models/GameRecord');
const User = require('../models/User');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// 获取游戏类型列表
router.get('/types', optionalAuth, async (req, res) => {
  try {
    const { query } = require('../config/database');
    
    const sql = `
      SELECT code, name, icon, description, min_players, max_players, 
             avg_duration, difficulty, sort_order
      FROM game_types 
      WHERE status = 'active'
      ORDER BY sort_order ASC, name ASC
    `;
    
    const result = await query(sql);
    
    res.json({
      success: true,
      message: '获取游戏类型成功',
      data: result.success ? result.data : []
    });
  } catch (error) {
    console.error('获取游戏类型错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      code: 'INTERNAL_ERROR'
    });
  }
});

// 获取热门游戏
router.get('/popular', optionalAuth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const popularGames = await GameRecord.getPopularGames(parseInt(limit));
    
    res.json({
      success: true,
      message: '获取热门游戏成功',
      data: popularGames
    });
  } catch (error) {
    console.error('获取热门游戏错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      code: 'INTERNAL_ERROR'
    });
  }
});

// 开始游戏
router.post('/start', authenticateToken, async (req, res) => {
  try {
    const { game_type, room_id } = req.body;
    const userId = req.userId;
    
    if (!game_type) {
      return res.status(400).json({
        success: false,
        message: '游戏类型不能为空',
        code: 'GAME_TYPE_MISSING'
      });
    }

    // 验证游戏类型是否存在
    const { query } = require('../config/database');
    const gameTypeSql = 'SELECT code, name FROM game_types WHERE code = ? AND status = "active"';
    const gameTypeResult = await query(gameTypeSql, [game_type]);
    
    if (!gameTypeResult.success || gameTypeResult.data.length === 0) {
      return res.status(400).json({
        success: false,
        message: '游戏类型不存在或已禁用',
        code: 'INVALID_GAME_TYPE'
      });
    }

    // 创建游戏记录
    const gameRecord = await GameRecord.create({
      user_id: userId,
      game_type,
      room_id,
      result: 'playing',
      details: {
        started_at: new Date().toISOString(),
        device_info: req.headers['user-agent'] || 'unknown'
      }
    });

    if (!gameRecord) {
      return res.status(500).json({
        success: false,
        message: '创建游戏记录失败',
        code: 'GAME_CREATE_FAILED'
      });
    }

    res.json({
      success: true,
      message: '游戏开始成功',
      data: {
        game_id: gameRecord.id,
        game_type: gameRecord.game_type,
        started_at: gameRecord.started_at
      }
    });

  } catch (error) {
    console.error('开始游戏错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      code: 'INTERNAL_ERROR'
    });
  }
});

// 结束游戏
router.post('/finish', authenticateToken, async (req, res) => {
  try {
    const { game_id, score, duration, result, accuracy, combo_max, details } = req.body;
    const userId = req.userId;
    
    if (!game_id) {
      return res.status(400).json({
        success: false,
        message: '游戏ID不能为空',
        code: 'GAME_ID_MISSING'
      });
    }

    // 验证游戏记录是否属于当前用户
    const existingRecord = await GameRecord.findById(game_id);
    if (!existingRecord || existingRecord.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: '无权限操作此游戏记录',
        code: 'PERMISSION_DENIED'
      });
    }

    if (existingRecord.result !== 'playing') {
      return res.status(400).json({
        success: false,
        message: '游戏已结束',
        code: 'GAME_ALREADY_FINISHED'
      });
    }

    // 计算经验值和金币奖励
    const experienceGained = calculateExperience(score, result, accuracy);
    const coinsGained = calculateCoins(score, result, accuracy);

    // 完成游戏
    const finishData = {
      score: score || 0,
      duration: duration || 0,
      result: result || 'lose',
      accuracy: accuracy || 0,
      combo_max: combo_max || 0,
      experience_gained: experienceGained,
      coins_gained: coinsGained,
      details: {
        ...existingRecord.details,
        ...details,
        finished_at: new Date().toISOString()
      }
    };

    const gameResult = await GameRecord.finishGame(game_id, finishData);

    if (!gameResult) {
      return res.status(500).json({
        success: false,
        message: '结束游戏失败',
        code: 'GAME_FINISH_FAILED'
      });
    }

    res.json({
      success: true,
      message: '游戏结束成功',
      data: {
        game_id,
        score: finishData.score,
        result: finishData.result,
        experience_gained: experienceGained,
        coins_gained: coinsGained,
        new_level: Math.floor((gameResult.experience || 0) / 1000) + 1,
        total_experience: gameResult.experience || 0,
        total_coins: gameResult.coins || 0
      }
    });

  } catch (error) {
    console.error('结束游戏错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      code: 'INTERNAL_ERROR'
    });
  }
});

// 获取用户游戏记录
router.get('/records', authenticateToken, async (req, res) => {
  try {
    const { game_type, limit = 20, offset = 0 } = req.query;
    const userId = req.userId;
    
    const records = await GameRecord.getUserRecords(
      userId, 
      game_type, 
      parseInt(limit), 
      parseInt(offset)
    );
    
    res.json({
      success: true,
      message: '获取游戏记录成功',
      data: {
        records,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          has_more: records.length === parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('获取游戏记录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      code: 'INTERNAL_ERROR'
    });
  }
});

// 获取用户游戏统计
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { game_type } = req.query;
    const userId = req.userId;
    
    let userStats;
    if (game_type) {
      // 获取特定游戏类型的统计
      const allStats = await GameRecord.getUserGameStats(userId);
      userStats = allStats.find(stat => stat.game_type === game_type);
    } else {
      // 获取所有游戏类型的统计
      userStats = await GameRecord.getUserGameStats(userId);
    }
    
    // 获取用户总体统计
    const overallStats = await User.getUserStats(userId);
    
    res.json({
      success: true,
      message: '获取游戏统计成功',
      data: {
        game_stats: userStats,
        overall_stats: overallStats
      }
    });

  } catch (error) {
    console.error('获取游戏统计错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      code: 'INTERNAL_ERROR'
    });
  }
});

// 获取排行榜
router.get('/leaderboard', optionalAuth, async (req, res) => {
  try {
    const { game_type, rank_type = 'alltime', limit = 50 } = req.query;
    
    const leaderboard = await GameRecord.getLeaderboard(
      game_type,
      rank_type,
      parseInt(limit)
    );
    
    // 如果用户已登录，获取用户在排行榜中的排名
    let userRank = null;
    if (req.userId) {
      const { query } = require('../config/database');
      let rankSql = `
        SELECT COUNT(*) + 1 as user_rank
        FROM leaderboards l
        WHERE l.game_type = ? AND l.rank_type = ? AND l.score > (
          SELECT score FROM leaderboards 
          WHERE user_id = ? AND game_type = ? AND rank_type = ?
          LIMIT 1
        )
      `;
      
      const params = [game_type || 'all', rank_type, req.userId, game_type || 'all', rank_type];
      const rankResult = await query(rankSql, params);
      
      if (rankResult.success && rankResult.data.length > 0) {
        userRank = rankResult.data[0].user_rank;
      }
    }
    
    res.json({
      success: true,
      message: '获取排行榜成功',
      data: {
        leaderboard,
        user_rank: userRank,
        filters: {
          game_type: game_type || 'all',
          rank_type,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('获取排行榜错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      code: 'INTERNAL_ERROR'
    });
  }
});

// 计算经验值
function calculateExperience(score, result, accuracy) {
  let baseExperience = 10; // 基础经验值
  
  // 根据得分加成
  if (score > 100) baseExperience += Math.floor(score / 10);
  
  // 根据结果加成
  if (result === 'win') baseExperience *= 2;
  else if (result === 'draw') baseExperience *= 1.5;
  
  // 根据准确率加成
  if (accuracy > 0.9) baseExperience *= 1.5;
  else if (accuracy > 0.7) baseExperience *= 1.2;
  
  return Math.floor(baseExperience);
}

// 计算金币
function calculateCoins(score, result, accuracy) {
  let baseCoins = 5; // 基础金币
  
  // 根据得分加成
  if (score > 50) baseCoins += Math.floor(score / 20);
  
  // 根据结果加成
  if (result === 'win') baseCoins *= 2;
  else if (result === 'draw') baseCoins *= 1.3;
  
  // 根据准确率加成
  if (accuracy > 0.8) baseCoins += Math.floor(accuracy * 10);
  
  return Math.floor(baseCoins);
}

module.exports = router;