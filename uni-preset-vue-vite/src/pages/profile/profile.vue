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
        <text class="nav-title">个人资料</text>
        <view class="nav-right">
          <text class="save-btn" @click="saveProfile" :class="{ active: canSave }">保存</text>
        </view>
      </view>
      
      <!-- 头像区域 -->
      <view class="avatar-section">
        <view class="avatar-container" @click="changeAvatar">
          <image class="avatar-img" :src="profileForm.avatar || '/static/logo.png'" mode="aspectFit"></image>
          <view class="avatar-edit">
            <text class="edit-icon">📷</text>
          </view>
        </view>
        <text class="avatar-tip">点击更换头像</text>
      </view>
      
      <!-- 基本信息 -->
      <view class="form-section">
        <view class="section-title">
          <text class="title-text">基本信息</text>
          <view class="title-decoration"></view>
        </view>
        
        <view class="form-container">
          <!-- 昵称 -->
          <view class="form-item">
            <view class="form-label">
              <text class="label-icon">👤</text>
              <text class="label-text">昵称</text>
            </view>
            <input 
              class="form-input" 
              type="text" 
              placeholder="请输入昵称"
              v-model="profileForm.nickname"
              maxlength="20"
            />
          </view>
          
          <!-- 性别 -->
          <view class="form-item">
            <view class="form-label">
              <text class="label-icon">⚧️</text>
              <text class="label-text">性别</text>
            </view>
            <view class="gender-options">
              <view 
                class="gender-item" 
                :class="{ active: profileForm.gender === 'male' }"
                @click="selectGender('male')"
              >
                <text class="gender-icon">👦</text>
                <text class="gender-text">男生</text>
              </view>
              <view 
                class="gender-item" 
                :class="{ active: profileForm.gender === 'female' }"
                @click="selectGender('female')"
              >
                <text class="gender-icon">👧</text>
                <text class="gender-text">女生</text>
              </view>
              <view 
                class="gender-item" 
                :class="{ active: profileForm.gender === 'secret' }"
                @click="selectGender('secret')"
              >
                <text class="gender-icon">🤫</text>
                <text class="gender-text">保密</text>
              </view>
            </view>
          </view>
          
          <!-- 生日 -->
          <view class="form-item">
            <view class="form-label">
              <text class="label-icon">🎂</text>
              <text class="label-text">生日</text>
            </view>
            <picker 
              mode="date" 
              :value="profileForm.birthday" 
              @change="onBirthdayChange"
              :start="minDate"
              :end="maxDate"
            >
              <view class="picker-input">
                <text class="picker-text" :class="{ placeholder: !profileForm.birthday }">
                  {{ profileForm.birthday || '请选择生日' }}
                </text>
                <text class="picker-arrow">▼</text>
              </view>
            </picker>
          </view>
          
          <!-- 星座 -->
          <view class="form-item">
            <view class="form-label">
              <text class="label-icon">⭐</text>
              <text class="label-text">星座</text>
            </view>
            <view class="constellation-display">
              <text class="constellation-icon">{{ constellationInfo.icon }}</text>
              <text class="constellation-name">{{ constellationInfo.name }}</text>
              <text class="constellation-date">{{ constellationInfo.dateRange }}</text>
            </view>
          </view>
          
          <!-- 个性签名 -->
          <view class="form-item">
            <view class="form-label">
              <text class="label-icon">✍️</text>
              <text class="label-text">个性签名</text>
            </view>
            <textarea 
              class="form-textarea" 
              placeholder="写点什么介绍一下自己吧~"
              v-model="profileForm.signature"
              maxlength="50"
            />
            <text class="char-count">{{ profileForm.signature.length }}/50</text>
          </view>
        </view>
      </view>
      
      <!-- 游戏偏好 -->
      <view class="form-section">
        <view class="section-title">
          <text class="title-text">游戏偏好</text>
          <view class="title-decoration"></view>
        </view>
        
        <view class="form-container">
          <!-- 喜欢的游戏类型 -->
          <view class="form-item">
            <view class="form-label">
              <text class="label-icon">🎮</text>
              <text class="label-text">喜欢的游戏类型</text>
            </view>
            <view class="game-types">
              <view 
                v-for="type in gameTypes" 
                :key="type.id"
                class="game-type-item" 
                :class="{ active: profileForm.favoriteGames.includes(type.id) }"
                @click="toggleGameType(type.id)"
              >
                <text class="game-type-icon">{{ type.icon }}</text>
                <text class="game-type-text">{{ type.name }}</text>
              </view>
            </view>
          </view>
          
          <!-- 游戏水平 -->
          <view class="form-item">
            <view class="form-label">
              <text class="label-icon">🏆</text>
              <text class="label-text">游戏水平</text>
            </view>
            <view class="skill-levels">
              <view 
                v-for="level in skillLevels" 
                :key="level.id"
                class="skill-level-item" 
                :class="{ active: profileForm.skillLevel === level.id }"
                @click="selectSkillLevel(level.id)"
              >
                <text class="skill-level-text">{{ level.name }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 隐私设置 -->
      <view class="form-section">
        <view class="section-title">
          <text class="title-text">隐私设置</text>
          <view class="title-decoration"></view>
        </view>
        
        <view class="form-container">
          <!-- 资料可见性 -->
          <view class="form-item">
            <view class="form-label">
              <text class="label-icon">👁️</text>
              <text class="label-text">资料可见性</text>
            </view>
            <view class="privacy-options">
              <view 
                class="privacy-item" 
                :class="{ active: profileForm.privacy === 'public' }"
                @click="selectPrivacy('public')"
              >
                <text class="privacy-text">公开</text>
              </view>
              <view 
                class="privacy-item" 
                :class="{ active: profileForm.privacy === 'friends' }"
                @click="selectPrivacy('friends')"
              >
                <text class="privacy-text">仅好友</text>
              </view>
              <view 
                class="privacy-item" 
                :class="{ active: profileForm.privacy === 'private' }"
                @click="selectPrivacy('private')"
              >
                <text class="privacy-text">私密</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import authService from '@/services/authService'
import gameService from '@/services/gameService'
import { showToast, showLoading, hideLoading, showModal } from '@/utils/platform'
import { setItem, getItem } from '@/utils/storage'

export default {
  data() {
    return {
      // 表单数据
      profileForm: {
        avatar: '',
        nickname: '',
        gender: 'secret',
        birthday: '',
        signature: '',
        favoriteGames: [],
        skillLevel: 'beginner',
        privacy: 'public'
      },
      
      // 游戏类型选项
      gameTypes: [
        { id: 'draw-guess', name: '你画我猜', icon: '🎨' },
        { id: 'puzzle', name: '益智游戏', icon: '🧩' },
        { id: 'action', name: '动作游戏', icon: '⚡' },
        { id: 'strategy', name: '策略游戏', icon: '🎯' },
        { id: 'casual', name: '休闲游戏', icon: '🌸' },
        { id: 'classic', name: '经典游戏', icon: '🎮' }
      ],
      
      // 技能水平选项
      skillLevels: [
        { id: 'beginner', name: '新手' },
        { id: 'intermediate', name: '进阶' },
        { id: 'advanced', name: '高手' },
        { id: 'master', name: '大师' }
      ],
      
      // 日期范围限制
      minDate: '1950-01-01',
      maxDate: this.getCurrentDate()
    }
  },
  
  computed: {
    // 是否可以保存
    canSave() {
      return this.profileForm.nickname.trim() && 
             this.profileForm.birthday &&
             this.profileForm.gender
    },
    
    // 星座信息
    constellationInfo() {
      if (!this.profileForm.birthday) {
        return { icon: '❓', name: '未选择', dateRange: '' }
      }
      
      const date = new Date(this.profileForm.birthday)
      const month = date.getMonth() + 1
      const day = date.getDate()
      
      return this.getConstellation(month, day)
    }
  },
  
  onLoad() {
    this.initProfile()
  },
  
  onShow() {
    // 页面显示时刷新用户数据
    this.refreshProfileData()
  },
  
  methods: {
    // 获取当前日期
    getCurrentDate() {
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    
    // 获取星座信息
    getConstellation(month, day) {
      const constellations = [
        { name: '水瓶座', icon: '♒', dateRange: '1.20-2.18', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
        { name: '双鱼座', icon: '♓', dateRange: '2.19-3.20', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
        { name: '白羊座', icon: '♈', dateRange: '3.21-4.19', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
        { name: '金牛座', icon: '♉', dateRange: '4.20-5.20', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
        { name: '双子座', icon: '♊', dateRange: '5.21-6.21', startMonth: 5, startDay: 21, endMonth: 6, endDay: 21 },
        { name: '巨蟹座', icon: '♋', dateRange: '6.22-7.22', startMonth: 6, startDay: 22, endMonth: 7, endDay: 22 },
        { name: '狮子座', icon: '♌', dateRange: '7.23-8.22', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
        { name: '处女座', icon: '♍', dateRange: '8.23-9.22', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
        { name: '天秤座', icon: '♎', dateRange: '9.23-10.23', startMonth: 9, startDay: 23, endMonth: 10, endDay: 23 },
        { name: '天蝎座', icon: '♏', dateRange: '10.24-11.22', startMonth: 10, startDay: 24, endMonth: 11, endDay: 22 },
        { name: '射手座', icon: '♐', dateRange: '11.23-12.21', startMonth: 11, startDay: 23, endMonth: 12, endDay: 21 },
        { name: '摩羯座', icon: '♑', dateRange: '12.22-1.19', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 }
      ]
      
      for (let constellation of constellations) {
        if (constellation.startMonth === constellation.endMonth) {
          if (month === constellation.startMonth && 
              day >= constellation.startDay && 
              day <= constellation.endDay) {
            return constellation
          }
        } else if (constellation.startMonth < constellation.endMonth) {
          if ((month === constellation.startMonth && day >= constellation.startDay) ||
              (month === constellation.endMonth && day <= constellation.endDay) ||
              (month > constellation.startMonth && month < constellation.endMonth)) {
            return constellation
          }
        } else {
          // 跨年的情况（摩羯座）
          if ((month === constellation.startMonth && day >= constellation.startDay) ||
              (month === constellation.endMonth && day <= constellation.endDay) ||
              month > constellation.startMonth || month < constellation.endMonth) {
            return constellation
          }
        }
      }
      
      return { icon: '❓', name: '未知', dateRange: '' }
    },
    
    // 初始化个人资料
    async initProfile() {
      try {
        showLoading('加载资料...')
        
        // 获取当前用户信息
        const result = await authService.getCurrentUser()
        
        if (result.success) {
          const user = result.user
          
          // 填充表单数据
          this.profileForm = {
            avatar: user.avatar || '',
            nickname: user.nickname || '',
            gender: user.gender || 'secret',
            birthday: user.birthday || '',
            signature: user.signature || '',
            favoriteGames: user.preferences?.favoriteGames || [],
            skillLevel: user.preferences?.skill_level || 'beginner',
            privacy: user.preferences?.privacy || 'public'
          }
        } else {
          // 降级到本地存储
          this.loadLocalProfile()
        }
        
      } catch (error) {
        console.error('初始化个人资料失败:', error)
        this.loadLocalProfile()
      } finally {
        hideLoading()
      }
    },

    // 刷新个人资料数据
    async refreshProfileData() {
      try {
        const result = await authService.refreshUserInfo()
        if (result.success) {
          const user = result.user
          
          // 更新表单数据（不覆盖用户修改）
          if (!this.profileForm.avatar) this.profileForm.avatar = user.avatar || ''
          if (!this.profileForm.nickname) this.profileForm.nickname = user.nickname || ''
          if (!this.profileForm.gender) this.profileForm.gender = user.gender || 'secret'
          if (!this.profileForm.birthday) this.profileForm.birthday = user.birthday || ''
          if (!this.profileForm.signature) this.profileForm.signature = user.signature || ''
          if (this.profileForm.favoriteGames.length === 0) {
            this.profileForm.favoriteGames = user.preferences?.favoriteGames || []
          }
          if (!this.profileForm.skillLevel) this.profileForm.skillLevel = user.preferences?.skill_level || 'beginner'
          if (!this.profileForm.privacy) this.profileForm.privacy = user.preferences?.privacy || 'public'
        }
      } catch (error) {
        console.error('刷新个人资料失败:', error)
      }
    },

    // 加载本地个人资料
    loadLocalProfile() {
      const savedProfile = getItem('userProfile')
      if (savedProfile) {
        this.profileForm = { ...this.profileForm, ...savedProfile }
      }
      
      // 同时加载用户信息
      const userInfo = getItem('userInfo')
      if (userInfo) {
        this.profileForm.avatar = userInfo.avatar || this.profileForm.avatar
        this.profileForm.nickname = userInfo.nickname || this.profileForm.nickname
      }
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },
    
    // 更换头像
    changeAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.profileForm.avatar = res.tempFilePaths[0]
        },
        fail: () => {
          uni.showToast({
            title: '选择头像失败',
            icon: 'none'
          })
        }
      })
    },
    
    // 选择性别
    selectGender(gender) {
      this.profileForm.gender = gender
    },
    
    // 生日选择
    onBirthdayChange(e) {
      this.profileForm.birthday = e.detail.value
    },
    
    // 切换游戏类型
    toggleGameType(gameId) {
      const index = this.profileForm.favoriteGames.indexOf(gameId)
      if (index > -1) {
        this.profileForm.favoriteGames.splice(index, 1)
      } else {
        if (this.profileForm.favoriteGames.length < 3) {
          this.profileForm.favoriteGames.push(gameId)
        } else {
          uni.showToast({
            title: '最多选择3个游戏类型',
            icon: 'none'
          })
        }
      }
    },
    
    // 选择技能水平
    selectSkillLevel(level) {
      this.profileForm.skillLevel = level
    },
    
    // 选择隐私设置
    selectPrivacy(privacy) {
      this.profileForm.privacy = privacy
    },
    
    // 保存个人资料
    async saveProfile() {
      if (!this.canSave) {
        showToast('请完善基本信息')
        return
      }
      
      showLoading('保存中...')
      
      try {
        // 准备保存数据
        const profileData = {
          nickname: this.profileForm.nickname,
          avatar: this.profileForm.avatar,
          gender: this.profileForm.gender,
          birthday: this.profileForm.birthday,
          signature: this.profileForm.signature,
          preferences: {
            favorite_games: this.profileForm.favoriteGames,
            skill_level: this.profileForm.skillLevel,
            privacy: this.profileForm.privacy,
            notification_enabled: true,
            sound_enabled: true,
            vibration_enabled: true
          }
        }
        
        // 调用API保存
        const result = await authService.updateProfile(profileData)
        
        if (result.success) {
          // 保存到本地存储作为备份
          setItem('userProfile', this.profileForm)
          
          hideLoading()
          showToast('保存成功', 'success')
          
          // 返回上一页
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          hideLoading()
          showToast(result.message || '保存失败，请重试')
        }
        
      } catch (error) {
        hideLoading()
        console.error('保存个人资料失败:', error)
        
        // 网络错误时询问是否保存到本地
        const saveLocal = await showModal(
          '网络错误',
          '无法连接到服务器，是否保存到本地？',
          true
        )
        
        if (saveLocal) {
          setItem('userProfile', this.profileForm)
          showToast('已保存到本地', 'success')
        }
      }
    },

    // 获取游戏统计信息
    async getGameStats() {
      try {
        const result = await gameService.getUserGameStats()
        if (result.success) {
          return result.gameStats || []
        }
      } catch (error) {
        console.error('获取游戏统计失败:', error)
      }
      return []
    },

    // 格式化游戏统计显示
    formatGameStats(stats) {
      const totalGames = stats.reduce((sum, stat) => sum + stat.total_games, 0)
      const totalWins = stats.reduce((sum, stat) => sum + stat.wins, 0)
      const totalScore = stats.reduce((sum, stat) => sum + stat.best_score, 0)
      
      return {
        totalGames,
        totalWins,
        totalScore,
        winRate: totalGames > 0 ? ((totalWins / totalGames) * 100).toFixed(1) : 0
      }
    },

    // 获取技能等级显示名称
    getSkillLevelName(level) {
      return gameService.getSkillLevelName(level)
    },

    // 获取星座详细信息
    getConstellationDetails(month, day) {
      const constellations = [
        { name: '水瓶座', icon: '♒', dateRange: '1.20-2.18', desc: '独立创新' },
        { name: '双鱼座', icon: '♓', dateRange: '2.19-3.20', desc: '浪漫敏感' },
        { name: '白羊座', icon: '♈', dateRange: '3.21-4.19', desc: '热情冲动' },
        { name: '金牛座', icon: '♉', dateRange: '4.20-5.20', desc: '踏实稳重' },
        { name: '双子座', icon: '♊', dateRange: '5.21-6.21', desc: '聪明善变' },
        { name: '巨蟹座', icon: '♋', dateRange: '6.22-7.22', desc: '温柔体贴' },
        { name: '狮子座', icon: '♌', dateRange: '7.23-8.22', desc: '自信阳光' },
        { name: '处女座', icon: '♍', dateRange: '8.23-9.22', desc: '完美主义' },
        { name: '天秤座', icon: '♎', dateRange: '9.23-10.23', desc: '优雅和谐' },
        { name: '天蝎座', icon: '♏', dateRange: '10.24-11.22', desc: '神秘深邃' },
        { name: '射手座', icon: '♐', dateRange: '11.23-12.21', desc: '自由乐观' },
        { name: '摩羯座', icon: '♑', dateRange: '12.22-1.19', desc: '踏实进取' }
      ]
      
      for (let constellation of constellations) {
        if (constellation.startMonth === constellation.endMonth) {
          if (month === constellation.startMonth &&
              day >= constellation.startDay &&
              day <= constellation.endDay) {
            return constellation
          }
        } else if (constellation.startMonth < constellation.endMonth) {
          if ((month === constellation.startMonth && day >= constellation.startDay) ||
              (month === constellation.endMonth && day <= constellation.endDay) ||
              (month > constellation.startMonth && month < constellation.endMonth)) {
            return constellation
          }
        } else {
          // 跨年的情况（摩羯座）
          if ((month === constellation.startMonth && day >= constellation.startDay) ||
              (month === constellation.endMonth && day <= constellation.endDay) ||
              month > constellation.startMonth || month < constellation.endMonth) {
            return constellation
          }
        }
      }
      
      return { name: '未知', icon: '❓', dateRange: '', desc: '' }
    },
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
  width: 100rpx;
  display: flex;
  justify-content: flex-end;
}

.save-btn {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.7);
  padding: 10rpx 20rpx;
  border-radius: 15rpx;
  transition: all 0.3s ease;
}

.save-btn.active {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

/* 头像区域 */
.avatar-section {
  text-align: center;
  margin-bottom: 40rpx;
}

.avatar-container {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  margin: 0 auto 20rpx;
}

.avatar-img {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  border: 6rpx solid rgba(255, 255, 255, 0.3);
}

.avatar-edit {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 50rpx;
  height: 50rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3rpx solid #ffffff;
}

.edit-icon {
  font-size: 24rpx;
}

.avatar-tip {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

/* 表单区域 */
.form-section {
  margin-bottom: 40rpx;
}

.section-title {
  text-align: center;
  margin-bottom: 30rpx;
  position: relative;
}

.title-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #ffffff;
  position: relative;
  z-index: 2;
}

.title-decoration {
  position: absolute;
  bottom: -8rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 80rpx;
  height: 4rpx;
  background: linear-gradient(90deg, #ffd89b 0%, #19547b 100%);
  border-radius: 2rpx;
}

.form-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10rpx);
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 15rpx 40rpx rgba(0, 0, 0, 0.2);
}

/* 表单项 */
.form-item {
  margin-bottom: 40rpx;
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-label {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.label-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
}

.label-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

/* 输入框 */
.form-input {
  width: 100%;
  height: 80rpx;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 15rpx;
  padding: 0 25rpx;
  font-size: 28rpx;
  color: #333;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
}

.form-input:focus {
  border-color: #667eea;
  background: #ffffff;
  box-shadow: 0 0 20rpx rgba(102, 126, 234, 0.2);
}

/* 文本域 */
.form-textarea {
  width: 100%;
  min-height: 120rpx;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 15rpx;
  padding: 20rpx 25rpx;
  font-size: 28rpx;
  color: #333;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
  resize: none;
}

.form-textarea:focus {
  border-color: #667eea;
  background: #ffffff;
  box-shadow: 0 0 20rpx rgba(102, 126, 234, 0.2);
}

.char-count {
  display: block;
  text-align: right;
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
}

/* 性别选择 */
.gender-options {
  display: flex;
  gap: 20rpx;
}

.gender-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 15rpx;
  transition: all 0.3s ease;
  border: 2rpx solid transparent;
}

.gender-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
}

.gender-item.active .gender-icon,
.gender-item.active .gender-text {
  color: #ffffff;
}

.gender-icon {
  font-size: 36rpx;
  margin-bottom: 10rpx;
}

.gender-text {
  font-size: 24rpx;
  color: #666;
}

/* 日期选择器 */
.picker-input {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 80rpx;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 15rpx;
  padding: 0 25rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
}

.picker-input:active {
  border-color: #667eea;
  background: #ffffff;
  box-shadow: 0 0 20rpx rgba(102, 126, 234, 0.2);
}

.picker-text {
  font-size: 28rpx;
  color: #333;
}

.picker-text.placeholder {
  color: #999;
}

.picker-arrow {
  font-size: 20rpx;
  color: #999;
}

/* 星座显示 */
.constellation-display {
  display: flex;
  align-items: center;
  gap: 15rpx;
  padding: 20rpx 25rpx;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 15rpx;
  border: 2rpx solid rgba(102, 126, 234, 0.3);
}

.constellation-icon {
  font-size: 36rpx;
}

.constellation-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #667eea;
}

.constellation-date {
  font-size: 24rpx;
  color: #999;
}

/* 游戏类型选择 */
.game-types {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
}

.game-type-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 15rpx 20rpx;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 20rpx;
  transition: all 0.3s ease;
  border: 2rpx solid transparent;
}

.game-type-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
}

.game-type-item.active .game-type-icon,
.game-type-item.active .game-type-text {
  color: #ffffff;
}

.game-type-icon {
  font-size: 24rpx;
}

.game-type-text {
  font-size: 24rpx;
  color: #666;
}

/* 技能水平选择 */
.skill-levels {
  display: flex;
  gap: 15rpx;
}

.skill-level-item {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 15rpx;
  transition: all 0.3s ease;
  border: 2rpx solid transparent;
}

.skill-level-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
}

.skill-level-item.active .skill-level-text {
  color: #ffffff;
}

.skill-level-text {
  font-size: 24rpx;
  color: #666;
}

/* 隐私设置 */
.privacy-options {
  display: flex;
  gap: 15rpx;
}

.privacy-item {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 15rpx;
  transition: all 0.3s ease;
  border: 2rpx solid transparent;
}

.privacy-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
}

.privacy-item.active .privacy-text {
  color: #ffffff;
}

.privacy-text {
  font-size: 24rpx;
  color: #666;
}

/* 响应式设计 */
@media screen and (max-width: 400px) {
  .main-content {
    padding: 0 20rpx;
  }
  
  .form-container {
    padding: 25rpx;
  }
  
  .gender-options {
    gap: 15rpx;
  }
  
  .game-types {
    gap: 10rpx;
  }
}
</style>