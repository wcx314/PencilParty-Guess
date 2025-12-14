import { apiConfig, errorCodes, httpStatus, defaultHeaders } from '@/config/api'

// 请求拦截器
const requestInterceptor = (config) => {
  // 添加认证token
  const token = uni.getStorageSync('accessToken')
  if (token) {
    config.header = {
      ...config.header,
      'Authorization': `Bearer ${token}`
    }
  }
  
  // 添加请求ID用于追踪
  config.header['X-Request-ID'] = generateRequestId()
  
  // 添加平台信息
  config.header['X-Platform'] = getPlatformInfo()
  
  console.log('🚀 发送请求:', {
    url: config.url,
    method: config.method,
    data: config.data,
    headers: config.header
  })
  
  return config
}

// 响应拦截器
const responseInterceptor = (response) => {
  const { statusCode, data } = response
  
  console.log('📥 收到响应:', {
    url: response.config?.url,
    status: statusCode,
    data: data
  })
  
  // HTTP状态码检查
  if (statusCode !== httpStatus.OK && statusCode !== httpStatus.CREATED) {
    return handleHttpError(statusCode, data)
  }
  
  // 业务状态码检查
  if (!data.success) {
    return handleBusinessError(data)
  }
  
  return {
    success: true,
    data: data.data,
    message: data.message
  }
}

// 错误处理
const handleError = (error) => {
  console.error('❌ 请求错误:', error)
  
  let errorInfo = {
    success: false,
    message: '网络请求失败',
    code: errorCodes.NETWORK_ERROR,
    data: null
  }
  
  // 网络错误
  if (error.errMsg) {
    if (error.errMsg.includes('timeout')) {
      errorInfo.message = '请求超时，请检查网络连接'
      errorInfo.code = errorCodes.TIMEOUT
    } else if (error.errMsg.includes('fail')) {
      errorInfo.message = '网络连接失败，请检查网络设置'
      errorInfo.code = errorCodes.NETWORK_ERROR
    }
  }
  
  return errorInfo
}

// HTTP错误处理
const handleHttpError = (statusCode, data) => {
  let errorInfo = {
    success: false,
    message: '请求失败',
    code: 'HTTP_ERROR',
    data: data
  }
  
  switch (statusCode) {
    case httpStatus.BAD_REQUEST:
      errorInfo.message = data.message || '请求参数错误'
      errorInfo.code = data.code || 'BAD_REQUEST'
      break
    case httpStatus.UNAUTHORIZED:
      errorInfo.message = '请先登录'
      errorInfo.code = data.code || errorCodes.TOKEN_MISSING
      // 清除本地token
      clearTokens()
      // 跳转到登录页
      redirectToLogin()
      break
    case httpStatus.FORBIDDEN:
      errorInfo.message = data.message || '权限不足'
      errorInfo.code = data.code || 'PERMISSION_DENIED'
      break
    case httpStatus.NOT_FOUND:
      errorInfo.message = data.message || '请求的资源不存在'
      errorInfo.code = data.code || 'NOT_FOUND'
      break
    case httpStatus.TOO_MANY_REQUESTS:
      errorInfo.message = data.message || '请求过于频繁，请稍后再试'
      errorInfo.code = data.code || errorCodes.RATE_LIMIT_EXCEEDED
      break
    case httpStatus.INTERNAL_SERVER_ERROR:
      errorInfo.message = '服务器内部错误，请稍后再试'
      errorInfo.code = data.code || errorCodes.SERVER_ERROR
      break
    default:
      errorInfo.message = `请求失败 (${statusCode})`
      errorInfo.code = `HTTP_${statusCode}`
  }
  
  return errorInfo
}

// 业务错误处理
const handleBusinessError = (data) => {
  let errorInfo = {
    success: false,
    message: data.message || '操作失败',
    code: data.code || 'BUSINESS_ERROR',
    data: data.data || null
  }
  
  // 特殊处理token过期
  if (data.code === errorCodes.TOKEN_EXPIRED) {
    return handleTokenExpired()
  }
  
  return errorInfo
}

// Token过期处理
const handleTokenExpired = async () => {
  try {
    const refreshToken = uni.getStorageSync('refreshToken')
    if (!refreshToken) {
      clearTokens()
      redirectToLogin()
      return {
        success: false,
        message: '登录已过期，请重新登录',
        code: errorCodes.TOKEN_EXPIRED
      }
    }
    
    // 尝试刷新token
    const refreshResult = await refreshTokens(refreshToken)
    if (refreshResult.success) {
      // 重新发起原请求
      return {
        success: false,
        message: 'Token已刷新，请重试',
        code: 'TOKEN_REFRESHED',
        needRetry: true
      }
    } else {
      clearTokens()
      redirectToLogin()
      return {
        success: false,
        message: '登录已过期，请重新登录',
        code: errorCodes.TOKEN_EXPIRED
      }
    }
  } catch (error) {
    clearTokens()
    redirectToLogin()
    return {
      success: false,
      message: '登录已过期，请重新登录',
      code: errorCodes.TOKEN_EXPIRED
    }
  }
}

// 刷新token
const refreshTokens = (refreshToken) => {
  return new Promise((resolve) => {
    uni.request({
      url: `${apiConfig.baseURL}/auth/refresh`,
      method: 'POST',
      data: { refreshToken },
      header: {
        'Content-Type': 'application/json'
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          const { accessToken, refreshToken: newRefreshToken } = res.data.data
          uni.setStorageSync('accessToken', accessToken)
          uni.setStorageSync('refreshToken', newRefreshToken)
          resolve({ success: true })
        } else {
          resolve({ success: false })
        }
      },
      fail: () => {
        resolve({ success: false })
      }
    })
  })
}

// 清除tokens
const clearTokens = () => {
  uni.removeStorageSync('accessToken')
  uni.removeStorageSync('refreshToken')
  uni.removeStorageSync('userInfo')
}

// 跳转到登录页
const redirectToLogin = () => {
  // 延迟跳转，避免在请求过程中跳转
  setTimeout(() => {
    uni.reLaunch({
      url: '/pages/login/login'
    })
  }, 100)
}

// 生成请求ID
const generateRequestId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 获取平台信息
const getPlatformInfo = () => {
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

// 重试机制
const retryRequest = async (config, retryCount = 0) => {
  if (retryCount >= apiConfig.retryTimes) {
    return handleError({ errMsg: 'max_retries_exceeded' })
  }
  
  try {
    const result = await makeRequest(config)
    
    // 如果需要重试（token刷新后）
    if (result.code === 'TOKEN_REFRESHED') {
      return await makeRequest(config)
    }
    
    return result
  } catch (error) {
    console.log(`重试请求 (${retryCount + 1}/${apiConfig.retryTimes}):`, config.url)
    
    // 等待后重试
    await new Promise(resolve => setTimeout(resolve, apiConfig.retryDelay))
    return await retryRequest(config, retryCount + 1)
  }
}

// 发起请求
const makeRequest = (config) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${apiConfig.baseURL}${config.url}`,
      method: config.method || 'GET',
      data: config.data || {},
      header: {
        ...defaultHeaders,
        ...config.header
      },
      timeout: config.timeout || apiConfig.timeout,
      success: (response) => {
        response.config = config
        const result = responseInterceptor(response)
        
        if (result.success) {
          resolve(result)
        } else {
          reject(result)
        }
      },
      fail: (error) => {
        error.config = config
        const result = handleError(error)
        reject(result)
      }
    })
  })
}

// 主要的请求方法
export const request = async (config) => {
  // 应用请求拦截器
  config = requestInterceptor(config)
  
  // 使用重试机制
  try {
    return await retryRequest(config)
  } catch (error) {
    return error
  }
}

// 便捷方法
export const get = (url, params = {}, config = {}) => {
  return request({
    url,
    method: 'GET',
    data: params,
    ...config
  })
}

export const post = (url, data = {}, config = {}) => {
  return request({
    url,
    method: 'POST',
    data,
    ...config
  })
}

export const put = (url, data = {}, config = {}) => {
  return request({
    url,
    method: 'PUT',
    data,
    ...config
  })
}

export const del = (url, config = {}) => {
  return request({
    url,
    method: 'DELETE',
    ...config
  })
}

export default {
  request,
  get,
  post,
  put,
  delete: del
}