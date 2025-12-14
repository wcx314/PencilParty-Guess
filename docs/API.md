# 📡 API 接口文档

## 🔐 认证机制

所有需要认证的接口都需要在请求头中包含 JWT Token：

```http
Authorization: Bearer <access_token>
```

## 📋 通用响应格式

### 成功响应
```json
{
  "success": true,
  "message": "操作成功",
  "data": {
    // 具体数据
  }
}
```

### 错误响应
```json
{
  "success": false,
  "message": "错误描述",
  "code": "ERROR_CODE",
  "data": null
}
```

## 👤 认证接口

### 1. 用户登录

**接口地址**: `POST /api/auth/login`

**请求参数**:
```json
{
  "openid": "string",      // 用户唯一标识
  "nickname": "string",     // 用户昵称
  "avatar": "string"        // 头像URL（可选）
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "user": {
      "id": 1,
      "openid": "user123",
      "nickname": "测试用户",
      "avatar": "https://example.com/avatar.jpg",
      "level": 1,
      "experience": 0,
      "coins": 100
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 604800
    }
  }
}
```

### 2. 刷新Token

**接口地址**: `POST /api/auth/refresh`

**请求参数**:
```json
{
  "refreshToken": "string"   // 刷新令牌
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "Token刷新成功",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 604800
  }
}
```

### 3. 获取用户信息

**接口地址**: `GET /api/auth/me`

**请求头**: `Authorization: Bearer <access_token>`

**响应示例**:
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "id": 1,
    "openid": "user123",
    "nickname": "测试用户",
    "avatar": "https://example.com/avatar.jpg",
    "level": 1,
    "experience": 150,
    "coins": 250,
    "totalGames": 10,
    "winRate": 0.7,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. 更新用户资料

**接口地址**: `PUT /api/auth/profile`

**请求头**: `Authorization: Bearer <access_token>`

**请求参数**:
```json
{
  "nickname": "string",     // 昵称（可选）
  "avatar": "string",       // 头像URL（可选）
  "preferences": {          // 用户偏好（可选）
    "theme": "light",
    "language": "zh-CN",
    "notifications": true
  }
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "资料更新成功",
  "data": {
    "id": 1,
    "nickname": "新昵称",
    "avatar": "https://example.com/new-avatar.jpg",
    "preferences": {
      "theme": "light",
      "language": "zh-CN",
      "notifications": true
    }
  }
}
```

### 5. 用户登出

**接口地址**: `POST /api/auth/logout`

**请求头**: `Authorization: Bearer <access_token>`

**响应示例**:
```json
{
  "success": true,
  "message": "登出成功",
  "data": null
}
```

## 🎮 游戏接口

### 1. 获取游戏类型

**接口地址**: `GET /api/games/types`

**响应示例**:
```json
{
  "success": true,
  "message": "获取成功",
  "data": [
    {
      "id": 1,
      "name": "你画我猜",
      "code": "draw-guess",
      "icon": "🎨",
      "description": "一个人画画，其他人猜是什么",
      "isActive": true,
      "playerCount": "2-8",
      "difficulty": "easy"
    },
    {
      "id": 2,
      "name": "谁是卧底",
      "code": "spy-game",
      "icon": "🕵️",
      "description": "找出隐藏在平民中的卧底",
      "isActive": true,
      "playerCount": "3-10",
      "difficulty": "medium"
    }
  ]
}
```

### 2. 获取热门游戏

**接口地址**: `GET /api/games/popular`

**请求参数**:
- `limit` (可选): 返回数量，默认10

**响应示例**:
```json
{
  "success": true,
  "message": "获取成功",
  "data": [
    {
      "gameType": "draw-guess",
      "gameTypeName": "你画我猜",
      "playerCount": 156,
      "rooms": [
        {
          "id": "room123",
          "name": "新手房间",
          "currentPlayers": 3,
          "maxPlayers": 6,
          "status": "waiting"
        }
      ]
    }
  ]
}
```

### 3. 开始游戏

**接口地址**: `POST /api/games/start`

**请求头**: `Authorization: Bearer <access_token>`

**请求参数**:
```json
{
  "gameType": "string",      // 游戏类型代码
  "roomId": "string",        // 房间ID（可选）
  "settings": {              // 游戏设置（可选）
    "rounds": 5,
    "timeLimit": 60
  }
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "游戏开始",
  "data": {
    "gameId": "game123",
    "gameType": "draw-guess",
    "roomId": "room123",
    "playerId": "player456",
    "status": "playing",
    "startTime": "2024-01-01T12:00:00.000Z",
    "settings": {
      "rounds": 5,
      "timeLimit": 60
    }
  }
}
```

### 4. 结束游戏

**接口地址**: `POST /api/games/finish`

**请求头**: `Authorization: Bearer <access_token>`

**请求参数**:
```json
{
  "gameId": "string",        // 游戏ID
  "score": "number",         // 得分
  "result": "string",        // 游戏结果：win/lose/draw
  "duration": "number",      // 游戏时长（秒）
  "details": {               // 详细数据（可选）
    "correctAnswers": 8,
    "totalQuestions": 10,
    "accuracy": 0.8
  }
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "游戏记录已保存",
  "data": {
    "recordId": 789,
    "gameId": "game123",
    "userId": 1,
    "score": 85,
    "result": "win",
    "experience": 25,
    "coins": 10,
    "newLevel": false
  }
}
```

### 5. 获取游戏记录

**接口地址**: `GET /api/games/records`

**请求头**: `Authorization: Bearer <access_token>`

**请求参数**:
- `gameType` (可选): 游戏类型
- `limit` (可选): 返回数量，默认20
- `offset` (可选): 偏移量，默认0

**响应示例**:
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "records": [
      {
        "id": 789,
        "gameType": "draw-guess",
        "gameTypeName": "你画我猜",
        "score": 85,
        "result": "win",
        "duration": 300,
        "createdAt": "2024-01-01T12:00:00.000Z",
        "details": {
          "correctAnswers": 8,
          "totalQuestions": 10,
          "accuracy": 0.8
        }
      }
    ],
    "pagination": {
      "total": 50,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

### 6. 获取排行榜

**接口地址**: `GET /api/games/leaderboard`

**请求参数**:
- `gameType` (可选): 游戏类型，默认全部
- `rankType` (可选): 排行类型：score/winRate/totalGames，默认score
- `period` (可选): 时间范围：daily/weekly/monthly/all，默认all
- `limit` (可选): 返回数量，默认50

**响应示例**:
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "rankings": [
      {
        "rank": 1,
        "user": {
          "id": 1,
          "nickname": "游戏达人",
          "avatar": "https://example.com/avatar.jpg",
          "level": 15
        },
        "score": 1250,
        "winRate": 0.85,
        "totalGames": 156
      }
    ],
    "currentUserRank": {
      "rank": 25,
      "score": 450,
      "winRate": 0.65,
      "totalGames": 45
    },
    "period": "weekly",
    "gameType": "draw-guess"
  }
}
```

### 7. 获取游戏统计

**接口地址**: `GET /api/games/stats`

**请求头**: `Authorization: Bearer <access_token>`

**响应示例**:
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "totalGames": 156,
    "totalWins": 98,
    "winRate": 0.63,
    "totalScore": 12450,
    "averageScore": 79.8,
    "bestScore": 150,
    "totalTime": 12450,
    "averageTime": 79.8,
    "favoriteGameType": "draw-guess",
    "achievements": [
      {
        "id": 1,
        "name": "初学者",
        "description": "完成第一场游戏",
        "icon": "🎮",
        "unlockedAt": "2024-01-01T12:00:00.000Z"
      }
    ],
    "recentActivity": [
      {
        "type": "game",
        "action": "win",
        "gameType": "draw-guess",
        "score": 85,
        "createdAt": "2024-01-01T12:00:00.000Z"
      }
    ]
  }
}
```

## 🤝 好友接口

### 1. 获取好友列表

**接口地址**: `GET /api/friends`

**请求头**: `Authorization: Bearer <access_token>`

**响应示例**:
```json
{
  "success": true,
  "message": "获取成功",
  "data": [
    {
      "id": 2,
      "nickname": "好友A",
      "avatar": "https://example.com/avatar2.jpg",
      "level": 8,
      "status": "online",
      "lastSeen": "2024-01-01T12:00:00.000Z",
      "friendSince": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 2. 搜索好友

**接口地址**: `GET /api/friends/search`

**请求头**: `Authorization: Bearer <access_token>`

**请求参数**:
- `keyword`: 搜索关键词

**响应示例**:
```json
{
  "success": true,
  "message": "搜索成功",
  "data": [
    {
      "id": 3,
      "nickname": "搜索结果",
      "avatar": "https://example.com/avatar3.jpg",
      "level": 5,
      "isFriend": false
    }
  ]
}
```

## 🔔 系统接口

### 1. 健康检查

**接口地址**: `GET /api/health`

**响应示例**:
```json
{
  "success": true,
  "message": "服务正常",
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "version": "1.0.0",
    "uptime": 3600,
    "database": "connected"
  }
}
```

### 2. 系统配置

**接口地址**: `GET /api/config`

**响应示例**:
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "app": {
      "name": "PencilParty",
      "version": "1.0.0",
      "minClientVersion": "1.0.0"
    },
    "game": {
      "maxRooms": 1000,
      "maxPlayersPerRoom": 10,
      "gameTimeout": 300
    },
    "features": {
      "enableRanking": true,
      "enableFriends": true,
      "enableChat": true
    }
  }
}
```

## ❌ 错误代码

| 错误代码 | HTTP状态码 | 描述 |
|----------|------------|------|
| AUTH_REQUIRED | 401 | 需要认证 |
| AUTH_INVALID | 401 | 认证无效 |
| AUTH_EXPIRED | 401 | 认证过期 |
| FORBIDDEN | 403 | 权限不足 |
| NOT_FOUND | 404 | 资源不存在 |
| VALIDATION_ERROR | 400 | 参数验证失败 |
| RATE_LIMIT | 429 | 请求频率超限 |
| SERVER_ERROR | 500 | 服务器内部错误 |
| DATABASE_ERROR | 500 | 数据库错误 |
| GAME_NOT_FOUND | 404 | 游戏不存在 |
| GAME_FULL | 400 | 游戏房间已满 |
| GAME_STARTED | 400 | 游戏已开始 |
| USER_NOT_FOUND | 404 | 用户不存在 |
| DUPLICATE_NICKNAME | 400 | 昵称重复 |

## 🔄 状态码说明

### 游戏状态
- `waiting`: 等待开始
- `playing`: 游戏中
- `finished`: 已结束
- `cancelled`: 已取消

### 用户状态
- `online`: 在线
- `offline`: 离线
- `playing`: 游戏中
- `away`: 离开

### 好友关系
- `pending`: 待确认
- `accepted`: 已接受
- `blocked`: 已拉黑

## 📝 请求示例

### 使用 curl

```bash
# 登录
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"openid":"test123","nickname":"测试用户"}'

# 获取用户信息
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <access_token>"

# 开始游戏
curl -X POST http://localhost:3000/api/games/start \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"gameType":"draw-guess"}'
```

### 使用 JavaScript

```javascript
// 登录
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    openid: 'test123',
    nickname: '测试用户'
  })
})

const loginData = await loginResponse.json()
const token = loginData.data.tokens.accessToken

// 获取用户信息
const userResponse = await fetch('/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})

const userData = await userResponse.json()
```

## 🚀 版本更新

### v1.0.0
- 初始版本
- 基础认证功能
- 游戏核心接口
- 排行榜系统

### 即将推出
- 实时聊天接口
- 礼物系统接口
- 主题皮肤接口
- 数据分析接口

---

**更多问题请查看 [故障排除文档](TROUBLESHOOTING.md)**