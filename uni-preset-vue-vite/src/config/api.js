// API配置文件
const config = {
  // 开发环境配置
  development: {
    baseURL: 'http://localhost:3000/api',
    timeout: 10000,
    retryTimes: 3,
    retryDelay: 1000
  },
  
  // 生产环境配置
  production: {
    baseURL: 'https://your-api-domain.com/api',
    timeout: 15000,
    retryTimes: 2,
    retryDelay: 2000
  },
  
  // 测试环境配置
  test: {
    baseURL: 'https://test-api.your-domain.com/api',
    timeout: 12000,
    retryTimes: 3,
    retryDelay: 1500
  }
}

// 获取当前环境
function getEnv() {
  // #ifdef H5
  return process.env.NODE_ENV || 'development'
  // #endif
  
  // #ifdef MP-WEIXIN
  return 'production'
  // #endif
  
  // #ifdef MP-ALIPAY
  return 'production'
  // #endif
  
  // #ifdef APP-PLUS
  return 'production'
  // #endif
  
  return 'development'
}

// 获取当前配置
export const apiConfig = config[getEnv()]

// API端点定义
export const apiEndpoints = {
  // 认证相关
  auth: {
    login: '/auth/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    me: '/auth/me',
    profile: '/auth/profile'
  },
  
  // 游戏相关
  games: {
    types: '/games/types',
    popular: '/games/popular',
    start: '/games/start',
    finish: '/games/finish',
    records: '/games/records',
    stats: '/games/stats',
    leaderboard: '/games/leaderboard'
  }
}

// 错误代码映射
export const errorCodes = {
  // 通用错误
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  SERVER_ERROR: 'SERVER_ERROR',
  
  // 认证错误
  TOKEN_MISSING: 'TOKEN_MISSING',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_BANNED: 'USER_BANNED',
  
  // 业务错误
  INVALID_GAME_TYPE: 'INVALID_GAME_TYPE',
  GAME_CREATE_FAILED: 'GAME_CREATE_FAILED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED'
}

// HTTP状态码映射
export const httpStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500
}

// 默认请求头
export const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}