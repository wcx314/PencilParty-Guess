<template>
  <view class="container">
    <!-- 背景装饰 -->
    <view class="bg-decoration">
      <view class="bg-circle circle-1"></view>
      <view class="bg-circle circle-2"></view>
      <view class="bg-circle circle-3"></view>
    </view>
    
    <!-- 主要内容区域 -->
    <view class="main-content">
      <!-- Logo和标题 -->
      <view class="header">
        <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
        <text class="app-name">PencilParty</text>
        <text class="app-slogan">智慧游戏，精彩无限</text>
      </view>
      
      <!-- 登录/注册表单容器 -->
      <view class="form-container">
        <!-- 切换按钮 -->
        <view class="tab-switch">
          <view 
            class="tab-item" 
            :class="{ active: currentTab === 'login' }"
            @click="switchTab('login')"
          >
            <text class="tab-text">登录</text>
          </view>
          <view 
            class="tab-item" 
            :class="{ active: currentTab === 'register' }"
            @click="switchTab('register')"
          >
            <text class="tab-text">注册</text>
          </view>
        </view>
        
        <!-- 登录表单 -->
        <view v-if="currentTab === 'login'" class="form-content">
          <view class="input-group">
            <view class="input-wrapper">
              <text class="input-icon">👤</text>
              <input 
                class="form-input" 
                type="text" 
                placeholder="请输入用户名/手机号"
                v-model="loginForm.username"
                placeholder-class="input-placeholder"
              />
            </view>
          </view>
          
          <view class="input-group">
            <view class="input-wrapper">
              <text class="input-icon">🔒</text>
              <input 
                class="form-input" 
                :type="showPassword ? 'text' : 'password'" 
                placeholder="请输入密码"
                v-model="loginForm.password"
                placeholder-class="input-placeholder"
              />
              <text class="password-toggle" @click="togglePassword">
                {{ showPassword ? '👁️' : '👁️‍🗨️' }}
              </text>
            </view>
          </view>
          
          <view class="form-options">
            <view class="remember-me">
              <checkbox :checked="loginForm.remember" @change="onRememberChange" />
              <text class="option-text">记住密码</text>
            </view>
            <text class="forgot-password" @click="forgotPassword">忘记密码？</text>
          </view>
          
          <button class="submit-btn" @click="handleLogin" :disabled="!canLogin">
            {{ loading ? '登录中...' : '登录' }}
          </button>
          
          <!-- 第三方登录 -->
          <view class="third-party-login">
            <view class="divider">
              <view class="divider-line"></view>
              <text class="divider-text">其他登录方式</text>
              <view class="divider-line"></view>
            </view>
            <view class="third-party-icons">
              <view class="third-party-item" @click="thirdPartyLogin('wechat')">
                <text class="third-party-icon">💬</text>
              </view>
              <view class="third-party-item" @click="thirdPartyLogin('qq')">
                <text class="third-party-icon">🐧</text>
              </view>
              <view class="third-party-item" @click="thirdPartyLogin('weibo')">
                <text class="third-party-icon">🔴</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 注册表单 -->
        <view v-if="currentTab === 'register'" class="form-content">
          <view class="input-group">
            <view class="input-wrapper">
              <text class="input-icon">👤</text>
              <input 
                class="form-input" 
                type="text" 
                placeholder="请输入用户名"
                v-model="registerForm.username"
                placeholder-class="input-placeholder"
              />
            </view>
          </view>
          
          <view class="input-group">
            <view class="input-wrapper">
              <text class="input-icon">📱</text>
              <input 
                class="form-input" 
                type="number" 
                placeholder="请输入手机号"
                v-model="registerForm.phone"
                placeholder-class="input-placeholder"
              />
            </view>
          </view>
          
          <view class="input-group">
            <view class="input-wrapper input-with-code">
              <text class="input-icon">🔢</text>
              <input 
                class="form-input code-input" 
                type="number" 
                placeholder="请输入验证码"
                v-model="registerForm.code"
                placeholder-class="input-placeholder"
              />
              <button 
                class="code-btn" 
                @click="sendCode"
                :disabled="codeCountdown > 0"
              >
                {{ codeCountdown > 0 ? `${codeCountdown}s` : '获取验证码' }}
              </button>
            </view>
          </view>
          
          <view class="input-group">
            <view class="input-wrapper">
              <text class="input-icon">🔒</text>
              <input 
                class="form-input" 
                :type="showRegisterPassword ? 'text' : 'password'" 
                placeholder="请输入密码"
                v-model="registerForm.password"
                placeholder-class="input-placeholder"
              />
              <text class="password-toggle" @click="toggleRegisterPassword">
                {{ showRegisterPassword ? '👁️' : '👁️‍🗨️' }}
              </text>
            </view>
          </view>
          
          <view class="input-group">
            <view class="input-wrapper">
              <text class="input-icon">🔒</text>
              <input 
                class="form-input" 
                :type="showConfirmPassword ? 'text' : 'password'" 
                placeholder="请确认密码"
                v-model="registerForm.confirmPassword"
                placeholder-class="input-placeholder"
              />
              <text class="password-toggle" @click="toggleConfirmPassword">
                {{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}
              </text>
            </view>
          </view>
          
          <view class="agreement">
            <checkbox :checked="registerForm.agreed" @change="onAgreementChange" />
            <text class="agreement-text">
              我已阅读并同意
              <text class="agreement-link" @click="showAgreement">《用户协议》</text>
              和
              <text class="agreement-link" @click="showPrivacy">《隐私政策》</text>
            </text>
          </view>
          
          <button class="submit-btn" @click="handleRegister" :disabled="!canRegister">
            {{ loading ? '注册中...' : '注册' }}
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentTab: 'login', // 'login' 或 'register'
      showPassword: false,
      showRegisterPassword: false,
      showConfirmPassword: false,
      loading: false,
      codeCountdown: 0,
      
      // 登录表单
      loginForm: {
        username: '',
        password: '',
        remember: false
      },
      
      // 注册表单
      registerForm: {
        username: '',
        phone: '',
        code: '',
        password: '',
        confirmPassword: '',
        agreed: false
      }
    }
  },
  
  computed: {
    canLogin() {
      return this.loginForm.username.trim() && 
             this.loginForm.password.trim() && 
             !this.loading
    },
    
    canRegister() {
      return this.registerForm.username.trim() && 
             this.registerForm.phone.trim() && 
             this.registerForm.code.trim() && 
             this.registerForm.password.trim() && 
             this.registerForm.confirmPassword.trim() && 
             this.registerForm.agreed && 
             !this.loading
    }
  },
  
  methods: {
    // 切换登录/注册标签
    switchTab(tab) {
      this.currentTab = tab
    },
    
    // 切换密码显示
    togglePassword() {
      this.showPassword = !this.showPassword
    },
    
    toggleRegisterPassword() {
      this.showRegisterPassword = !this.showRegisterPassword
    },
    
    toggleConfirmPassword() {
      this.showConfirmPassword = !this.showConfirmPassword
    },
    
    // 记住密码
    onRememberChange(e) {
      this.loginForm.remember = e.detail.value.length > 0
    },
    
    // 同意协议
    onAgreementChange(e) {
      this.registerForm.agreed = e.detail.value.length > 0
    },
    
    // 忘记密码
    forgotPassword() {
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    },
    
    // 发送验证码
    sendCode() {
      if (!this.registerForm.phone.trim()) {
        uni.showToast({
          title: '请输入手机号',
          icon: 'none'
        })
        return
      }
      
      if (!/^1[3-9]\d{9}$/.test(this.registerForm.phone)) {
        uni.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        })
        return
      }
      
      // 模拟发送验证码
      this.codeCountdown = 60
      const timer = setInterval(() => {
        this.codeCountdown--
        if (this.codeCountdown <= 0) {
          clearInterval(timer)
        }
      }, 1000)
      
      uni.showToast({
        title: '验证码已发送',
        icon: 'success'
      })
    },
    
    // 登录处理
    async handleLogin() {
      if (!this.canLogin) return
      
      this.loading = true
      
      try {
        // 模拟登录请求
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        uni.showToast({
          title: '登录成功',
          icon: 'success'
        })
        
        // 跳转到主页
        setTimeout(() => {
          uni.reLaunch({
            url: '/pages/home/home'
          })
        }, 1500)
        
      } catch (error) {
        uni.showToast({
          title: '登录失败，请重试',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    // 注册处理
    async handleRegister() {
      if (!this.canRegister) return
      
      // 验证密码
      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        uni.showToast({
          title: '两次密码不一致',
          icon: 'none'
        })
        return
      }
      
      if (this.registerForm.password.length < 6) {
        uni.showToast({
          title: '密码长度至少6位',
          icon: 'none'
        })
        return
      }
      
      this.loading = true
      
      try {
        // 模拟注册请求
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        uni.showToast({
          title: '注册成功',
          icon: 'success'
        })
        
        // 切换到登录页面
        setTimeout(() => {
          this.currentTab = 'login'
          this.loading = false
        }, 1500)
        
      } catch (error) {
        uni.showToast({
          title: '注册失败，请重试',
          icon: 'none'
        })
        this.loading = false
      }
    },
    
    // 第三方登录
    thirdPartyLogin(platform) {
      uni.showToast({
        title: `${platform}登录功能开发中`,
        icon: 'none'
      })
    },
    
    // 显示用户协议
    showAgreement() {
      uni.showToast({
        title: '用户协议页面开发中',
        icon: 'none'
      })
    },
    
    // 显示隐私政策
    showPrivacy() {
      uni.showToast({
        title: '隐私政策页面开发中',
        icon: 'none'
      })
    }
  }
}
</script>

<style>
/* 全局样式重置 */
page {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  height: 100vh;
  overflow: hidden;
}

.container {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 背景装饰 */
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.circle-1 {
  width: 300rpx;
  height: 300rpx;
  top: -100rpx;
  right: -100rpx;
  animation: float 6s ease-in-out infinite;
}

.circle-2 {
  width: 200rpx;
  height: 200rpx;
  bottom: 100rpx;
  left: -50rpx;
  animation: float 8s ease-in-out infinite reverse;
}

.circle-3 {
  width: 150rpx;
  height: 150rpx;
  top: 50%;
  right: 10%;
  animation: float 7s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

/* 主要内容区域 */
.main-content {
  width: 90%;
  max-width: 600rpx;
  z-index: 10;
}

/* 头部样式 */
.header {
  text-align: center;
  margin-bottom: 80rpx;
}

.logo {
  width: 120rpx;
  height: 120rpx;
  margin-bottom: 30rpx;
}

.app-name {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 10rpx;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
}

.app-slogan {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

/* 表单容器 */
.form-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10rpx);
  border-radius: 30rpx;
  padding: 60rpx 40rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3);
}

/* 标签切换 */
.tab-switch {
  display: flex;
  margin-bottom: 60rpx;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 25rpx;
  padding: 8rpx;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  border-radius: 20rpx;
  transition: all 0.3s ease;
}

.tab-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 8rpx 20rpx rgba(102, 126, 234, 0.4);
}

.tab-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #666;
  transition: color 0.3s ease;
}

.tab-item.active .tab-text {
  color: #ffffff;
}

/* 输入组 */
.input-group {
  margin-bottom: 40rpx;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 20rpx;
  padding: 0 30rpx;
  height: 100rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
}

.input-wrapper:focus-within {
  border-color: #667eea;
  background: #ffffff;
  box-shadow: 0 0 20rpx rgba(102, 126, 234, 0.2);
}

.input-icon {
  font-size: 36rpx;
  margin-right: 20rpx;
  color: #999;
}

.form-input {
  flex: 1;
  font-size: 32rpx;
  color: #333;
  background: transparent;
  border: none;
  outline: none;
}

.input-placeholder {
  color: #999;
}

.password-toggle {
  font-size: 32rpx;
  color: #999;
  padding: 10rpx;
  cursor: pointer;
}

/* 验证码输入 */
.input-with-code {
  padding-right: 10rpx;
}

.code-input {
  flex: 1;
  margin-right: 20rpx;
}

.code-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  border: none;
  border-radius: 15rpx;
  padding: 15rpx 25rpx;
  font-size: 24rpx;
  white-space: nowrap;
  min-width: 160rpx;
}

.code-btn:disabled {
  background: #ccc;
  color: #999;
}

/* 表单选项 */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 50rpx;
}

.remember-me {
  display: flex;
  align-items: center;
}

.option-text {
  font-size: 28rpx;
  color: #666;
  margin-left: 10rpx;
}

.forgot-password {
  font-size: 28rpx;
  color: #667eea;
}

/* 协议 */
.agreement {
  display: flex;
  align-items: flex-start;
  margin-bottom: 50rpx;
  padding: 0 10rpx;
}

.agreement-text {
  font-size: 24rpx;
  color: #666;
  margin-left: 10rpx;
  line-height: 1.5;
}

.agreement-link {
  color: #667eea;
  text-decoration: underline;
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  height: 100rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  border: none;
  border-radius: 25rpx;
  font-size: 36rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 30rpx rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
}

.submit-btn:not(:disabled):active {
  transform: translateY(2rpx);
  box-shadow: 0 5rpx 15rpx rgba(102, 126, 234, 0.4);
}

.submit-btn:disabled {
  background: #ccc;
  box-shadow: none;
}

/* 第三方登录 */
.third-party-login {
  margin-top: 60rpx;
}

.divider {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
}

.divider-line {
  flex: 1;
  height: 2rpx;
  background: rgba(0, 0, 0, 0.1);
}

.divider-text {
  font-size: 24rpx;
  color: #999;
  margin: 0 30rpx;
}

.third-party-icons {
  display: flex;
  justify-content: center;
  gap: 60rpx;
}

.third-party-item {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.third-party-item:active {
  transform: scale(0.95);
  background: rgba(0, 0, 0, 0.1);
}

.third-party-icon {
  font-size: 40rpx;
}

/* 响应式设计 */
@media screen and (max-width: 400px) {
  .form-container {
    padding: 40rpx 30rpx;
  }
  
  .main-content {
    width: 95%;
  }
}
</style>
