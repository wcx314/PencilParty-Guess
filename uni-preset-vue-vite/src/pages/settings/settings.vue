<template>
  <view class="container">
    <!-- 背景装饰 -->
    <view class="bg-decoration">
      <view class="bg-circle circle-1"></view>
      <view class="bg-circle circle-2"></view>
      <view class="bg-circle circle-3"></view>
    </view>
    
    <!-- 顶部状态栏占位 -->
    <view class="status-bar"></view>
    
    <!-- 主要内容区域 -->
    <view class="main-content">
      <!-- 头部导航 -->
      <view class="header">
        <view class="nav-left" @click="goBack">
          <text class="nav-icon">←</text>
        </view>
        <text class="nav-title">设置</text>
        <view class="nav-right"></view>
      </view>
      
      <!-- 用户信息卡片 -->
      <view class="user-card">
        <view class="user-info">
          <view class="avatar">
            <image class="avatar-img" :src="userInfo.avatar || '/static/logo.png'" mode="aspectFit"></image>
          </view>
          <view class="user-details">
            <text class="username">{{ userInfo.nickname || '玩家昵称' }}</text>
            <text class="user-level">Lv.{{ userInfo.level || 1 }}</text>
          </view>
        </view>
        <view class="edit-profile-btn" @click="editProfile">
          <text class="edit-text">编辑资料</text>
          <text class="edit-icon">→</text>
        </view>
      </view>
      
      <!-- 设置选项 -->
      <view class="settings-section">
        <!-- 账号设置 -->
        <view class="settings-group">
          <view class="group-title">
            <text class="title-text">账号设置</text>
          </view>
          
          <view class="settings-list">
            <view class="setting-item" @click="editProfile">
              <view class="item-left">
                <text class="item-icon">👤</text>
                <text class="item-text">个人资料</text>
              </view>
              <view class="item-right">
                <text class="item-desc">编辑个人信息</text>
                <text class="arrow-icon">→</text>
              </view>
            </view>
            
            <view class="setting-item" @click="changePassword">
              <view class="item-left">
                <text class="item-icon">🔒</text>
                <text class="item-text">修改密码</text>
              </view>
              <view class="item-right">
                <text class="item-desc">更改登录密码</text>
                <text class="arrow-icon">→</text>
              </view>
            </view>
            
            <view class="setting-item" @click="accountSecurity">
              <view class="item-left">
                <text class="item-icon">🛡️</text>
                <text class="item-text">账号安全</text>
              </view>
              <view class="item-right">
                <text class="item-desc">绑定手机、邮箱</text>
                <text class="arrow-icon">→</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 通知设置 -->
        <view class="settings-group">
          <view class="group-title">
            <text class="title-text">通知设置</text>
          </view>
          
          <view class="settings-list">
            <view class="setting-item">
              <view class="item-left">
                <text class="item-icon">🔔</text>
                <text class="item-text">游戏邀请</text>
              </view>
              <view class="item-right">
                <switch 
                  :checked="settings.gameInvites" 
                  @change="toggleSetting('gameInvites')"
                  color="#667eea"
                />
              </view>
            </view>
            
            <view class="setting-item">
              <view class="item-left">
                <text class="item-icon">💬</text>
                <text class="item-text">好友消息</text>
              </view>
              <view class="item-right">
                <switch 
                  :checked="settings.friendMessages" 
                  @change="toggleSetting('friendMessages')"
                  color="#667eea"
                />
              </view>
            </view>
            
            <view class="setting-item">
              <view class="item-left">
                <text class="item-icon">📢</text>
                <text class="item-text">系统通知</text>
              </view>
              <view class="item-right">
                <switch 
                  :checked="settings.systemNotifications" 
                  @change="toggleSetting('systemNotifications')"
                  color="#667eea"
                />
              </view>
            </view>
          </view>
        </view>
        
        <!-- 其他设置 -->
        <view class="settings-group">
          <view class="group-title">
            <text class="title-text">其他设置</text>
          </view>
          
          <view class="settings-list">
            <view class="setting-item" @click="clearCache">
              <view class="item-left">
                <text class="item-icon">🧹</text>
                <text class="item-text">清除缓存</text>
              </view>
              <view class="item-right">
                <text class="item-desc">{{ cacheSize }}</text>
                <text class="arrow-icon">→</text>
              </view>
            </view>
            
            <view class="setting-item" @click="aboutUs">
              <view class="item-left">
                <text class="item-icon">ℹ️</text>
                <text class="item-text">关于我们</text>
              </view>
              <view class="item-right">
                <text class="item-desc">版本 1.0.0</text>
                <text class="arrow-icon">→</text>
              </view>
            </view>
            
            <view class="setting-item" @click="feedback">
              <view class="item-left">
                <text class="item-icon">📝</text>
                <text class="item-text">意见反馈</text>
              </view>
              <view class="item-right">
                <text class="arrow-icon">→</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 退出登录按钮 -->
      <view class="logout-section">
        <button class="logout-btn" @click="logout">
          退出登录
        </button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      userInfo: {
        nickname: '玩家昵称',
        level: 1,
        avatar: '/static/logo.png'
      },
      
      settings: {
        gameInvites: true,
        friendMessages: true,
        systemNotifications: true
      },
      
      cacheSize: '12.3 MB'
    }
  },
  
  onLoad() {
    this.loadUserInfo()
    this.loadSettings()
    this.calculateCacheSize()
  },
  
  methods: {
    // 加载用户信息
    loadUserInfo() {
      const savedProfile = uni.getStorageSync('userProfile')
      if (savedProfile && savedProfile.nickname) {
        this.userInfo.nickname = savedProfile.nickname
      }
      
      const userInfo = uni.getStorageSync('userInfo')
      if (userInfo) {
        this.userInfo = { ...this.userInfo, ...userInfo }
      }
    },
    
    // 加载设置
    loadSettings() {
      const savedSettings = uni.getStorageSync('appSettings')
      if (savedSettings) {
        this.settings = { ...this.settings, ...savedSettings }
      }
    },
    
    // 计算缓存大小（模拟）
    calculateCacheSize() {
      // 模拟计算缓存大小
      const size = Math.random() * 50 + 10
      this.cacheSize = size.toFixed(1) + ' MB'
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },
    
    // 编辑个人资料
    editProfile() {
      uni.navigateTo({
        url: '/pages/profile/profile'
      })
    },
    
    // 修改密码
    changePassword() {
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    },
    
    // 账号安全
    accountSecurity() {
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    },
    
    // 切换设置
    toggleSetting(key) {
      this.settings[key] = !this.settings[key]
      uni.setStorageSync('appSettings', this.settings)
      
      const settingNames = {
        gameInvites: '游戏邀请',
        friendMessages: '好友消息',
        systemNotifications: '系统通知'
      }
      
      uni.showToast({
        title: `${this.settings[key] ? '已开启' : '已关闭'}${settingNames[key]}`,
        icon: 'none'
      })
    },
    
    // 清除缓存
    clearCache() {
      uni.showModal({
        title: '清除缓存',
        content: '确定要清除应用缓存吗？',
        success: (res) => {
          if (res.confirm) {
            uni.showLoading({
              title: '清除中...'
            })
            
            setTimeout(() => {
              uni.hideLoading()
              this.cacheSize = '0.0 MB'
              uni.showToast({
                title: '清除成功',
                icon: 'success'
              })
            }, 1500)
          }
        }
      })
    },
    
    // 关于我们
    aboutUs() {
      uni.showModal({
        title: '关于我们',
        content: 'PencilParty v1.0.0\n\n一个有趣的多人在线游戏平台，享受与朋友一起游戏的快乐时光！',
        showCancel: false,
        confirmText: '确定'
      })
    },
    
    // 意见反馈
    feedback() {
      uni.showModal({
        title: '意见反馈',
        content: '感谢您的使用！\n\n如有任何问题或建议，请通过以下方式联系我们：\n邮箱：feedback@pencilparty.com',
        showCancel: false,
        confirmText: '确定'
      })
    },
    
    // 退出登录
    logout() {
      uni.showModal({
        title: '退出登录',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            // 清除用户信息
            uni.removeStorageSync('userInfo')
            uni.removeStorageSync('userProfile')
            
            uni.showToast({
              title: '已退出登录',
              icon: 'success'
            })
            
            // 跳转到登录页面
            setTimeout(() => {
              uni.reLaunch({
                url: '/pages/index/index'
              })
            }, 1500)
          }
        }
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
  flex-direction: column;
}

/* 背景装饰 */
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
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

/* 状态栏占位 */
.status-bar {
  height: var(--status-bar-height, 44px);
  width: 100%;
}

/* 主要内容区域 */
.main-content {
  flex: 1;
  padding: 0 30rpx;
  padding-bottom: 30rpx;
  z-index: 10;
  overflow-y: auto;
}

/* 头部导航 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  margin-bottom: 30rpx;
}

.nav-left {
  width: 60rpx;
  height: 60rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.nav-left:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.3);
}

.nav-icon {
  font-size: 32rpx;
  color: #ffffff;
  font-weight: bold;
}

.nav-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #ffffff;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
}

.nav-right {
  width: 60rpx;
}

/* 用户信息卡片 */
.user-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10rpx);
  border-radius: 25rpx;
  padding: 30rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 15rpx 40rpx rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: rgba(102, 126, 234, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.avatar-img {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.username {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 5rpx;
}

.user-level {
  font-size: 24rpx;
  color: #666;
  background: rgba(102, 126, 234, 0.1);
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  align-self: flex-start;
}

.edit-profile-btn {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 15rpx 25rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20rpx;
  transition: all 0.3s ease;
}

.edit-profile-btn:active {
  transform: scale(0.95);
}

.edit-text {
  font-size: 26rpx;
  color: #ffffff;
  font-weight: 500;
}

.edit-icon {
  font-size: 24rpx;
  color: #ffffff;
}

/* 设置区域 */
.settings-section {
  margin-bottom: 40rpx;
}

.settings-group {
  margin-bottom: 40rpx;
}

.group-title {
  margin-bottom: 20rpx;
  padding-left: 10rpx;
}

.title-text {
  font-size: 28rpx;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.settings-list {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10rpx);
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 15rpx 40rpx rgba(0, 0, 0, 0.2);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 25rpx;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item:active {
  background: rgba(102, 126, 234, 0.05);
}

.item-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.item-icon {
  font-size: 32rpx;
  width: 40rpx;
  text-align: center;
}

.item-text {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}

.item-right {
  display: flex;
  align-items: center;
  gap: 15rpx;
}

.item-desc {
  font-size: 24rpx;
  color: #999;
}

.arrow-icon {
  font-size: 24rpx;
  color: #ccc;
}

/* 退出登录按钮 */
.logout-section {
  margin-top: auto;
  padding-top: 20rpx;
}

.logout-btn {
  width: 100%;
  height: 90rpx;
  background: rgba(255, 59, 48, 0.9);
  color: #ffffff;
  border: none;
  border-radius: 25rpx;
  font-size: 32rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 30rpx rgba(255, 59, 48, 0.3);
  transition: all 0.3s ease;
}

.logout-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 5rpx 15rpx rgba(255, 59, 48, 0.3);
}

/* 响应式设计 */
@media screen and (max-width: 400px) {
  .main-content {
    padding: 0 20rpx;
  }
  
  .user-card {
    padding: 25rpx;
  }
  
  .setting-item {
    padding: 25rpx 20rpx;
  }
}
</style>