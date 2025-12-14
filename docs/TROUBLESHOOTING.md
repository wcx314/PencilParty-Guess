# 🔧 故障排除指南

## 📋 目录

- [环境问题](#环境问题)
- [数据库问题](#数据库问题)
- [后端服务问题](#后端服务问题)
- [前端连接问题](#前端连接问题)
- [认证问题](#认证问题)
- [游戏功能问题](#游戏功能问题)
- [跨平台问题](#跨平台问题)
- [性能问题](#性能问题)
- [部署问题](#部署问题)

## 🌍 环境问题

### Node.js 版本不兼容

**问题描述**: 
```
Error: The module was compiled against a different Node.js version
```

**解决方案**:
```bash
# 检查 Node.js 版本
node --version

# 需要 Node.js >= 16.0.0
# 如果版本过低，升级 Node.js
# 使用 nvm 管理版本
nvm install 18
nvm use 18

# 重新安装依赖
rm -rf node_modules package-lock.json
npm install
```

### npm 权限问题

**问题描述**:
```
Error: EACCES: permission denied
```

**解决方案**:
```bash
# 方法1: 修改 npm 权限
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH

# 方法2: 使用 npx
npx npm install

# 方法3: 修改文件夹权限（不推荐）
sudo chown -R $(whoami) ~/.npm
```

### 端口被占用

**问题描述**:
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决方案**:
```bash
# 查看端口占用
netstat -tulpn | grep :3000
# 或
lsof -i :3000

# 杀死占用进程
kill -9 <PID>

# 或修改端口
# 编辑 .env 文件
PORT=3001
```

## 🗄️ 数据库问题

### 数据库连接失败

**问题描述**:
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**诊断步骤**:
```bash
# 1. 检查 MySQL 服务状态
sudo systemctl status mysql
# 或
brew services list | grep mysql

# 2. 启动 MySQL 服务
sudo systemctl start mysql
# 或
brew services start mysql

# 3. 检查端口监听
netstat -tulpn | grep :3306

# 4. 测试连接
mysql -u root -p -h localhost
```

**配置检查**:
```bash
# 检查 .env 配置
cat server/.env | grep DB_

# 确保配置正确
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=pencilparty
```

### 数据库不存在

**问题描述**:
```
Error: ER_BAD_DB_ERROR: database 'pencilparty' doesn't exist
```

**解决方案**:
```bash
# 登录 MySQL
mysql -u root -p

# 创建数据库
CREATE DATABASE pencilparty CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 导入表结构
mysql -u root -p pencilparty < server/database/schema.sql

# 验证表创建
mysql -u root -p pencilparty -e "SHOW TABLES;"
```

### 权限问题

**问题描述**:
```
Error: ER_ACCESS_DENIED_ERROR: Access denied for user
```

**解决方案**:
```bash
# 方法1: 使用 root 用户
DB_USER=root
DB_PASSWORD=your_root_password

# 方法2: 创建专用用户
mysql -u root -p
CREATE USER 'pencilparty'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON pencilparty.* TO 'pencilparty'@'localhost';
FLUSH PRIVILEGES;
```

### 字符编码问题

**问题描述**: 中文数据乱码

**解决方案**:
```sql
-- 检查数据库字符集
SHOW VARIABLES LIKE 'character_set%';

-- 修改数据库字符集
ALTER DATABASE pencilparty CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 修改表字符集
ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 🖥️ 后端服务问题

### 依赖安装失败

**问题描述**:
```
npm ERR! code ERESOLVE
npm ERR! peer dep conflicts
```

**解决方案**:
```bash
# 清理缓存
npm cache clean --force

# 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json

# 使用 --legacy-peer-deps
npm install --legacy-peer-deps

# 或使用 yarn
yarn install
```

### 模块找不到

**问题描述**:
```
Error: Cannot find module 'express'
```

**解决方案**:
```bash
# 检查 node_modules 是否存在
ls -la node_modules

# 重新安装依赖
npm install

# 检查 package.json
cat package.json | grep express

# 手动安装缺失模块
npm install express
```

### 环境变量未加载

**问题描述**:
```
Error: DB_PASSWORD is not defined
```

**解决方案**:
```bash
# 检查 .env 文件
ls -la .env

# 如果不存在，复制模板
cp .env.example .env

# 编辑 .env 文件
nano .env

# 确保没有语法错误
# 每行格式：KEY=VALUE
# 不要有空格或特殊字符
```

### CORS 错误

**问题描述**:
```
Access to fetch at 'http://localhost:3000' has been blocked by CORS policy
```

**解决方案**:
```javascript
// 检查 server/app.js 中的 CORS 配置
const corsOptions = {
  origin: [
    'http://localhost:8080',
    'http://localhost:3000',
    'http://127.0.0.1:8080'
  ],
  credentials: true
}

// 或临时允许所有来源（仅开发环境）
const corsOptions = {
  origin: '*',
  credentials: true
}
```

## 🌐 前端连接问题

### API 地址配置错误

**问题描述**: 前端无法连接后端

**诊断步骤**:
```javascript
// 检查 uni-preset-vue-vite/src/config/api.js
console.log('API Base URL:', apiConfig.baseURL)

// 检查当前环境
console.log('Current Environment:', process.env.NODE_ENV)
```

**解决方案**:
```javascript
// 确保配置正确
const apiConfig = {
  development: {
    baseURL: 'http://localhost:3000/api', // 确保端口正确
    timeout: 10000
  }
}
```

### 网络请求超时

**问题描述**: 请求长时间无响应

**解决方案**:
```javascript
// 增加超时时间
const apiConfig = {
  timeout: 30000 // 30秒
}

// 或添加重试机制
const retryConfig = {
  retries: 3,
  retryDelay: 1000
}
```

### 小程序请求失败

**问题描述**: 微信小程序请求被阻止

**解决方案**:
```javascript
// 1. 在微信开发者工具中勾选"不校验合法域名"
// 2. 配置 request 合法域名
// 在 mp-weixin 的 manifest.json 中添加：
{
  "mp-weixin": {
    "appid": "your-appid",
    "setting": {
      "urlCheck": false
    }
  }
}

// 3. 申请正式域名白名单
// 登录微信公众平台 -> 开发 -> 开发管理 -> 开发设置
```

## 🔐 认证问题

### JWT Token 无效

**问题描述**:
```
Error: JsonWebTokenError: invalid signature
```

**解决方案**:
```bash
# 检查 JWT_SECRET 配置
grep JWT_SECRET server/.env

# 确保 JWT_SECRET 足够复杂
JWT_SECRET=your_super_long_and_random_secret_key_at_least_32_characters

# 重新生成 Token
# 清除本地存储的 token
localStorage.removeItem('access_token')
localStorage.removeItem('refresh_token')
```

### Token 过期

**问题描述**: Token 频繁过期

**解决方案**:
```javascript
// 检查过期时间配置
// server/.env
JWT_EXPIRES_IN=7d

// 前端自动刷新配置
// src/config/index.js
const tokenConfig = {
  refreshThreshold: 0.8, // 80% 时间时刷新
  maxRetries: 3
}
```

### 登录失败

**问题描述**: 用户登录接口返回错误

**诊断步骤**:
```bash
# 测试登录接口
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"openid":"test123","nickname":"测试用户"}'

# 检查数据库用户表
mysql -u root -p pencilparty -e "SELECT * FROM users LIMIT 5;"
```

## 🎮 游戏功能问题

### 游戏记录保存失败

**问题描述**: 游戏结束时数据保存失败

**解决方案**:
```bash
# 检查数据库表结构
mysql -u root -p pencilparty -e "DESCRIBE game_records;"

# 检查外键约束
mysql -u root -p pencilparty -e "SHOW CREATE TABLE game_records;"

# 检查数据格式
# 确保请求参数符合接口要求
```

### 排行榜数据异常

**问题描述**: 排行榜显示不正确

**解决方案**:
```bash
# 检查排行榜查询
mysql -u root -p pencilparty -e "
SELECT 
  user_id,
  COUNT(*) as total_games,
  AVG(score) as avg_score,
  MAX(score) as best_score
FROM game_records 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)
GROUP BY user_id
ORDER BY avg_score DESC
LIMIT 10;
"
```

## 📱 跨平台问题

### 小程序兼容性问题

**问题描述**: 某些功能在小程序中不工作

**解决方案**:
```javascript
// 检查平台兼容性
import { getPlatform } from '@/utils/platform'

const platform = getPlatform()
console.log('Current platform:', platform)

// 使用条件编译
// #ifdef MP-WEIXIN
wx.login({
  success: (res) => {
    console.log('微信登录成功', res.code)
  }
})
// #endif

// #ifdef H5
// H5 特定逻辑
// #endif
```

### App 权限问题

**问题描述**: App 无法访问相机、定位等功能

**解决方案**:
```javascript
// 检查权限状态
// #ifdef APP-PLUS
const checkPermission = (permission) => {
  return new Promise((resolve) => {
    plus.android.requestPermissions(
      [permission],
      (result) => {
        resolve(result.granted)
      },
      (error) => {
        console.error('权限请求失败', error)
        resolve(false)
      }
    )
  })
}

// 请求相机权限
const hasCameraPermission = await checkPermission('android.permission.CAMERA')
if (!hasCameraPermission) {
  uni.showToast({
    title: '需要相机权限',
    icon: 'none'
  })
}
// #endif
```

## ⚡ 性能问题

### 数据库查询慢

**问题描述**: 接口响应时间过长

**解决方案**:
```sql
-- 添加索引
CREATE INDEX idx_game_records_user_id ON game_records(user_id);
CREATE INDEX idx_game_records_game_type ON game_records(game_type);
CREATE INDEX idx_game_records_created_at ON game_records(created_at);

-- 分析查询性能
EXPLAIN SELECT * FROM game_records WHERE user_id = 1 ORDER BY created_at DESC LIMIT 20;

-- 优化查询语句
SELECT gr.*, u.nickname 
FROM game_records gr 
LEFT JOIN users u ON gr.user_id = u.id 
WHERE gr.user_id = 1 
ORDER BY gr.created_at DESC 
LIMIT 20;
```

### 前端加载慢

**问题描述**: 页面加载时间长

**解决方案**:
```javascript
// 启用代码分割
const routes = [
  {
    path: '/game',
    component: () => import('@/pages/game/index.vue')
  }
]

// 图片懒加载
<image 
  :src="imageSrc" 
  lazy-load 
  mode="aspectFill"
/>

// 数据缓存
const cacheData = async (key, fetcher, ttl = 300000) => {
  const cached = uni.getStorageSync(key)
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data
  }
  
  const data = await fetcher()
  uni.setStorageSync(key, {
    data,
    timestamp: Date.now()
  })
  return data
}
```

## 🚀 部署问题

### PM2 部署失败

**问题描述**: PM2 启动服务失败

**解决方案**:
```bash
# 检查 PM2 状态
pm2 status
pm2 logs pencilparty-server

# 重启服务
pm2 restart pencilparty-server

# 检查配置文件
pm2 ecosystem.config.js

module.exports = {
  apps: [{
    name: 'pencilparty-server',
    script: 'app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

### Nginx 配置问题

**问题描述**: Nginx 代理失败

**解决方案**:
```bash
# 测试 Nginx 配置
nginx -t

# 重新加载配置
nginx -s reload

# 检查错误日志
tail -f /var/log/nginx/error.log

# 检查代理配置
location /api/ {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### Docker 部署问题

**问题描述**: Docker 容器启动失败

**解决方案**:
```bash
# 检查容器日志
docker logs pencilparty-server

# 检查容器状态
docker ps -a

# 重新构建镜像
docker build -t pencilparty-server .
docker run -d -p 3000:3000 --name pencilparty-server pencilparty-server

# 检查 Dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔍 调试技巧

### 后端调试

```bash
# 启用调试模式
DEBUG=* npm run dev

# 使用 nodemon
npm install -g nodemon
nodemon --inspect app.js

# 查看 SQL 查询
# 在 database.js 中添加日志
connection.query(sql, params, (error, results) => {
  console.log('SQL:', sql)
  console.log('Params:', params)
  console.log('Results:', results)
})
```

### 前端调试

```javascript
// 启用详细日志
// 在 main.js 中
Vue.config.debug = true
Vue.config.devtools = true

// 网络请求调试
// 在 request.js 中添加拦截器
request.interceptors.request.use(config => {
  console.log('Request:', config)
  return config
})

request.interceptors.response.use(response => {
  console.log('Response:', response)
  return response
})
```

### 数据库调试

```sql
-- 启用慢查询日志
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;

-- 查看连接数
SHOW STATUS LIKE 'Threads_connected';

-- 查看进程列表
SHOW FULL PROCESSLIST;
```

## 📞 获取帮助

如果以上解决方案都无法解决您的问题：

1. **收集信息**:
   - 错误信息和堆栈跟踪
   - 操作系统、Node.js、MySQL 版本
   - 相关配置文件内容

2. **查看日志**:
   - 后端日志: `logs/app.log`
   - 错误日志: `logs/error.log`
   - PM2 日志: `pm2 logs`

3. **提交 Issue**:
   - 在 GitHub 仓库提交 Issue
   - 包含详细的错误信息和复现步骤
   - 提供环境信息和配置

4. **联系团队**:
   - 技术支持邮箱
   - 开发者交流群

---

**希望这个故障排除指南能帮助您快速解决问题！🎉**