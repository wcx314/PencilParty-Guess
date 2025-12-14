// 数据加密和安全工具类
class CryptoManager {
  constructor() {
    this.algorithm = 'AES-GCM'
    this.keyLength = 256
    this.ivLength = 12
    this.tagLength = 16
    this.secretKey = this.generateSecretKey()
  }

  // 生成密钥
  generateSecretKey() {
    // 在实际应用中，这个密钥应该从安全的地方获取
    // 这里使用固定密钥仅用于演示
    const keyString = 'PencilParty_Secret_Key_2024'
    return this.stringToArrayBuffer(keyString)
  }

  // 字符串转ArrayBuffer
  stringToArrayBuffer(str) {
    const encoder = new TextEncoder()
    return encoder.encode(str)
  }

  // ArrayBuffer转字符串
  arrayBufferToString(buffer) {
    const decoder = new TextDecoder()
    return decoder.decode(buffer)
  }

  // 生成随机IV
  generateIV() {
    const iv = new Uint8Array(this.ivLength)
    crypto.getRandomValues(iv)
    return iv
  }

  // 加密数据
  async encrypt(data) {
    try {
      // 将数据转换为字符串
      const dataStr = typeof data === 'string' ? data : JSON.stringify(data)
      const dataBuffer = this.stringToArrayBuffer(dataStr)
      
      // 生成IV
      const iv = this.generateIV()
      
      // 导入密钥
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        this.secretKey,
        { name: this.algorithm },
        false,
        ['encrypt']
      )
      
      // 加密数据
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: this.algorithm,
          iv: iv
        },
        cryptoKey,
        dataBuffer
      )
      
      // 组合IV和加密数据
      const encryptedArray = new Uint8Array(encryptedBuffer)
      const result = new Uint8Array(iv.length + encryptedArray.length)
      result.set(iv)
      result.set(encryptedArray, iv.length)
      
      // 转换为Base64
      return this.arrayBufferToBase64(result)
    } catch (error) {
      console.error('加密失败:', error)
      throw new Error('数据加密失败')
    }
  }

  // 解密数据
  async decrypt(encryptedData) {
    try {
      // 从Base64转换为ArrayBuffer
      const encryptedArray = this.base64ToArrayBuffer(encryptedData)
      
      // 提取IV和加密数据
      const iv = encryptedArray.slice(0, this.ivLength)
      const data = encryptedArray.slice(this.ivLength)
      
      // 导入密钥
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        this.secretKey,
        { name: this.algorithm },
        false,
        ['decrypt']
      )
      
      // 解密数据
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: this.algorithm,
          iv: iv
        },
        cryptoKey,
        data
      )
      
      // 转换为字符串
      const decryptedStr = this.arrayBufferToString(decryptedBuffer)
      
      // 尝试解析JSON
      try {
        return JSON.parse(decryptedStr)
      } catch (error) {
        return decryptedStr
      }
    } catch (error) {
      console.error('解密失败:', error)
      throw new Error('数据解密失败')
    }
  }

  // ArrayBuffer转Base64
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  // Base64转ArrayBuffer
  base64ToArrayBuffer(base64) {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes
  }

  // 生成签名
  async generateSignature(data, secret = null) {
    try {
      const dataStr = typeof data === 'string' ? data : JSON.stringify(data)
      const dataBuffer = this.stringToArrayBuffer(dataStr)
      
      // 使用HMAC-SHA256签名
      const secretBuffer = secret ? this.stringToArrayBuffer(secret) : this.secretKey
      
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        secretBuffer,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      )
      
      const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, dataBuffer)
      
      return this.arrayBufferToBase64(signatureBuffer)
    } catch (error) {
      console.error('生成签名失败:', error)
      throw new Error('签名生成失败')
    }
  }

  // 验证签名
  async verifySignature(data, signature, secret = null) {
    try {
      const dataStr = typeof data === 'string' ? data : JSON.stringify(data)
      const dataBuffer = this.stringToArrayBuffer(dataStr)
      const signatureBuffer = this.base64ToArrayBuffer(signature)
      
      const secretBuffer = secret ? this.stringToArrayBuffer(secret) : this.secretKey
      
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        secretBuffer,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
      )
      
      const isValid = await crypto.subtle.verify('HMAC', cryptoKey, signatureBuffer, dataBuffer)
      
      return isValid
    } catch (error) {
      console.error('验证签名失败:', error)
      return false
    }
  }

  // 哈希数据
  async hash(data) {
    try {
      const dataStr = typeof data === 'string' ? data : JSON.stringify(data)
      const dataBuffer = this.stringToArrayBuffer(dataStr)
      
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
      
      // 转换为十六进制字符串
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      
      return hashHex
    } catch (error) {
      console.error('哈希失败:', error)
      throw new Error('数据哈希失败')
    }
  }

  // 生成随机字符串
  generateRandomString(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length)
      result += chars.charAt(randomIndex)
    }
    
    return result
  }

  // 生成时间戳（防重放攻击）
  generateTimestamp() {
    return Date.now().toString()
  }

  // 生成nonce（防重放攻击）
  generateNonce() {
    return this.generateRandomString(16)
  }

  // 创建安全请求头
  createSecureHeaders(data, additionalHeaders = {}) {
    const timestamp = this.generateTimestamp()
    const nonce = this.generateNonce()
    
    const signData = {
      data: data,
      timestamp: timestamp,
      nonce: nonce
    }
    
    return {
      'X-Timestamp': timestamp,
      'X-Nonce': nonce,
      'X-Signature': this.generateSignatureSync(signData),
      ...additionalHeaders
    }
  }

  // 同步签名（简化版本，用于不支持Web Crypto API的环境）
  generateSignatureSync(data) {
    try {
      const dataStr = typeof data === 'string' ? data : JSON.stringify(data)
      
      // 简单的哈希函数（仅用于演示，实际应用中应使用更安全的算法）
      let hash = 0
      for (let i = 0; i < dataStr.length; i++) {
        const char = dataStr.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // 转换为32位整数
      }
      
      return Math.abs(hash).toString(16)
    } catch (error) {
      console.error('同步签名失败:', error)
      return ''
    }
  }

  // 敏感数据脱敏
  maskSensitiveData(data, sensitiveFields = ['password', 'token', 'secret']) {
    if (typeof data !== 'object' || data === null) {
      return data
    }
    
    const maskedData = Array.isArray(data) ? [...data] : { ...data }
    
    for (const key in maskedData) {
      if (sensitiveFields.includes(key.toLowerCase())) {
        maskedData[key] = '***'
      } else if (typeof maskedData[key] === 'object' && maskedData[key] !== null) {
        maskedData[key] = this.maskSensitiveData(maskedData[key], sensitiveFields)
      }
    }
    
    return maskedData
  }

  // 检查数据完整性
  async checkIntegrity(data, receivedHash) {
    try {
      const calculatedHash = await this.hash(data)
      return calculatedHash === receivedHash
    } catch (error) {
      console.error('检查数据完整性失败:', error)
      return false
    }
  }
}

// 创建单例实例
const cryptoManager = new CryptoManager()

// 导出便捷方法
export const encrypt = (data) => cryptoManager.encrypt(data)
export const decrypt = (encryptedData) => cryptoManager.decrypt(encryptedData)
export const generateSignature = (data, secret) => cryptoManager.generateSignature(data, secret)
export const verifySignature = (data, signature, secret) => cryptoManager.verifySignature(data, signature, secret)
export const hash = (data) => cryptoManager.hash(data)
export const generateRandomString = (length) => cryptoManager.generateRandomString(length)
export const createSecureHeaders = (data, headers) => cryptoManager.createSecureHeaders(data, headers)
export const maskSensitiveData = (data, fields) => cryptoManager.maskSensitiveData(data, fields)
export const checkIntegrity = (data, hash) => cryptoManager.checkIntegrity(data, hash)

// 导出管理器实例
export default cryptoManager

// 兼容性检查
if (typeof crypto === 'undefined' || !crypto.subtle) {
  console.warn('当前环境不支持Web Crypto API，加密功能将被禁用')
  
  // 提供降级方案
  const encryptFallback = async (data) => {
    console.warn('加密功能不可用，返回原始数据')
    return typeof data === 'string' ? data : JSON.stringify(data)
  }
  
  const decryptFallback = async (encryptedData) => {
    console.warn('解密功能不可用，返回原始数据')
    try {
      return JSON.parse(encryptedData)
    } catch (error) {
      return encryptedData
    }
  }
  
  // 重新导出降级函数
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      ...module.exports,
      encrypt: encryptFallback,
      decrypt: decryptFallback
    }
  }
}