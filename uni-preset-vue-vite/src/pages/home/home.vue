<template>
  <view class="container">
    <!-- 背景装饰 -->
    <view class="bg-decoration">
      <view class="bg-circle circle-1"></view>
      <view class="bg-circle circle-2"></view>
      <view class="bg-circle circle-3"></view>
      <view class="bg-circle circle-4"></view>
    </view>
    
    <!-- 顶部状态栏占位 -->
    <view class="status-bar"></view>
    
    <!-- 主要内容区域 -->
    <view class="main-content">
      <!-- 头部信息 -->
      <view class="header">
        <view class="user-info">
          <view class="avatar">
            <image class="avatar-img" src="/static/logo.png" mode="aspectFit"></image>
          </view>
          <view class="user-details">
            <text class="username">玩家昵称</text>
            <text class="user-level">Lv.1</text>
          </view>
        </view>
        <view class="header-actions">
          <view class="action-btn" @click="showProfile">
            <text class="action-icon">👤</text>
          </view>
          <view class="action-btn" @click="showSettings">
            <text class="action-icon">⚙️</text>
          </view>
        </view>
      </view>
      
      <!-- 欢迎标语 -->
      <view class="welcome-section">
        <text class="welcome-title">欢迎来到游戏大厅</text>
        <text class="welcome-subtitle">选择你喜欢的游戏，开始精彩的派对时光！</text>
      </view>
      
      <!-- 游戏列表 -->
      <view class="games-section">
        <view class="section-title">
          <text class="title-text">热门游戏</text>
          <view class="title-decoration"></view>
        </view>
        
        <view class="games-grid">
          <!-- 你画我猜 -->
          <view class="game-card" @click="enterGame('draw-guess')">
            <view class="game-header">
              <view class="game-icon draw-icon">🎨</view>
              <view class="game-badge hot">热门</view>
            </view>
            <view class="game-content">
              <text class="game-title">你画我猜</text>
              <text class="game-desc">发挥想象力，画出精彩作品</text>
              <view class="game-stats">
                <view class="stat-item">
                  <text class="stat-icon">👥</text>
                  <text class="stat-text">2-8人</text>
                </view>
                <view class="stat-item">
                  <text class="stat-icon">⏱️</text>
                  <text class="stat-text">10分钟</text>
                </view>
              </view>
            </view>
            <view class="game-footer">
              <view class="difficulty easy">
                <text class="difficulty-text">简单</text>
              </view>
              <text class="play-btn">开始游戏 →</text>
            </view>
          </view>
          
          <!-- 推箱子 -->
          <view class="game-card" @click="enterGame('sokoban')">
            <view class="game-header">
              <view class="game-icon sokoban-icon">📦</view>
              <view class="game-badge puzzle">益智</view>
            </view>
            <view class="game-content">
              <text class="game-title">推箱子</text>
              <text class="game-desc">考验逻辑思维，挑战经典关卡</text>
              <view class="game-stats">
                <view class="stat-item">
                  <text class="stat-icon">👤</text>
                  <text class="stat-text">单人</text>
                </view>
                <view class="stat-item">
                  <text class="stat-icon">⏱️</text>
                  <text class="stat-text">15分钟</text>
                </view>
              </view>
            </view>
            <view class="game-footer">
              <view class="difficulty medium">
                <text class="difficulty-text">中等</text>
              </view>
              <text class="play-btn">开始游戏 →</text>
            </view>
          </view>
          
          <!-- 贪吃蛇 -->
          <view class="game-card" @click="enterGame('snake')">
            <view class="game-header">
              <view class="game-icon snake-icon">🐍</view>
              <view class="game-badge classic">经典</view>
            </view>
            <view class="game-content">
              <text class="game-title">贪吃蛇</text>
              <text class="game-desc">重温经典，挑战最高分数</text>
              <view class="game-stats">
                <view class="stat-item">
                  <text class="stat-icon">👤</text>
                  <text class="stat-text">单人</text>
                </view>
                <view class="stat-item">
                  <text class="stat-icon">⏱️</text>
                  <text class="stat-text">5分钟</text>
                </view>
              </view>
            </view>
            <view class="game-footer">
              <view class="difficulty easy">
                <text class="difficulty-text">简单</text>
              </view>
              <text class="play-btn">开始游戏 →</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 底部功能区 -->
      <view class="bottom-section">
        <view class="quick-actions">
          <view class="quick-btn" @click="showRanking">
            <text class="quick-icon">🏆</text>
            <text class="quick-text">排行榜</text>
          </view>
          <view class="quick-btn" @click="showFriends">
            <text class="quick-icon">👫</text>
            <text class="quick-text">好友</text>
          </view>
          <view class="quick-btn" @click="showShop">
            <text class="quick-icon">🛍️</text>
            <text class="quick-text">商店</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      userInfo: {
        username: '玩家昵称',
        level: 1,
        avatar: '/static/logo.png'
      }
    }
  },
  
  onLoad() {
    // 获取用户信息
    this.loadUserInfo()
  },
  
  methods: {
    // 加载用户信息
    loadUserInfo() {
      // 这里可以从本地存储或后端获取用户信息
      const userInfo = uni.getStorageSync('userInfo')
      if (userInfo) {
        this.userInfo = { ...this.userInfo, ...userInfo }
      }
    },
    
    // 进入游戏
    enterGame(gameType) {
      uni.showLoading({
        title: '正在进入游戏...'
      })
      
      setTimeout(() => {
        uni.hideLoading()
        uni.showToast({
          title: `${this.getGameName(gameType)}游戏开发中`,
          icon: 'none'
        })
        
        // 这里可以跳转到具体的游戏页面
        // uni.navigateTo({
        //   url: `/pages/games/${gameType}/${gameType}`
        // })
      }, 1000)
    },
    
    // 获取游戏名称
    getGameName(gameType) {
      const gameNames = {
        'draw-guess': '你画我猜',
        'sokoban': '推箱子',
        'snake': '贪吃蛇'
      }
      return gameNames[gameType] || '未知游戏'
    },
    
    // 显示个人资料
    showProfile() {
      uni.navigateTo({
        url: '/pages/profile/profile'
      })
    },
    
    // 显示设置
    showSettings() {
      uni.navigateTo({
        url: '/pages/settings/settings'
      })
    },
    
    // 显示排行榜
    showRanking() {
      uni.showToast({
        title: '排行榜页面开发中',
        icon: 'none'
      })
    },
    
    // 显示好友
    showFriends() {
      uni.showToast({
        title: '好友页面开发中',
        icon: 'none'
      })
    },
    
    // 显示商店
    showShop() {
      uni.showToast({
        title: '商店页面开发中',
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

.circle-4 {
  width: 100rpx;
  height: 100rpx;
  top: 30%;
  left: 5%;
  animation: float 9s ease-in-out infinite reverse;
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

/* 头部样式 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
  padding: 20rpx 0;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
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
  color: #ffffff;
  margin-bottom: 5rpx;
}

.user-level {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.2);
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
}

.header-actions {
  display: flex;
  gap: 20rpx;
}

.action-btn {
  width: 60rpx;
  height: 60rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.action-btn:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.3);
}

.action-icon {
  font-size: 28rpx;
}

/* 欢迎区域 */
.welcome-section {
  text-align: center;
  margin-bottom: 50rpx;
}

.welcome-title {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 15rpx;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
}

.welcome-subtitle {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
}

/* 游戏区域 */
.games-section {
  margin-bottom: 50rpx;
}

.section-title {
  text-align: center;
  margin-bottom: 40rpx;
  position: relative;
}

.title-text {
  font-size: 36rpx;
  font-weight: 600;
  color: #ffffff;
  position: relative;
  z-index: 2;
}

.title-decoration {
  position: absolute;
  bottom: -10rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 100rpx;
  height: 6rpx;
  background: linear-gradient(90deg, #ffd89b 0%, #19547b 100%);
  border-radius: 3rpx;
}

/* 游戏网格 */
.games-grid {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

/* 游戏卡片 */
.game-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10rpx);
  border-radius: 25rpx;
  padding: 30rpx;
  box-shadow: 0 15rpx 40rpx rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.game-card:active {
  transform: translateY(-5rpx);
  box-shadow: 0 20rpx 50rpx rgba(0, 0, 0, 0.3);
}

.game-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6rpx;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.game-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
}

.draw-icon {
  background: linear-gradient(135deg, #ff6b6b, #feca57);
}

.sokoban-icon {
  background: linear-gradient(135deg, #48dbfb, #0abde3);
}

.snake-icon {
  background: linear-gradient(135deg, #1dd1a1, #10ac84);
}

.game-badge {
  padding: 8rpx 16rpx;
  border-radius: 15rpx;
  font-size: 20rpx;
  font-weight: 600;
  color: #ffffff;
}

.hot {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
}

.puzzle {
  background: linear-gradient(135deg, #48dbfb, #0abde3);
}

.classic {
  background: linear-gradient(135deg, #1dd1a1, #10ac84);
}

.game-content {
  margin-bottom: 25rpx;
}

.game-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 10rpx;
}

.game-desc {
  display: block;
  font-size: 26rpx;
  color: #666;
  line-height: 1.4;
  margin-bottom: 20rpx;
}

.game-stats {
  display: flex;
  gap: 30rpx;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.stat-icon {
  font-size: 24rpx;
}

.stat-text {
  font-size: 24rpx;
  color: #666;
}

.game-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.difficulty {
  padding: 6rpx 12rpx;
  border-radius: 10rpx;
  font-size: 20rpx;
  font-weight: 600;
}

.easy {
  background: rgba(29, 209, 161, 0.2);
  color: #10ac84;
}

.medium {
  background: rgba(254, 202, 87, 0.2);
  color: #f39c12;
}

.difficulty-text {
  font-size: 20rpx;
}

.play-btn {
  font-size: 28rpx;
  font-weight: 600;
  color: #667eea;
  transition: all 0.3s ease;
}

/* 底部功能区 */
.bottom-section {
  margin-top: auto;
  padding-top: 30rpx;
}

.quick-actions {
  display: flex;
  justify-content: space-around;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10rpx);
  border-radius: 20rpx;
  padding: 30rpx 20rpx;
}

.quick-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  transition: all 0.3s ease;
}

.quick-btn:active {
  transform: scale(0.95);
}

.quick-icon {
  font-size: 36rpx;
}

.quick-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
}

/* 响应式设计 */
@media screen and (max-width: 400px) {
  .main-content {
    padding: 0 20rpx;
  }
  
  .game-card {
    padding: 25rpx;
  }
  
  .welcome-title {
    font-size: 36rpx;
  }
  
  .game-title {
    font-size: 30rpx;
  }
}
</style>