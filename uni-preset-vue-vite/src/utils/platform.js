// 跨平台兼容性处理工具
class PlatformManager {
  constructor() {
    this.platform = this.detectPlatform()
    this.systemInfo = this.getSystemInfo()
    this.capabilities = this.checkCapabilities()
  }

  // 检测当前平台
  detectPlatform() {
    // #ifdef H5
    return 'h5'
    // #endif
    
    // #ifdef MP-WEIXIN
    return 'mp-weixin'
    // #endif
    
    // #ifdef MP-ALIPAY
    return 'mp-alipay'
    // #endif
    
    // #ifdef MP-BAIDU
    return 'mp-baidu'
    // #endif
    
    // #ifdef MP-TOUTIAO
    return 'mp-toutiao'
    // #endif
    
    // #ifdef MP-QQ
    return 'mp-qq'
    // #endif
    
    // #ifdef APP-PLUS
    return 'app-plus'
    // #endif
    
    // #ifdef QUICKAPP
    return 'quickapp'
    // #endif
    
    return 'unknown'
  }

  // 获取系统信息
  getSystemInfo() {
    try {
      return uni.getSystemInfoSync()
    } catch (error) {
      console.warn('获取系统信息失败:', error)
      return {
        platform: 'unknown',
        version: '0.0.0',
        screenWidth: 375,
        screenHeight: 667
      }
    }
  }

  // 检查平台能力
  checkCapabilities() {
    const capabilities = {
      network: true,
      storage: true,
      crypto: this.checkCryptoSupport(),
      fileSystem: this.checkFileSystemSupport(),
      camera: this.checkCameraSupport(),
      geolocation: this.checkGeolocationSupport(),
      push: this.checkPushSupport(),
      share: this.checkShareSupport(),
      payment: this.checkPaymentSupport(),
      biometrics: this.checkBiometricsSupport()
    }

    return capabilities
  }

  // 检查加密支持
  checkCryptoSupport() {
    // #ifdef H5
    return typeof crypto !== 'undefined' && crypto.subtle
    // #endif
    
    // #ifdef MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO || MP-QQ
    return false
    // #endif
    
    // #ifdef APP-PLUS
    return true
    // #endif
    
    return false
  }

  // 检查文件系统支持
  checkFileSystemSupport() {
    // #ifdef APP-PLUS
    return true
    // #endif
    
    // #ifdef H5
    return typeof FileSystem !== 'undefined' || 'showDirectoryPicker' in window
    // #endif
    
    // #ifdef MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO || MP-QQ
    return false
    // #endif
    
    return false
  }

  // 检查相机支持
  checkCameraSupport() {
    // #ifdef APP-PLUS
    return true
    // #endif
    
    // #ifdef H5
    return navigator.mediaDevices && navigator.mediaDevices.getUserMedia
    // #endif
    
    // #ifdef MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO || MP-QQ
    return true
    // #endif
    
    return false
  }

  // 检查地理位置支持
  checkGeolocationSupport() {
    // #ifdef APP-PLUS
    return true
    // #endif
    
    // #ifdef H5
    return 'geolocation' in navigator
    // #endif
    
    // #ifdef MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO || MP-QQ
    return true
    // #endif
    
    return false
  }

  // 检查推送支持
  checkPushSupport() {
    // #ifdef APP-PLUS
    return true
    // #endif
    
    // #ifdef MP-WEIXIN
    return true
    // #endif
    
    // #ifdef H5
    return 'PushManager' in window || 'serviceWorker' in navigator
    // #endif
    
    return false
  }

  // 检查分享支持
  checkShareSupport() {
    // #ifdef APP-PLUS || MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO || MP-QQ
    return true
    // #endif
    
    // #ifdef H5
    return 'share' in navigator || 'canShare' in navigator
    // #endif
    
    return false
  }

  // 检查支付支持
  checkPaymentSupport() {
    // #ifdef APP-PLUS || MP-WEIXIN || MP-ALIPAY
    return true
    // #endif
    
    // #ifdef H5
    return false
    // #endif
    
    return false
  }

  // 检查生物识别支持
  checkBiometricsSupport() {
    // #ifdef APP-PLUS
    return true
    // #endif
    
    // #ifdef MP-WEIXIN
    return true
    // #endif
    
    // #ifdef H5
    return 'PublicKeyCredential' in window
    // #endif
    
    return false
  }

  // 获取平台特定配置
  getPlatformConfig() {
    const configs = {
      'h5': {
        apiBase: '/api',
        timeout: 10000,
        retryTimes: 3,
        supportCrypto: true,
        supportPush: false,
        supportShare: true
      },
      'mp-weixin': {
        apiBase: 'https://your-api.com/api',
        timeout: 15000,
        retryTimes: 2,
        supportCrypto: false,
        supportPush: true,
        supportShare: true
      },
      'mp-alipay': {
        apiBase: 'https://your-api.com/api',
        timeout: 15000,
        retryTimes: 2,
        supportCrypto: false,
        supportPush: true,
        supportShare: true
      },
      'app-plus': {
        apiBase: 'https://your-api.com/api',
        timeout: 8000,
        retryTimes: 3,
        supportCrypto: true,
        supportPush: true,
        supportShare: true
      }
    }

    return configs[this.platform] || configs['h5']
  }

  // 获取状态栏高度
  getStatusBarHeight() {
    try {
      const { statusBarHeight } = this.systemInfo
      return statusBarHeight || 0
    } catch (error) {
      return 0
    }
  }

  // 获取安全区域
  getSafeArea() {
    try {
      const { safeArea } = this.systemInfo
      return safeArea || {
        top: 0,
        left: 0,
        right: this.systemInfo.screenWidth,
        bottom: this.systemInfo.screenHeight
      }
    } catch (error) {
      return {
        top: 0,
        left: 0,
        right: 375,
        bottom: 667
      }
    }
  }

  // 平台特定的API调用
  async platformCall(apiName, params = {}) {
    switch (this.platform) {
      case 'mp-weixin':
        return this.weixinApiCall(apiName, params)
      case 'mp-alipay':
        return this.alipayApiCall(apiName, params)
      case 'app-plus':
        return this.appApiCall(apiName, params)
      case 'h5':
        return this.h5ApiCall(apiName, params)
      default:
        return this.defaultApiCall(apiName, params)
    }
  }

  // 微信小程序API调用
  async weixinApiCall(apiName, params) {
    return new Promise((resolve, reject) => {
      wx[apiName]({
        ...params,
        success: resolve,
        fail: reject
      })
    })
  }

  // 支付宝小程序API调用
  async alipayApiCall(apiName, params) {
    return new Promise((resolve, reject) => {
      my[apiName]({
        ...params,
        success: resolve,
        fail: reject
      })
    })
  }

  // App原生API调用
  async appApiCall(apiName, params) {
    return new Promise((resolve, reject) => {
      plus[apiName]({
        ...params,
        success: resolve,
        fail: reject
      })
    })
  }

  // H5环境API调用
  async h5ApiCall(apiName, params) {
    switch (apiName) {
      case 'share':
        if (navigator.share) {
          return navigator.share(params)
        } else {
          // 降级到复制链接
          return this.copyToClipboard(params.url || params.title)
        }
      case 'vibrate':
        if (navigator.vibrate) {
          return navigator.vibrate(params.duration || 200)
        } else {
          console.warn('当前设备不支持振动')
          return Promise.resolve()
        }
      default:
        return Promise.reject(new Error(`H5环境不支持API: ${apiName}`))
    }
  }

  // 默认API调用
  async defaultApiCall(apiName, params) {
    return Promise.reject(new Error(`当前平台不支持API: ${apiName}`))
  }

  // 复制到剪贴板
  async copyToClipboard(text) {
    try {
      // #ifdef H5
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text)
        return true
      } else {
        // 降级方案
        const textArea = document.createElement('textarea')
        textArea.value = text
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        return true
      }
      // #endif
      
      // #ifdef MP-WEIXIN
      await this.weixinApiCall('setClipboardData', { data: text })
      return true
      // #endif
      
      // #ifdef MP-ALIPAY
      await this.alipayApiCall('setClipboard', { text })
      return true
      // #endif
      
      return false
    } catch (error) {
      console.error('复制到剪贴板失败:', error)
      return false
    }
  }

  // 显示toast提示
  showToast(title, icon = 'none', duration = 2000) {
    uni.showToast({
      title,
      icon,
      duration
    })
  }

  // 显示loading
  showLoading(title = '加载中...') {
    uni.showLoading({
      title,
      mask: true
    })
  }

  // 隐藏loading
  hideLoading() {
    uni.hideLoading()
  }

  // 显示模态框
  showModal(title, content, showCancel = true) {
    return new Promise((resolve) => {
      uni.showModal({
        title,
        content,
        showCancel,
        success: (res) => {
          resolve(res.confirm)
        }
      })
    })
  }

  // 页面跳转
  navigateTo(url, params = {}) {
    const queryString = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&')
    
    const fullUrl = queryString ? `${url}?${queryString}` : url
    
    uni.navigateTo({
      url: fullUrl
    })
  }

  // 页面重定向
  redirectTo(url, params = {}) {
    const queryString = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&')
    
    const fullUrl = queryString ? `${url}?${queryString}` : url
    
    uni.redirectTo({
      url: fullUrl
    })
  }

  // 切换到Tab页面
  switchTab(url) {
    uni.switchTab({
      url
    })
  }

  // 返回上一页
  navigateBack(delta = 1) {
    uni.navigateBack({
      delta
    })
  }
}

// 创建单例实例
const platformManager = new PlatformManager()

// 导出便捷方法
export const getPlatform = () => platformManager.platform
export const getSystemInfo = () => platformManager.systemInfo
export const getCapabilities = () => platformManager.capabilities
export const getPlatformConfig = () => platformManager.getPlatformConfig()
export const getStatusBarHeight = () => platformManager.getStatusBarHeight()
export const getSafeArea = () => platformManager.getSafeArea()
export const platformCall = (apiName, params) => platformManager.platformCall(apiName, params)
export const copyToClipboard = (text) => platformManager.copyToClipboard(text)
export const showToast = (title, icon, duration) => platformManager.showToast(title, icon, duration)
export const showLoading = (title) => platformManager.showLoading(title)
export const hideLoading = () => platformManager.hideLoading()
export const showModal = (title, content, showCancel) => platformManager.showModal(title, content, showCancel)
export const navigateTo = (url, params) => platformManager.navigateTo(url, params)
export const redirectTo = (url, params) => platformManager.redirectTo(url, params)
export const switchTab = (url) => platformManager.switchTab(url)
export const navigateBack = (delta) => platformManager.navigateBack(delta)

// 导出管理器实例
export default platformManager