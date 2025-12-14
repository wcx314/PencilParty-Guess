// 应用配置管理
class ConfigManager {
  constructor() {
    this.config = this.loadConfig()
    this.watchers = new Map()
    this.environment = this.detectEnvironment()
  }

  // 检测当前环境
  detectEnvironment() {
    // #ifdef H5
    if (process.env.NODE_ENV) {
      return process.env.NODE_ENV
    }
    // 检测域名
    const hostname = window.location.hostname
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'development'
    } else if (hostname.includes('test') || hostname.includes('staging')) {
      return 'test'
    } else if (hostname.includes('demo')) {
      return 'demo'
    }
    return 'production'
    // #endif
    
    // #ifdef MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO || MP-QQ
    // 小程序环境通过编译时常量判断
    // #ifdef MP-WEIXIN
    const accountInfo = wx.getAccountInfoSync()
    if (accountInfo.miniProgram.envVersion === 'develop') {
      return 'development'
    } else if (accountInfo.miniProgram.envVersion === 'trial') {
      return 'test'
    }
    return 'production'
    // #endif
    
    // #ifdef APP-PLUS
    // App环境通过打包配置判断
    return 'production'
    // #endif
    
    return 'development'
  }

  // 加载配置
  loadConfig() {
    const defaultConfig = {
      // 应用基础配置
      app: {
        name: 'PencilParty',
        version: '1.0.0',
        description: '有趣的派对游戏集合',
        author: 'PencilParty Team'
      },
      
      // API配置
      api: {
        baseURL: this.getApiBaseURL(),
        timeout: 10000,
        retryTimes: 3,
        retryDelay: 1000
      },
      
      // 数据库配置（前端配置，实际连接在后端）
      database: {
        enableLocalCache: true,
        cacheTimeout: 300000, // 5分钟
        maxCacheSize: 100
      },
      
      // 功能开关
      features: {
        enableAnalytics: true,
        enablePush: true,
        enableShare: true,
        enablePayment: true,
        enableBiometrics: true,
        enableDarkMode: false,
        enableOfflineMode: true
      },
      
      // 用户界面配置
      ui: {
        theme: 'light',
        primaryColor: '#667eea',
        secondaryColor: '#764ba2',
        accentColor: '#ffd89b',
        backgroundColor: '#f5f5f5',
        textColor: '#333333',
        fontSize: 'normal',
        language: 'zh-CN'
      },
      
      // 游戏配置
      game: {
        maxSessionTime: 3600000, // 1小时
        autoSave: true,
        saveInterval: 30000, // 30秒
        enableSound: true,
        enableVibration: true,
        enableParticles: true
      },
      
      // 性能配置
      performance: {
        enableLazyLoad: true,
        enablePreload: true,
        maxConcurrentRequests: 5,
        imageQuality: 'high',
        animationQuality: 'high'
      },
      
      // 安全配置
      security: {
        enableEncryption: true,
        enableSignature: true,
        tokenRefreshThreshold: 0.8, // 80%时间时刷新
        maxLoginAttempts: 5,
        lockoutDuration: 900000 // 15分钟
      },
      
      // 缓存配置
      cache: {
        enableMemoryCache: true,
        enableDiskCache: true,
        maxMemorySize: 50 * 1024 * 1024, // 50MB
        maxDiskSize: 200 * 1024 * 1024, // 200MB
        defaultTTL: 3600000 // 1小时
      },
      
      // 日志配置
      logging: {
        enableConsole: true,
        enableRemote: true,
        level: this.getLogLevel(),
        maxLogSize: 1000,
        uploadInterval: 300000 // 5分钟
      }
    }

    // 根据环境覆盖配置
    const envConfig = this.getEnvironmentConfig()
    return this.mergeConfig(defaultConfig, envConfig)
  }

  // 获取API基础URL
  getApiBaseURL() {
    const environment = this.environment
    
    const urls = {
      development: 'http://localhost:3000/api',
      test: 'https://test-api.pencilparty.com/api',
      demo: 'https://demo-api.pencilparty.com/api',
      production: 'https://api.pencilparty.com/api'
    }
    
    return urls[environment] || urls.development
  }

  // 获取环境特定配置
  getEnvironmentConfig() {
    const environment = this.environment
    
    const configs = {
      development: {
        api: {
          timeout: 5000,
          retryTimes: 5
        },
        logging: {
          level: 'debug',
          enableRemote: false
        },
        features: {
          enableAnalytics: false
        }
      },
      
      test: {
        api: {
          baseURL: 'https://test-api.pencilparty.com/api',
          timeout: 8000,
          retryTimes: 2
        },
        logging: {
          level: 'info'
        }
      },
      
      demo: {
        api: {
          baseURL: 'https://demo-api.pencilparty.com/api',
          timeout: 10000,
          retryTimes: 2
        },
        features: {
          enablePayment: false
        }
      },
      
      production: {
        api: {
          baseURL: 'https://api.pencilparty.com/api',
          timeout: 15000,
          retryTimes: 2
        },
        logging: {
          level: 'warn'
        },
        performance: {
          imageQuality: 'medium',
          animationQuality: 'medium'
        }
      }
    }
    
    return configs[environment] || {}
  }

  // 获取日志级别
  getLogLevel() {
    const environment = this.environment
    
    const levels = {
      development: 'debug',
      test: 'info',
      demo: 'info',
      production: 'warn'
    }
    
    return levels[environment] || 'info'
  }

  // 深度合并配置
  mergeConfig(target, source) {
    const result = { ...target }
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
          result[key] = this.mergeConfig(target[key] || {}, source[key])
        } else {
          result[key] = source[key]
        }
      }
    }
    
    return result
  }

  // 获取配置值
  get(path, defaultValue = null) {
    const keys = path.split('.')
    let current = this.config
    
    for (const key of keys) {
      if (current && typeof current === 'object' && current.hasOwnProperty(key)) {
        current = current[key]
      } else {
        return defaultValue
      }
    }
    
    return current
  }

  // 设置配置值
  set(path, value) {
    const keys = path.split('.')
    const lastKey = keys.pop()
    let current = this.config
    
    for (const key of keys) {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {}
      }
      current = current[key]
    }
    
    const oldValue = current[lastKey]
    current[lastKey] = value
    
    // 通知监听器
    this.notifyWatchers(path, value, oldValue)
    
    // 保存到本地存储
    this.saveConfig()
    
    return true
  }

  // 监听配置变化
  watch(path, callback) {
    if (!this.watchers.has(path)) {
      this.watchers.set(path, new Set())
    }
    
    this.watchers.get(path).add(callback)
    
    // 返回取消监听的函数
    return () => {
      const callbacks = this.watchers.get(path)
      if (callbacks) {
        callbacks.delete(callback)
        if (callbacks.size === 0) {
          this.watchers.delete(path)
        }
      }
    }
  }

  // 通知监听器
  notifyWatchers(path, newValue, oldValue) {
    const callbacks = this.watchers.get(path)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(newValue, oldValue, path)
        } catch (error) {
          console.error('配置监听器执行失败:', error)
        }
      })
    }
  }

  // 保存配置到本地存储
  saveConfig() {
    try {
      // 只保存用户可修改的配置
      const userConfig = {
        ui: this.config.ui,
        game: this.config.game,
        features: this.config.features
      }
      
      uni.setStorageSync('app-config', JSON.stringify(userConfig))
    } catch (error) {
      console.error('保存配置失败:', error)
    }
  }

  // 重置配置
  reset() {
    this.config = this.loadConfig()
    this.saveConfig()
    
    // 通知所有监听器
    this.notifyWatchers('*', this.config, this.config)
  }

  // 导出配置
  export() {
    const exportData = {
      version: this.config.app.version,
      exportTime: new Date().toISOString(),
      environment: this.environment,
      config: this.config
    }
    
    // #ifdef H5
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `pencilparty-config-${Date.now()}.json`
    a.click()
    
    URL.revokeObjectURL(url)
    // #endif
    
    // #ifdef APP-PLUS || MP-WEIXIN || MP-ALIPAY
    uni.setStorageSync('config-export', exportData)
    uni.showToast({
      title: '配置已导出到本地',
      icon: 'success'
    })
    // #endif
  }

  // 导入配置
  import(configData) {
    try {
      let config
      
      if (typeof configData === 'string') {
        config = JSON.parse(configData)
      } else {
        config = configData
      }
      
      // 验证配置格式
      if (!config.config || typeof config.config !== 'object') {
        throw new Error('配置格式错误')
      }
      
      // 合并用户配置
      const userConfig = {
        ui: config.config.ui,
        game: config.config.game,
        features: config.config.features
      }
      
      this.config = this.mergeConfig(this.config, userConfig)
      this.saveConfig()
      
      uni.showToast({
        title: '配置导入成功',
        icon: 'success'
      })
      
      return true
    } catch (error) {
      console.error('导入配置失败:', error)
      uni.showToast({
        title: '配置格式错误',
        icon: 'none'
      })
      return false
    }
  }

  // 获取环境信息
  getEnvironmentInfo() {
    return {
      name: this.environment,
      isDevelopment: this.environment === 'development',
      isTest: this.environment === 'test',
      isProduction: this.environment === 'production',
      platform: this.getPlatform(),
      version: this.config.app.version,
      buildTime: process.env.BUILD_TIME || new Date().toISOString()
    }
  }

  // 获取平台信息
  getPlatform() {
    // #ifdef H5
    return 'h5'
    // #endif
    
    // #ifdef APP-PLUS
    return 'app-plus'
    // #endif
    
    // #ifdef MP-WEIXIN
    return 'mp-weixin'
    // #endif
    
    // #ifdef MP-ALIPAY
    return 'mp-alipay'
    // #endif
    
    return 'unknown'
  }
}

// 创建单例实例
const configManager = new ConfigManager()

// 导出便捷方法
export const getConfig = (path, defaultValue) => configManager.get(path, defaultValue)
export const setConfig = (path, value) => configManager.set(path, value)
export const watchConfig = (path, callback) => configManager.watch(path, callback)
export const resetConfig = () => configManager.reset()
export const exportConfig = () => configManager.export()
export const importConfig = (config) => configManager.import(config)
export const getEnvironmentInfo = () => configManager.getEnvironmentInfo()

// 导出管理器实例
export default configManager