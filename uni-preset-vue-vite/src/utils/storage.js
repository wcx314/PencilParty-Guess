// 本地存储工具类，支持降级机制
class StorageManager {
  constructor() {
    this.prefix = 'pencilparty_'
    this.fallbackStorage = {} // 内存存储降级方案
    this.isLocalStorageAvailable = this.checkLocalStorage()
  }

  // 检查本地存储是否可用
  checkLocalStorage() {
    try {
      const testKey = '__test__'
      uni.setStorageSync(testKey, 'test')
      const value = uni.getStorageSync(testKey)
      uni.removeStorageSync(testKey)
      return value === 'test'
    } catch (error) {
      console.warn('本地存储不可用，使用内存存储降级方案:', error)
      return false
    }
  }

  // 设置存储项
  setItem(key, value) {
    const fullKey = this.prefix + key
    const serializedValue = JSON.stringify({
      data: value,
      timestamp: Date.now()
    })

    try {
      if (this.isLocalStorageAvailable) {
        uni.setStorageSync(fullKey, serializedValue)
      } else {
        this.fallbackStorage[fullKey] = serializedValue
      }
      return true
    } catch (error) {
      console.error('存储数据失败:', error)
      return false
    }
  }

  // 获取存储项
  getItem(key, defaultValue = null) {
    const fullKey = this.prefix + key
    
    try {
      let serializedValue
      
      if (this.isLocalStorageAvailable) {
        serializedValue = uni.getStorageSync(fullKey)
      } else {
        serializedValue = this.fallbackStorage[fullKey]
      }

      if (!serializedValue) {
        return defaultValue
      }

      const parsed = JSON.parse(serializedValue)
      return parsed.data !== undefined ? parsed.data : defaultValue
    } catch (error) {
      console.error('读取存储数据失败:', error)
      return defaultValue
    }
  }

  // 移除存储项
  removeItem(key) {
    const fullKey = this.prefix + key
    
    try {
      if (this.isLocalStorageAvailable) {
        uni.removeStorageSync(fullKey)
      } else {
        delete this.fallbackStorage[fullKey]
      }
      return true
    } catch (error) {
      console.error('删除存储数据失败:', error)
      return false
    }
  }

  // 清空所有存储
  clear() {
    try {
      if (this.isLocalStorageAvailable) {
        // 只清除本应用相关的存储
        const allKeys = uni.getStorageInfoSync().keys
        allKeys.forEach(key => {
          if (key.startsWith(this.prefix)) {
            uni.removeStorageSync(key)
          }
        })
      } else {
        this.fallbackStorage = {}
      }
      return true
    } catch (error) {
      console.error('清空存储数据失败:', error)
      return false
    }
  }

  // 获取所有键
  getAllKeys() {
    try {
      if (this.isLocalStorageAvailable) {
        const allKeys = uni.getStorageInfoSync().keys
        return allKeys
          .filter(key => key.startsWith(this.prefix))
          .map(key => key.replace(this.prefix, ''))
      } else {
        return Object.keys(this.fallbackStorage)
          .filter(key => key.startsWith(this.prefix))
          .map(key => key.replace(this.prefix, ''))
      }
    } catch (error) {
      console.error('获取存储键失败:', error)
      return []
    }
  }

  // 获取存储大小
  getStorageSize() {
    try {
      if (this.isLocalStorageAvailable) {
        const info = uni.getStorageInfoSync()
        return {
          currentSize: info.currentSize || 0,
          limitSize: info.limitSize || 0,
          keysCount: info.keys.length
        }
      } else {
        const keys = Object.keys(this.fallbackStorage)
        let size = 0
        keys.forEach(key => {
          size += this.fallbackStorage[key].length
        })
        return {
          currentSize: size,
          limitSize: 0,
          keysCount: keys.length
        }
      }
    } catch (error) {
      console.error('获取存储大小失败:', error)
      return {
        currentSize: 0,
        limitSize: 0,
        keysCount: 0
      }
    }
  }

  // 检查存储项是否存在
  hasItem(key) {
    const fullKey = this.prefix + key
    
    if (this.isLocalStorageAvailable) {
      try {
        const value = uni.getStorageSync(fullKey)
        return value !== ''
      } catch (error) {
        return false
      }
    } else {
      return fullKey in this.fallbackStorage
    }
  }

  // 设置带过期时间的存储项
  setItemWithExpire(key, value, expireTime) {
    const item = {
      data: value,
      timestamp: Date.now(),
      expire: expireTime ? Date.now() + expireTime : null
    }
    
    const fullKey = this.prefix + key
    const serializedValue = JSON.stringify(item)

    try {
      if (this.isLocalStorageAvailable) {
        uni.setStorageSync(fullKey, serializedValue)
      } else {
        this.fallbackStorage[fullKey] = serializedValue
      }
      return true
    } catch (error) {
      console.error('设置带过期时间的存储项失败:', error)
      return false
    }
  }

  // 获取带过期时间的存储项
  getItemWithExpire(key, defaultValue = null) {
    const fullKey = this.prefix + key
    
    try {
      let serializedValue
      
      if (this.isLocalStorageAvailable) {
        serializedValue = uni.getStorageSync(fullKey)
      } else {
        serializedValue = this.fallbackStorage[fullKey]
      }

      if (!serializedValue) {
        return defaultValue
      }

      const parsed = JSON.parse(serializedValue)
      
      // 检查是否过期
      if (parsed.expire && Date.now() > parsed.expire) {
        this.removeItem(key)
        return defaultValue
      }

      return parsed.data !== undefined ? parsed.data : defaultValue
    } catch (error) {
      console.error('读取带过期时间的存储数据失败:', error)
      return defaultValue
    }
  }

  // 清理过期项
  cleanExpiredItems() {
    try {
      const keys = this.getAllKeys()
      let cleanedCount = 0

      keys.forEach(key => {
        const fullKey = this.prefix + key
        let serializedValue

        if (this.isLocalStorageAvailable) {
          serializedValue = uni.getStorageSync(fullKey)
        } else {
          serializedValue = this.fallbackStorage[fullKey]
        }

        if (serializedValue) {
          try {
            const parsed = JSON.parse(serializedValue)
            if (parsed.expire && Date.now() > parsed.expire) {
              this.removeItem(key)
              cleanedCount++
            }
          } catch (error) {
            // 如果解析失败，删除该项
            this.removeItem(key)
            cleanedCount++
          }
        }
      })

      console.log(`清理了 ${cleanedCount} 个过期存储项`)
      return cleanedCount
    } catch (error) {
      console.error('清理过期存储项失败:', error)
      return 0
    }
  }

  // 迁移旧数据
  migrateOldData(oldPrefix = '') {
    try {
      const allKeys = uni.getStorageInfoSync().keys
      let migratedCount = 0

      allKeys.forEach(key => {
        if (key.startsWith(oldPrefix) && !key.startsWith(this.prefix)) {
          const value = uni.getStorageSync(key)
          const newKey = key.replace(oldPrefix, '')
          
          if (this.setItem(newKey, value)) {
            uni.removeStorageSync(key)
            migratedCount++
          }
        }
      })

      console.log(`迁移了 ${migratedCount} 个旧存储项`)
      return migratedCount
    } catch (error) {
      console.error('迁移旧数据失败:', error)
      return 0
    }
  }
}

// 创建单例实例
const storageManager = new StorageManager()

// 导出便捷方法
export const setItem = (key, value) => storageManager.setItem(key, value)
export const getItem = (key, defaultValue) => storageManager.getItem(key, defaultValue)
export const removeItem = (key) => storageManager.removeItem(key)
export const clear = () => storageManager.clear()
export const getAllKeys = () => storageManager.getAllKeys()
export const getStorageSize = () => storageManager.getStorageSize()
export const hasItem = (key) => storageManager.hasItem(key)
export const setItemWithExpire = (key, value, expireTime) => storageManager.setItemWithExpire(key, value, expireTime)
export const getItemWithExpire = (key, defaultValue) => storageManager.getItemWithExpire(key, defaultValue)
export const cleanExpiredItems = () => storageManager.cleanExpiredItems()
export const migrateOldData = (oldPrefix) => storageManager.migrateOldData(oldPrefix)

// 导出管理器实例
export default storageManager

// 初始化时清理过期项
setTimeout(() => {
  cleanExpiredItems()
}, 1000)