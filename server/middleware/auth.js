const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT认证中间件
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '访问令牌缺失',
        code: 'TOKEN_MISSING'
      });
    }

    // 验证JWT令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 获取用户信息
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在',
        code: 'USER_NOT_FOUND'
      });
    }

    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: '用户账户已被禁用',
        code: 'USER_BANNED'
      });
    }

    // 将用户信息添加到请求对象
    req.user = user;
    req.userId = user.id;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        message: '无效的访问令牌',
        code: 'INVALID_TOKEN'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        success: false,
        message: '访问令牌已过期',
        code: 'TOKEN_EXPIRED'
      });
    } else {
      console.error('认证中间件错误:', error);
      return res.status(500).json({
        success: false,
        message: '服务器内部错误',
        code: 'INTERNAL_ERROR'
      });
    }
  }
};

// 可选认证中间件（用户可能未登录）
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (user && user.status === 'active') {
        req.user = user;
        req.userId = user.id;
      }
    }
    
    next();
  } catch (error) {
    // 可选认证失败时不阻止请求继续
    next();
  }
};

// 生成JWT令牌
const generateToken = (userId, expiresIn = null) => {
  const payload = {
    userId,
    iat: Math.floor(Date.now() / 1000)
  };
  
  const options = {
    expiresIn: expiresIn || process.env.JWT_EXPIRES_IN || '7d'
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET, options);
};

// 验证令牌（不依赖数据库）
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// 刷新令牌
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: '刷新令牌缺失',
        code: 'REFRESH_TOKEN_MISSING'
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在',
        code: 'USER_NOT_FOUND'
      });
    }

    // 生成新的访问令牌
    const newAccessToken = generateToken(user.id, '1h');
    const newRefreshToken = generateToken(user.id, '7d');

    res.json({
      success: true,
      message: '令牌刷新成功',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          nickname: user.nickname,
          avatar: user.avatar,
          level: user.level,
          experience: user.experience,
          coins: user.coins
        }
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        message: '无效的刷新令牌',
        code: 'INVALID_REFRESH_TOKEN'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        success: false,
        message: '刷新令牌已过期',
        code: 'REFRESH_TOKEN_EXPIRED'
      });
    } else {
      console.error('刷新令牌错误:', error);
      return res.status(500).json({
        success: false,
        message: '服务器内部错误',
        code: 'INTERNAL_ERROR'
      });
    }
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
  generateToken,
  verifyToken,
  refreshToken
};