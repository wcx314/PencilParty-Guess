// 全局错误处理和降级机制
class ErrorHandler {
  constructor() {
    this.errorLog = []
    this.maxLogSize = 100
    this.retryStrategies = new Map()
    this.fallbackHandlers = new Map()
    
    // 初始化默认策略
    this.initDefaultStrategies()
  }

  // 初始化默认策略
  initDefaultStrategies() {
    // 网络错误重试策略
    this.setRetryStrategy('network', {
      maxRetries: 3,
      retryDelay: 1000,
      backoffMultiplier: 2,
      retryCondition: (error) => {
        return error.code === 'NETWORK_ERROR' || 
               error.code === 'TIMEOUT' ||
               error.message?.includes('网络')
      }
    })

    // API错误重试策略
    this.setRetryStrategy('api', {
      maxRetries: 2,
      retryDelay: 2000,
      backoffMultiplier: 1.5,
      retryCondition: (error) => {
        return error.code === 'INTERNAL_ERROR' ||
               error.code === 'SERVER_ERROR'
      }
    })

    // 认证错误处理策略
    this.setFallbackHandler('auth', (error) => {
      if (error.code === 'TOKEN_EXPIRED' || 
          error.code === 'INVALID_TOKEN' ||
          error.code === 'USER_NOT_FOUND') {
        // 清除本地认证信息
        uni.removeStorageSync('accessToken')
        uni.removeStorageSync('refreshToken')
        uni.removeStorageSync('userInfo')
        
        // 跳转到登录页
        uni.reLaunch({
          url: '/pages/login/login'
        })
        
        return {
          handled: true,
          message: '登录已过期，请重新登录'
        }
      }
      return { handled: false }
    })

    // 数据库降级策略
    this.setFallbackHandler('database', (error) => {
      if (error.code === 'DATABASE_ERROR' || 
          error.code === 'CONNECTION_FAILED') {
        // 切换到本地存储模式
        console.warn('数据库连接失败，切换到本地存储模式')
        
        return {
          handled: true,
          fallback: 'local',
          message: '当前使用离线模式'
        }
      }
      return { handled: false }
    })
  }

  // 设置重试策略
  setRetryStrategy(name, strategy) {
    this.retryStrategies.set(name, {
      maxRetries: 3,
      retryDelay: 1000,
      backoffMultiplier: 2,
      retryCondition: () => true,
      ...strategy
    })
  }

  // 设置降级处理器
  setFallbackHandler(name, handler) {
    this.fallbackHandlers.set(name, handler)
  }

  // 执行带重试的异步操作
  async executeWithRetry(operation, strategyName = 'network') {
    const strategy = this.retryStrategies.get(strategyName)
    if (!strategy) {
      return await operation()
    }

    let lastError = null
    
    for (let attempt = 0; attempt <= strategy.maxRetries; attempt++) {
      try {
        const result = await operation()
        
        // 成功时清除之前的错误记录
        if (attempt > 0) {
          console.log(`操作在第 ${attempt + 1} 次尝试后成功`)
        }
        
        return result
      } catch (error) {
        lastError = error
        
        // 检查是否满足重试条件
        if (!strategy.retryCondition(error) || attempt === strategy.maxRetries) {
          break
        }
        
        // 计算延迟时间
        const delay = strategy.retryDelay * Math.pow(strategy.backoffMultiplier, attempt)
        
        console.warn(`操作失败，${delay}ms 后进行第 ${attempt + 2} 次重试:`, error.message)
        
        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    // 所有重试都失败，记录错误并尝试降级处理
    return this.handleError(lastError, strategyName)
  }

  // 处理错误
  async handleError(error, context = 'unknown') {
    // 记录错误
    this.logError(error, context)
    
    // 尝试使用降级处理器
    for (const [name, handler] of this.fallbackHandlers) {
      try {
        const result = await handler(error)
        if (result.handled) {
          console.log(`错误已通过 ${name} 处理器处理:`, result.message)
          
          // 显示用户友好的提示
          if (result.message) {
            uni.showToast({
              title: result.message,
              icon: 'none',
              duration: 3000
            })
          }
          
          return {
            success: false,
            fallback: result.fallback,
            message: result.message
          }
        }
      } catch (handlerError) {
        console.error(`降级处理器 ${name} 执行失败:`, handlerError)
      }
    }
    
    // 没有处理器能处理，返回原始错误
    return {
      success: false,
      error: error,
      message: this.getErrorMessage(error)
    }
  }

  // 记录错误
  logError(error, context) {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      context: context,
      message: error.message || error.toString(),
      code: error.code || 'UNKNOWN_ERROR',
      stack: error.stack,
      userAgent: this.getUserAgent(),
      platform: this.getPlatform(),
      url: this.getCurrentPage()
    }
    
    // 添加到错误日志
    this.errorLog.unshift(errorEntry)
    
    // 限制日志大小
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize)
    }
    
    // 输出到控制台
    console.error(`[${context}] ${errorEntry.code}: ${errorEntry.message}`, errorEntry)
    
    // 尝试上报错误（如果网络可用）
    this.reportError(errorEntry)
  }

  // 获取用户友好的错误消息
  getErrorMessage(error) {
    const errorMessages = {
      'NETWORK_ERROR': '网络连接失败，请检查网络设置',
      'TIMEOUT': '请求超时，请稍后重试',
      'SERVER_ERROR': '服务器暂时不可用，请稍后重试',
      'INVALID_TOKEN': '登录已过期，请重新登录',
      'TOKEN_EXPIRED': '登录已过期，请重新登录',
      'USER_NOT_FOUND': '用户不存在，请重新登录',
      'PERMISSION_DENIED': '权限不足，无法执行此操作',
      'RATE_LIMIT_EXCEEDED': '请求过于频繁，请稍后再试',
      'INVALID_GAME_TYPE': '游戏类型不存在',
      'GAME_CREATE_FAILED': '创建游戏失败，请重试',
      'DATABASE_ERROR': '数据库连接失败，使用离线模式',
      'STORAGE_FULL': '存储空间不足，请清理后重试',
      'FILE_NOT_FOUND': '文件不存在',
      'PARSE_ERROR': '数据格式错误',
      'VALIDATION_ERROR': '数据验证失败'
    }
    
    return errorMessages[error.code] || error.message || '操作失败，请重试'
  }

  // 获取用户代理信息
  getUserAgent() {
    // #ifdef H5
    return navigator.userAgent
    // #endif
    
    // #ifdef APP-PLUS
    return plus.device.model + ' ' + plus.device.version
    // #endif
    
    // #ifdef MP-WEIXIN
    return 'WeChat MiniProgram'
    // #endif
    
    return 'Unknown Platform'
  }

  // 获取平台信息
  getPlatform() {
    // #ifdef H5
    return 'H5'
    // #endif
    
    // #ifdef APP-PLUS
    return 'APP-PLUS'
    // #endif
    
    // #ifdef MP-WEIXIN
    return 'MP-WEIXIN'
    // #endif
    
    // #ifdef MP-ALIPAY
    return 'MP-ALIPAY'
    // #endif
    
    return 'UNKNOWN'
  }

  // 获取当前页面信息
  getCurrentPage() {
    try {
      const pages = getCurrentPages()
      if (pages.length > 0) {
        const currentPage = pages[pages.length - 1]
        return currentPage.route
      }
    } catch (error) {
      console.warn('获取当前页面失败:', error)
    }
    return 'unknown'
  }

  // 上报错误到服务器
  async reportError(errorEntry) {
    // 只在非开发环境上报
    // #ifdef H5
    if (process.env.NODE_ENV === 'production') {
      try {
        const { request } = require('./request')
        
        await request({
          url: '/api/errors/report',
          method: 'POST',
          data: errorEntry,
          timeout: 5000
        })
      } catch (reportError) {
        console.warn('错误上报失败:', reportError)
      }
    }
    // #endif
  }

  // 获取错误统计
  getErrorStats() {
    const stats = {
      total: this.errorLog.length,
      byCode: {},
      byContext: {},
      recent: this.errorLog.slice(0, 10)
    }
    
    this.errorLog.forEach(error => {
      // 按错误代码统计
      stats.byCode[error.code] = (stats.byCode[error.code] || 0) + 1
      
      // 按上下文统计
      stats.byContext[error.context] = (stats.byContext[error.context] || 0) + 1
    })
    
    return stats
  }

  // 清除错误日志
  clearErrorLog() {
    this.errorLog = []
    console.log('错误日志已清除')
  }

  // 导出错误日志
  exportErrorLog() {
    const logData = {
      exportTime: new Date().toISOString(),
      platform: this.getPlatform(),
      userAgent: this.getUserAgent(),
      errorCount: this.errorLog.length,
      errors: this.errorLog
    }
    
    // #ifdef H5
    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `error-log-${Date.now()}.json`
    a.click()
    
    URL.revokeObjectURL(url)
    // #endif
    
    // #ifdef APP-PLUS || MP-WEIXIN || MP-ALIPAY
    // 小程序和App环境下保存到本地存储
    uni.setStorageSync('error-log-export', logData)
    uni.showToast({
      title: '错误日志已保存到本地',
      icon: 'success'
    })
    // #endif
  }

  // 检查应用健康状态
  checkHealth() {
    const stats = this.getErrorStats()
    const recentErrors = this.errorLog.filter(error => {
      const errorTime = new Date(error.timestamp)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      return errorTime > oneHourAgo
    })
    
    const health = {
      status: 'healthy',
      score: 100,
      issues: []
    }
    
    // 检查最近错误率
    if (recentErrors.length > 10) {
      health.status = 'unhealthy'
      health.score -= 30
      health.issues.push('最近错误率过高')
    } else if (recentErrors.length > 5) {
      health.status = 'warning'
      health.score -= 15
      health.issues.push('最近错误率偏高')
    }
    
    // 检查网络错误
    const networkErrors = stats.byCode['NETWORK_ERROR'] || 0
    if (networkErrors > stats.total * 0.5) {
      health.status = health.status === 'healthy' ? 'warning' : 'unhealthy'
      health.score -= 20
      health.issues.push('网络连接不稳定')
    }
    
    // 检查认证错误
    const authErrors = stats.byCode['TOKEN_EXPIRED'] + stats.byCode['INVALID_TOKEN']
    if (authErrors > 3) {
      health.issues.push('认证问题频繁')
    }
    
    return health
  }
}

// 创建单例实例
const errorHandler = new ErrorHandler()

// 导出便捷方法
export const executeWithRetry = (operation, strategy) => errorHandler.executeWithRetry(operation, strategy)
export const handleError = (error, context) => errorHandler.handleError(error, context)
export const setRetryStrategy = (name, strategy) => errorHandler.setRetryStrategy(name, strategy)
export const setFallbackHandler = (name, handler) => errorHandler.setFallbackHandler(name, handler)
export const getErrorStats = () => errorHandler.getErrorStats()
export const clearErrorLog = () => errorHandler.clearErrorLog()
export const exportErrorLog = () => errorHandler.exportErrorLog()
export const checkHealth = () => errorHandler.checkHealth()

// 导出管理器实例
export default errorHandler

// 全局错误捕获
// #ifdef H5
window.addEventListener('error', (event) => {
  errorHandler.handleError({
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack,
    code: 'JAVASCRIPT_ERROR'
  }, 'javascript')
})

window.addEventListener('unhandledrejection', (event) => {
  errorHandler.handleError({
    message: event.reason?.message || 'Unhandled Promise Rejection',
    stack: event.reason?.stack,
    code: 'UNHANDLED_PROMISE'
  }, 'promise')
})
// #endif

// uni-app错误捕获
uni.onError((error) => {
  errorHandler.handleError({
    message: error,
    code: 'UNI_APP_ERROR'
  }, 'uni-app')
})

uni.onUnhandledRejection(({ reason }) => {
  errorHandler.handleError({
    message: reason?.message || 'Unhandled Promise Rejection',
    stack: reason?.stack,
    code: 'UNI_PROMISE_REJECTION'
  }, 'uni-promise')
})