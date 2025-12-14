import { request, get, post } from '@/utils/request'
import { apiEndpoints } from '@/config/api'

class GameService {
  // 获取游戏类型列表
  async getGameTypes() {
    try {
      const response = await get(apiEndpoints.games.types)
      
      if (response.success) {
        return {
          success: true,
          gameTypes: response.data
        }
      } else {
        return {
          success: false,
          message: response.message,
          code: response.code
        }
      }
    } catch (error) {
      console.error('获取游戏类型失败:', error)
      return {
        success: false,
        message: error.message || '获取游戏类型失败',
        code: error.code || 'GET_GAME_TYPES_FAILED'
      }
    }
  }

  // 获取热门游戏
  async getPopularGames(limit = 10) {
    try {
      const response = await get(apiEndpoints.games.popular, { limit })
      
      if (response.success) {
        return {
          success: true,
          popularGames: response.data
        }
      } else {
        return {
          success: false,
          message: response.message,
          code: response.code
        }
      }
    } catch (error) {
      console.error('获取热门游戏失败:', error)
      return {
        success: false,
        message: error.message || '获取热门游戏失败',
        code: error.code || 'GET_POPULAR_GAMES_FAILED'
      }
    }
  }

  // 开始游戏
  async startGame(gameType, roomId = null) {
    try {
      const response = await post(apiEndpoints.games.start, {
        game_type: gameType,
        room_id: roomId
      })
      
      if (response.success) {
        return {
          success: true,
          gameId: response.data.game_id,
          gameType: response.data.game_type,
          startedAt: response.data.started_at
        }
      } else {
        return {
          success: false,
          message: response.message,
          code: response.code
        }
      }
    } catch (error) {
      console.error('开始游戏失败:', error)
      return {
        success: false,
        message: error.message || '开始游戏失败',
        code: error.code || 'START_GAME_FAILED'
      }
    }
  }

  // 结束游戏
  async finishGame(gameId, gameData) {
    try {
      const response = await post(apiEndpoints.games.finish, {
        game_id: gameId,
        score: gameData.score,
        duration: gameData.duration,
        result: gameData.result,
        accuracy: gameData.accuracy,
        combo_max: gameData.comboMax,
        details: gameData.details
      })
      
      if (response.success) {
        return {
          success: true,
          gameId: response.data.game_id,
          score: response.data.score,
          result: response.data.result,
          experienceGained: response.data.experience_gained,
          coinsGained: response.data.coins_gained,
          newLevel: response.data.new_level,
          totalExperience: response.data.total_experience,
          totalCoins: response.data.total_coins
        }
      } else {
        return {
          success: false,
          message: response.message,
          code: response.code
        }
      }
    } catch (error) {
      console.error('结束游戏失败:', error)
      return {
        success: false,
        message: error.message || '结束游戏失败',
        code: error.code || 'FINISH_GAME_FAILED'
      }
    }
  }

  // 获取用户游戏记录
  async getUserGameRecords(gameType = null, limit = 20, offset = 0) {
    try {
      const params = { limit, offset }
      if (gameType) {
        params.game_type = gameType
      }
      
      const response = await get(apiEndpoints.games.records, params)
      
      if (response.success) {
        return {
          success: true,
          records: response.data.records,
          pagination: response.data.pagination
        }
      } else {
        return {
          success: false,
          message: response.message,
          code: response.code
        }
      }
    } catch (error) {
      console.error('获取游戏记录失败:', error)
      return {
        success: false,
        message: error.message || '获取游戏记录失败',
        code: error.code || 'GET_GAME_RECORDS_FAILED'
      }
    }
  }

  // 获取用户游戏统计
  async getUserGameStats(gameType = null) {
    try {
      const params = {}
      if (gameType) {
        params.game_type = gameType
      }
      
      const response = await get(apiEndpoints.games.stats, params)
      
      if (response.success) {
        return {
          success: true,
          gameStats: response.data.game_stats,
          overallStats: response.data.overall_stats
        }
      } else {
        return {
          success: false,
          message: response.message,
          code: response.code
        }
      }
    } catch (error) {
      console.error('获取游戏统计失败:', error)
      return {
        success: false,
        message: error.message || '获取游戏统计失败',
        code: error.code || 'GET_GAME_STATS_FAILED'
      }
    }
  }

  // 获取排行榜
  async getLeaderboard(gameType = null, rankType = 'alltime', limit = 50) {
    try {
      const params = { rank_type: rankType, limit }
      if (gameType) {
        params.game_type = gameType
      }
      
      const response = await get(apiEndpoints.games.leaderboard, params)
      
      if (response.success) {
        return {
          success: true,
          leaderboard: response.data.leaderboard,
          userRank: response.data.user_rank,
          filters: response.data.filters
        }
      } else {
        return {
          success: false,
          message: response.message,
          code: response.code
        }
      }
    } catch (error) {
      console.error('获取排行榜失败:', error)
      return {
        success: false,
        message: error.message || '获取排行榜失败',
        code: error.code || 'GET_LEADERBOARD_FAILED'
      }
    }
  }

  // 格式化游戏时间
  formatGameTime(seconds) {
    if (!seconds || seconds < 0) return '0秒'
    
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    
    if (hours > 0) {
      return `${hours}小时${minutes}分${remainingSeconds}秒`
    } else if (minutes > 0) {
      return `${minutes}分${remainingSeconds}秒`
    } else {
      return `${remainingSeconds}秒`
    }
  }

  // 格式化游戏结果
  formatGameResult(result) {
    const resultMap = {
      'win': '胜利',
      'lose': '失败',
      'draw': '平局',
      'playing': '进行中'
    }
    return resultMap[result] || '未知'
  }

  // 格式化游戏难度
  formatDifficulty(difficulty) {
    const difficultyMap = {
      'easy': '简单',
      'medium': '中等',
      'hard': '困难'
    }
    return difficultyMap[difficulty] || '未知'
  }

  // 计算等级进度
  calculateLevelProgress(experience) {
    const level = Math.floor(experience / 1000) + 1
    const currentLevelExp = (level - 1) * 1000
    const nextLevelExp = level * 1000
    const progress = ((experience - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100
    
    return {
      level,
      currentLevelExp,
      nextLevelExp,
      progress: Math.min(100, Math.max(0, progress))
    }
  }

  // 获取游戏图标
  getGameIcon(gameType) {
    const iconMap = {
      'draw-guess': '🎨',
      'sokoban': '📦',
      'snake': '🐍',
      'puzzle': '🧩',
      'action': '⚡',
      'strategy': '🎯',
      'casual': '🌸',
      'classic': '🎮'
    }
    return iconMap[gameType] || '🎮'
  }

  // 获取游戏名称
  getGameName(gameType) {
    const nameMap = {
      'draw-guess': '你画我猜',
      'sokoban': '推箱子',
      'snake': '贪吃蛇',
      'puzzle': '益智拼图',
      'action': '动作游戏',
      'strategy': '策略游戏',
      'casual': '休闲游戏',
      'classic': '经典游戏'
    }
    return nameMap[gameType] || '未知游戏'
  }

  // 获取技能等级名称
  getSkillLevelName(level) {
    const levelMap = {
      'beginner': '新手',
      'intermediate': '进阶',
      'advanced': '高手',
      'master': '大师'
    }
    return levelMap[level] || '新手'
  }

  // 生成分享数据
  generateShareData(gameRecord) {
    const gameName = this.getGameName(gameRecord.game_type)
    const result = this.formatGameResult(gameRecord.result)
    const score = gameRecord.score || 0
    
    return {
      title: `我在${gameName}中获得了${score}分！`,
      desc: `游戏结果：${result}，快来挑战我吧！`,
      path: `/pages/game/share?gameId=${gameRecord.id}`,
      imageUrl: '/static/share-game.png'
    }
  }
}

// 创建单例实例
const gameService = new GameService()

// 导出服务
export default gameService

// 导出便捷方法
export const {
  getGameTypes,
  getPopularGames,
  startGame,
  finishGame,
  getUserGameRecords,
  getUserGameStats,
  getLeaderboard,
  formatGameTime,
  formatGameResult,
  formatDifficulty,
  calculateLevelProgress,
  getGameIcon,
  getGameName,
  getSkillLevelName,
  generateShareData
} = gameService