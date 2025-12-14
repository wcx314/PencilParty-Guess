const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken, refreshToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// 用户登录/注册（通过openid）
router.post('/login', async (req, res) => {
  try {
    const { openid, nickname, avatar, platform = 'unknown' } = req.body;

    if (!openid) {
      return res.status(400).json({
        success: false,
        message: 'OpenID不能为空',
        code: 'OPENID_MISSING'
      });
    }

    // 查找或创建用户
    let user = await User.findByOpenid(openid);
    
    if (!user) {
      // 创建新用户
      const userData = {
        openid,
        nickname: nickname || '玩家昵称',
        avatar: avatar || '/static/logo.png',
        gender: 'secret',
        birthday: null,
        signature: ''
      };
      
      user = await User.create(userData);
      
      if (!user) {
        return res.status(500).json({
          success: false,
          message: '用户创建失败',
          code: 'USER_CREATE_FAILED'
        });
      }
      
      // 记录系统日志
      console.log(`新用户注册: ${user.nickname} (${openid}) - 平台: ${platform}`);
    } else {
      // 更新最后登录时间
      await User.updateLastLogin(user.id);
      
      // 如果提供了新的昵称或头像，可以更新
      if (nickname && nickname !== user.nickname) {
        await User.update(user.id, { nickname });
      }
      if (avatar && avatar !== user.avatar) {
        await User.update(user.id, { avatar });
      }
      
      console.log(`用户登录: ${user.nickname} (${openid}) - 平台: ${platform}`);
    }

    // 生成JWT令牌
    const accessToken = generateToken(user.id, '1h');
    const refreshTokenToken = generateToken(user.id, '7d');

    res.json({
      success: true,
      message: '登录成功',
      data: {
        accessToken,
        refreshToken: refreshTokenToken,
        user: {
          id: user.id,
          nickname: user.nickname,
          avatar: user.avatar,
          gender: user.gender,
          level: user.level,
          experience: user.experience,
          coins: user.coins,
          created_at: user.created_at,
          preferences: user.preferences
        }
      }
    });

  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      code: 'INTERNAL_ERROR'
    });
  }
});

// 刷新令牌
router.post('/refresh', refreshToken);

// 获取当前用户信息
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '访问令牌缺失',
        code: 'TOKEN_MISSING'
      });
    }

    const { verifyToken } = require('../middleware/auth');
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(403).json({
        success: false,
        message: '无效的访问令牌',
        code: 'INVALID_TOKEN'
      });
    }

    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      message: '获取用户信息成功',
      data: {
        user: {
          id: user.id,
          nickname: user.nickname,
          avatar: user.avatar,
          gender: user.gender,
          birthday: user.birthday,
          signature: user.signature,
          level: user.level,
          experience: user.experience,
          coins: user.coins,
          created_at: user.created_at,
          preferences: user.preferences
        }
      }
    });

  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      code: 'INTERNAL_ERROR'
    });
  }
});

// 更新用户资料
router.put('/profile', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '访问令牌缺失',
        code: 'TOKEN_MISSING'
      });
    }

    const { verifyToken } = require('../middleware/auth');
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(403).json({
        success: false,
        message: '无效的访问令牌',
        code: 'INVALID_TOKEN'
      });
    }

    const { nickname, avatar, gender, birthday, signature, preferences } = req.body;
    const userId = decoded.userId;

    // 更新基本信息
    const updateData = {};
    if (nickname !== undefined) updateData.nickname = nickname;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (gender !== undefined) updateData.gender = gender;
    if (birthday !== undefined) updateData.birthday = birthday;
    if (signature !== undefined) updateData.signature = signature;

    if (Object.keys(updateData).length > 0) {
      const updateResult = await User.update(userId, updateData);
      if (!updateResult) {
        return res.status(500).json({
          success: false,
          message: '更新用户信息失败',
          code: 'UPDATE_FAILED'
        });
      }
    }

    // 更新偏好设置
    if (preferences) {
      const prefResult = await User.updatePreferences(userId, preferences);
      if (!prefResult.success) {
        return res.status(500).json({
          success: false,
          message: '更新偏好设置失败',
          code: 'PREFERENCES_UPDATE_FAILED'
        });
      }
    }

    // 获取更新后的用户信息
    const updatedUser = await User.findById(userId);

    res.json({
      success: true,
      message: '更新资料成功',
      data: {
        user: {
          id: updatedUser.id,
          nickname: updatedUser.nickname,
          avatar: updatedUser.avatar,
          gender: updatedUser.gender,
          birthday: updatedUser.birthday,
          signature: updatedUser.signature,
          level: updatedUser.level,
          experience: updatedUser.experience,
          coins: updatedUser.coins,
          preferences: updatedUser.preferences
        }
      }
    });

  } catch (error) {
    console.error('更新用户资料错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      code: 'INTERNAL_ERROR'
    });
  }
});

// 用户登出（可选实现）
router.post('/logout', async (req, res) => {
  try {
    // 这里可以实现令牌黑名单机制
    // 目前只是返回成功响应
    res.json({
      success: true,
      message: '登出成功'
    });
  } catch (error) {
    console.error('登出错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      code: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;