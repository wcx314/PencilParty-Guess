import { request, post, get, put } from '@/utils/request'
import { apiEndpoints } from '@/config/api'

class AuthService {
  constructor() {
    this.currentUser = null
    this.loginCallbacks = []
    this.logoutCallbacks = []
  }

  // 用户登录/注册
  async login(loginData) {
    try {
      const response = await post(apiEndpoints.auth.login, {
        openid: loginData.openid,
        nickname: loginData.nickname,
        avatar: loginData.avatar,
        platform: this.getPlatform()
      })

      if (response.success) {
        const { accessToken, refreshToken, user } = response.data
        
        // 保存tokens和用户信息
        uni.setStorageSync('accessToken', accessToken)
        uni.setStorageSync('refreshToken', refreshToken)
        uni.setStorageSync('userInfo', user)
        
        this.currentUser = user
        
        // 触发登录回调
        this.loginCallbacks.forEach(callback => callback(user))
        
        return {
          success: true,
          user
        }
      } else {
        return {
          success: false,
          message: response.message,
          code: response.code
        }
      }
    } catch (error) {
      console.error('登录失败:', error)
      return {
        success: false,
        message: error.message || '登录失败',
        code: error.code || 'LOGIN_FAILED'
      }
    }
  }

  // 获取当前用户信息
  async getCurrentUser() {
    try {
      // 如果内存中有用户信息，直接返回
      if (this.currentUser) {
        return {
          success: true,
          user: this.currentUser
        }
      }

      // 从本地存储获取
      const localUser = uni.getStorageSync('userInfo')
      if (localUser) {
        this.currentUser = localUser
        return {
          success: true,
          user: localUser
        }
      }

      // 从服务器获取最新信息
      const response = await get(apiEndpoints.auth.me)
      if (response.success) {
        const { user } = response.data
        uni.setStorageSync('userInfo', user)
        this.currentUser = user
        
        return {
          success: true,
          user
        }
      } else {
        return {
          success: false,
          message: response.message,
          code: response.code
        }
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return {
        success: false,
        message: error.message || '获取用户信息失败',
        code: error.code || 'GET_USER_FAILED'
      }
    }
  }

  // 更新用户资料
  async updateProfile(profileData) {
    try {
      const response = await put(apiEndpoints.auth.profile, profileData)
      
      if (response.success) {
        const { user } = response.data
        
        // 更新本地存储
        uni.setStorageSync('userInfo', user)
        this.currentUser = user
        
        return {
          success: true,
          user,
          message: '资料更新成功'
        }
      } else {
        return {
          success: false,
          message: response.message,
          code: response.code
        }
      }
    } catch (error) {
      console.error('更新资料失败:', error)
      return {
        success: false,
        message: error.message || '更新资料失败',
        code: error.code || 'UPDATE_PROFILE_FAILED'
      }
    }
  }

  // 用户登出
  async logout() {
    try {
      // 调用服务器登出接口（可选）
      const token = uni.getStorageSync('accessToken')
      if (token) {
        await post(apiEndpoints.auth.logout, {})
      }
    } catch (error) {
      console.error('服务器登出失败:', error)
    } finally {
      // 清除本地数据
      uni.removeStorageSync('accessToken')
      uni.removeStorageSync('refreshToken')
      uni.removeStorageSync('userInfo')
      
      const currentUser = this.currentUser
      this.currentUser = null
      
      // 触发登出回调
      this.logoutCallbacks.forEach(callback => callback(currentUser))
      
      return {
        success: true,
        message: '登出成功'
      }
    }
  }

  // 检查登录状态
  isLoggedIn() {
    const token = uni.getStorageSync('accessToken')
    return !!token && !!this.currentUser
  }

  // 获取用户ID
  getUserId() {
    if (this.currentUser) {
      return this.currentUser.id
    }
    
    const localUser = uni.getStorageSync('userInfo')
    return localUser ? localUser.id : null
  }

  // 获取用户token
  getAccessToken() {
    return uni.getStorageSync('accessToken')
  }

  // 获取刷新token
  getRefreshToken() {
    return uni.getStorageSync('refreshToken')
  }

  // 刷新用户信息
  async refreshUserInfo() {
    try {
      const response = await get(apiEndpoints.auth.me)
      if (response.success) {
        const { user } = response.data
        uni.setStorageSync('userInfo', user)
        this.currentUser = user
        return {
          success: true,
          user
        }
      }
      return {
        success: false,
        message: response.message,
        code: response.code
      }
    } catch (error) {
      console.error('刷新用户信息失败:', error)
      return {
        success: false,
        message: error.message || '刷新用户信息失败',
        code: error.code || 'REFRESH_USER_FAILED'
      }
    }
  }

  // 登录状态监听
  onLogin(callback) {
    if (typeof callback === 'function') {
      this.loginCallbacks.push(callback)
    }
  }

  // 登出状态监听
  onLogout(callback) {
    if (typeof callback === 'function') {
      this.logoutCallbacks.push(callback)
    }
  }

  // 移除登录监听
  offLogin(callback) {
    const index = this.loginCallbacks.indexOf(callback)
    if (index > -1) {
      this.loginCallbacks.splice(index, 1)
    }
  }

  // 移除登出监听
  offLogout(callback) {
    const index = this.logoutCallbacks.indexOf(callback)
    if (index > -1) {
      this.logoutCallbacks.splice(index, 1)
    }
  }

  // 获取平台信息
  getPlatform() {
    // #ifdef H5
    return 'h5'
    // #endif
    
    // #ifdef MP-WEIXIN
    return 'mp-weixin'
    // #endif
    
    // #ifdef MP-ALIPAY
    return 'mp-alipay'
    // #endif
    
    // #ifdef APP-PLUS
    return 'app-plus'
    // #endif
    
    return 'unknown'
  }

  // 初始化用户信息
  async init() {
    const token = uni.getStorageSync('accessToken')
    if (token) {
      // 有token，尝试获取用户信息
      const result = await this.getCurrentUser()
      if (!result.success) {
        // token无效，清除数据
        await this.logout()
      }
    }
  }

  // 生成测试用的openid（仅用于开发）
  generateTestOpenid() {
    if (this.getPlatform() === 'h5') {
      return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    return null
  }

  // 模拟微信登录（仅用于开发测试）
  async mockWechatLogin() {
    const testUser = {
      openid: this.generateTestOpenid(),
      nickname: `测试用户${Math.floor(Math.random() * 1000)}`,
      avatar: '/static/logo.png'
    }
    
    return await this.login(testUser)
  }
}

// 创建单例实例
const authService = new AuthService()

// 导出服务
export default authService

// 导出便捷方法
export const {
  login,
  getCurrentUser,
  updateProfile,
  logout,
  isLoggedIn,
  getUserId,
  onLogin,
  onLogout,
  init,
  mockWechatLogin
} = authService