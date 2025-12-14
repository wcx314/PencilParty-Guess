# 🚀 快速开始指南

## 📋 前置要求

- Node.js >= 16.0.0
- MySQL >= 8.0
- npm >= 8.0.0

## ⚡ 5分钟快速部署

### 1️⃣ 克隆项目
```bash
git clone <repository-url>
cd PencilParty-Guess
```

### 2️⃣ 后端部署

```bash
# 进入后端目录
cd server

# 安装依赖
npm install

# 复制环境配置
cp .env.example .env

# 编辑配置文件（设置数据库密码）
# 编辑 .env 文件，修改 DB_PASSWORD=你的密码

# 创建数据库（需要先在MySQL中创建数据库）
mysql -u root -p -e "CREATE DATABASE pencilparty;"

# 导入数据库结构
mysql -u root -p pencilparty < database/schema.sql

# 启动后端服务
npm run dev
```

后端服务将在 `http://localhost:3000` 启动

### 3️⃣ 前端部署

```bash
# 新开一个终端，进入前端目录
cd uni-preset-vue-vite

# 安装依赖
npm install

# 启动开发服务器
npm run dev:h5
```

前端服务将在 `http://localhost:8080` 启动

### 4️⃣ 测试连接

访问 `http://localhost:8080`，查看应用是否正常运行。

## 🔧 环境配置详解

### 后端环境变量 (.env)

```env
# 服务器配置
PORT=3000
NODE_ENV=development

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的MySQL密码
DB_NAME=pencilparty

# JWT配置
JWT_SECRET=your_super_secret_key_here_make_it_long_and_random
JWT_EXPIRES_IN=7d

# CORS配置
CORS_ORIGIN=http://localhost:8080
```

### 前端API配置

编辑 `uni-preset-vue-vite/src/config/api.js`：

```javascript
const apiConfig = {
  // 开发环境
  development: {
    baseURL: 'http://localhost:3000/api',
    timeout: 10000
  },
  // 生产环境
  production: {
    baseURL: 'https://your-domain.com/api',
    timeout: 10000
  }
}
```

## 🎮 功能测试

### 1. 用户注册/登录

```javascript
// 测试登录数据
const testData = {
  openid: 'test_user_123',
  nickname: '测试用户',
  avatar: 'https://example.com/avatar.jpg'
}
```

### 2. 游戏功能

- 开始游戏
- 记录分数
- 查看排行榜
- 个人资料管理

## 📱 多平台构建

### H5版本
```bash
npm run build:h5
# 构建产物在 dist 目录
```

### 微信小程序
```bash
npm run build:mp-weixin
# 构建产物在 dist/dev/mp-weixin 目录
# 使用微信开发者工具打开此目录
```

### App版本
```bash
npm run build:app-plus
# 使用 HBuilderX 进行云打包或本地打包
```

## 🔍 常见问题

### Q: 数据库连接失败
**A:** 检查以下几点：
1. MySQL 服务是否启动
2. 数据库用户名密码是否正确
3. 数据库 `pencilparty` 是否已创建
4. 防火墙是否阻止了连接

### Q: 前端无法连接后端
**A:** 检查以下几点：
1. 后端服务是否在 3000 端口启动
2. 前端 API 配置是否正确
3. CORS 配置是否包含前端域名

### Q: JWT Token 错误
**A:** 检查以下几点：
1. JWT_SECRET 是否设置且足够复杂
2. Token 是否过期
3. 客户端时间是否正确

### Q: 微信小程序请求失败
**A:** 检查以下几点：
1. 在微信开发者工具中勾选"不校验合法域名"
2. 申请小程序的 HTTPS 域名白名单
3. 检查 request 合法域名配置

## 🛠️ 开发调试

### 后端调试
```bash
# 启用调试日志
DEBUG=* npm run dev

# 使用 nodemon 自动重启
npm install -g nodemon
nodemon app.js
```

### 前端调试
```bash
# 启用详细日志
VUE_APP_LOG_LEVEL=debug npm run dev:h5

# 微信小程序调试
# 在微信开发者工具中打开调试面板
```

## 📊 监控和日志

### 查看后端日志
```bash
# 查看实时日志
tail -f logs/app.log

# 查看错误日志
tail -f logs/error.log
```

### 前端调试
```javascript
// 在浏览器控制台查看
console.log('当前用户:', this.$store.state.user)
console.log('API配置:', this.$config.api)
```

## 🚀 生产部署

### 使用 PM2 部署后端
```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start app.js --name "pencilparty-server"

# 查看状态
pm2 status

# 查看日志
pm2 logs pencilparty-server
```

### 使用 Nginx 代理
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # 前端静态文件
    location / {
        root /path/to/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # API 代理
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📚 更多文档

- [完整文档](README.md) - 详细的功能说明和API文档
- [API参考](docs/API.md) - 完整的API接口文档
- [部署指南](docs/DEPLOYMENT.md) - 生产环境部署详细说明
- [故障排除](docs/TROUBLESHOOTING.md) - 常见问题解决方案

## 🆘 获取帮助

如果遇到问题，可以：

1. 查看本文档的常见问题部分
2. 查看 [完整文档](README.md)
3. 在项目中提交 Issue
4. 联系开发团队

---

**祝您使用愉快！🎉**