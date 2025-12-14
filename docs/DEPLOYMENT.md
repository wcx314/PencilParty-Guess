# 🚀 部署指南

## 📋 目录

- [环境准备](#环境准备)
- [后端部署](#后端部署)
- [前端部署](#前端部署)
- [数据库部署](#数据库部署)
- [反向代理配置](#反向代理配置)
- [SSL证书配置](#ssl证书配置)
- [监控和日志](#监控和日志)
- [性能优化](#性能优化)
- [安全配置](#安全配置)
- [维护和更新](#维护和更新)

## 🌍 环境准备

### 系统要求

**服务器配置**:
- CPU: 2核心以上
- 内存: 4GB 以上
- 存储: 50GB 以上 SSD
- 网络: 10Mbps 以上带宽

**软件环境**:
- 操作系统: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- Node.js: 18.x LTS
- MySQL: 8.0+
- Nginx: 1.18+
- PM2: 5.x+

### 基础环境安装

#### Ubuntu/Debian
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 MySQL
sudo apt install mysql-server -y

# 安装 Nginx
sudo apt install nginx -y

# 安装 PM2
sudo npm install -g pm2
```

#### CentOS/RHEL
```bash
# 更新系统
sudo yum update -y

# 安装 Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 安装 MySQL
sudo yum install mysql-server -y
sudo systemctl start mysqld
sudo systemctl enable mysqld

# 安装 Nginx
sudo yum install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx

# 安装 PM2
sudo npm install -g pm2
```

## 🗄️ 数据库部署

### MySQL 安全配置

```bash
# 运行安全配置脚本
sudo mysql_secure_installation

# 创建应用数据库和用户
sudo mysql -u root -p
```

```sql
-- 创建数据库
CREATE DATABASE pencilparty CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建专用用户
CREATE USER 'pencilparty'@'localhost' IDENTIFIED BY 'strong_password_here';

-- 授权
GRANT ALL PRIVILEGES ON pencilparty.* TO 'pencilparty'@'localhost';
FLUSH PRIVILEGES;

-- 退出
EXIT;
```

### 导入数据库结构

```bash
# 上传项目文件到服务器
git clone <repository-url> /opt/pencilparty
cd /opt/pencilparty

# 导入数据库结构
mysql -u pencilparty -p pencilparty < server/database/schema.sql
```

### MySQL 性能优化

编辑 `/etc/mysql/mysql.conf.d/mysqld.cnf`:

```ini
[mysqld]
# 基础配置
bind-address = 127.0.0.1
port = 3306
max_connections = 200
connect_timeout = 10

# 内存配置
innodb_buffer_pool_size = 2G
innodb_log_file_size = 256M
innodb_log_buffer_size = 16M
key_buffer_size = 32M

# 查询缓存
query_cache_type = 1
query_cache_size = 64M

# 字符集
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

# 日志配置
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2
```

重启 MySQL:
```bash
sudo systemctl restart mysql
```

## 🖥️ 后端部署

### 代码部署

```bash
# 创建应用目录
sudo mkdir -p /opt/pencilparty/server
cd /opt/pencilparty

# 克隆代码
git clone <repository-url> .

# 设置权限
sudo chown -R $USER:$USER /opt/pencilparty
chmod -R 755 /opt/pencilparty
```

### 安装依赖

```bash
cd /opt/pencilparty/server
npm ci --only=production
```

### 环境配置

```bash
# 复制环境配置
cp .env.example .env

# 编辑生产环境配置
nano .env
```

生产环境配置示例:
```env
# 服务器配置
NODE_ENV=production
PORT=3000

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=pencilparty
DB_PASSWORD=strong_password_here
DB_NAME=pencilparty

# JWT配置
JWT_SECRET=your_super_long_and_random_secret_key_minimum_32_characters
JWT_EXPIRES_IN=7d

# CORS配置
CORS_ORIGIN=https://your-domain.com

# 日志配置
LOG_LEVEL=info
LOG_FILE=/var/log/pencilparty/app.log
```

### PM2 配置

创建 `/opt/pencilparty/ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'pencilparty-server',
    script: 'app.js',
    cwd: '/opt/pencilparty/server',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pencilparty/error.log',
    out_file: '/var/log/pencilparty/out.log',
    log_file: '/var/log/pencilparty/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
}
```

### 创建日志目录

```bash
sudo mkdir -p /var/log/pencilparty
sudo chown -R $USER:$USER /var/log/pencilparty
```

### 启动服务

```bash
# 启动应用
pm2 start ecosystem.config.js

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```

### 验证服务

```bash
# 检查服务状态
pm2 status
pm2 logs pencilparty-server

# 测试 API
curl http://localhost:3000/api/health
```

## 🌐 前端部署

### 构建 H5 版本

```bash
cd /opt/pencilparty/uni-preset-vue-vite

# 安装依赖
npm ci

# 配置生产环境 API 地址
# 编辑 src/config/api.js
# 确保 baseURL 指向生产域名

# 构建生产版本
npm run build:h5
```

### 部署到 Nginx

```bash
# 创建 web 目录
sudo mkdir -p /var/www/pencilparty
sudo cp -r dist/* /var/www/pencilparty/
sudo chown -R www-data:www-data /var/www/pencilparty
sudo chmod -R 755 /var/www/pencilparty
```

### 小程序部署

```bash
# 构建微信小程序
npm run build:mp-weixin

# 构建产物在 dist/dev/mp-weixin 目录
# 使用微信开发者工具上传此目录
```

### App 打包

```bash
# 构建 App 版本
npm run build:app-plus

# 使用 HBuilderX 进行云打包或本地打包
# 下载 dist 目录导入 HBuilderX
```

## 🔄 反向代理配置

### Nginx 基础配置

创建 `/etc/nginx/sites-available/pencilparty`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # 前端静态文件
    location / {
        root /var/www/pencilparty;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # 缓存配置
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API 代理
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

### 启用站点

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/pencilparty /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

## 🔒 SSL 证书配置

### 使用 Let's Encrypt

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 自动续期
sudo crontab -e
# 添加以下行
0 12 * * * /usr/bin/certbot renew --quiet
```

### 手动配置 SSL

如果已有证书，编辑 Nginx 配置:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL 证书
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=31536000" always;
    
    # 其他配置...
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## 📊 监控和日志

### 系统监控

安装监控工具:
```bash
# 安装 htop
sudo apt install htop -y

# 安装 iotop
sudo apt install iotop -y

# 安装 netdata (可选)
bash <(curl -Ss https://my-netdata.io/kickstart.sh)
```

### 日志配置

#### 应用日志轮转

创建 `/etc/logrotate.d/pencilparty`:

```
/var/log/pencilparty/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        pm2 reloadLogs
    endscript
}
```

#### Nginx 日志轮转

编辑 `/etc/logrotate.d/nginx`:

```
/var/log/nginx/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 `cat /var/run/nginx.pid`
        fi
    endscript
}
```

### 健康检查脚本

创建 `/opt/pencilparty/health-check.sh`:

```bash
#!/bin/bash

# 检查后端服务
if ! curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "$(date): Backend service is down, restarting..." >> /var/log/pencilparty/health-check.log
    pm2 restart pencilparty-server
fi

# 检查数据库连接
if ! mysql -u pencilparty -p$DB_PASSWORD -e "SELECT 1" > /dev/null 2>&1; then
    echo "$(date): Database connection failed" >> /var/log/pencilparty/health-check.log
fi

# 检查 Nginx
if ! systemctl is-active --quiet nginx; then
    echo "$(date): Nginx is down, restarting..." >> /var/log/pencilparty/health-check.log
    sudo systemctl restart nginx
fi
```

设置定时任务:
```bash
chmod +x /opt/pencilparty/health-check.sh
crontab -e
# 添加以下行（每5分钟检查一次）
*/5 * * * * /opt/pencilparty/health-check.sh
```

## ⚡ 性能优化

### 数据库优化

```sql
-- 添加索引
CREATE INDEX idx_game_records_user_score ON game_records(user_id, score);
CREATE INDEX idx_game_records_type_date ON game_records(game_type, created_at);
CREATE INDEX idx_users_level_exp ON users(level, experience);

-- 分析表
ANALYZE TABLE users, game_records, leaderboards;

-- 优化表
OPTIMIZE TABLE users, game_records, leaderboards;
```

### Nginx 性能优化

编辑 `/etc/nginx/nginx.conf`:

```nginx
user www-data;
worker_processes auto;
worker_rlimit_nofile 65535;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    # 基础配置
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    
    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # 缓存配置
    open_file_cache max=1000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;
}
```

### PM2 集群优化

更新 `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'pencilparty-server',
    script: 'app.js',
    instances: 'max', // 根据CPU核心数自动设置
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      UV_THREADPOOL_SIZE: 128 // 增加线程池大小
    },
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
}
```

## 🔐 安全配置

### 防火墙配置

```bash
# 安装 UFW
sudo apt install ufw -y

# 默认策略
sudo ufw default deny incoming
sudo ufw default allow outgoing

# 允许 SSH
sudo ufw allow ssh

# 允许 HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# 启用防火墙
sudo ufw enable
```

### 系统安全更新

```bash
# 安装自动更新
sudo apt install unattended-upgrades -y

# 配置自动更新
sudo dpkg-reconfigure -plow unattended-upgrades

# 编辑配置
sudo nano /etc/apt/apt.conf.d/50unattended-upgrades
```

### 应用安全

#### 环境变量安全

```bash
# 设置文件权限
chmod 600 /opt/pencilparty/server/.env
chown $USER:$USER /opt/pencilparty/server/.env
```

#### 数据库安全

```sql
-- 删除测试数据库
DROP DATABASE IF EXISTS test;

-- 删除匿名用户
DELETE FROM mysql.user WHERE User='';

-- 禁用远程 root 登录
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');

-- 刷新权限
FLUSH PRIVILEGES;
```

## 🔄 维护和更新

### 备份策略

#### 数据库备份

创建备份脚本 `/opt/pencilparty/backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/opt/backups/pencilparty"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="pencilparty"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
mysqldump -u pencilparty -p$DB_PASSWORD $DB_NAME | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# 删除7天前的备份
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete

echo "Database backup completed: $BACKUP_DIR/db_backup_$DATE.sql.gz"
```

设置定时备份:
```bash
chmod +x /opt/pencilparty/backup.sh
crontab -e
# 每天凌晨2点备份
0 2 * * * /opt/pencilparty/backup.sh
```

#### 代码备份

```bash
# 创建代码备份
tar -czf /opt/backups/pencilparty/code_backup_$(date +%Y%m%d_%H%M%S).tar.gz /opt/pencilparty
```

### 更新流程

#### 后端更新

```bash
cd /opt/pencilparty

# 拉取最新代码
git pull origin main

# 更新依赖
cd server && npm ci --only=production

# 重启服务
pm2 restart pencilparty-server

# 检查状态
pm2 status
curl http://localhost:3000/api/health
```

#### 前端更新

```bash
cd /opt/pencilparty/uni-preset-vue-vite

# 拉取最新代码
git pull origin main

# 安装依赖
npm ci

# 构建新版本
npm run build:h5

# 部署到 web 目录
sudo cp -r dist/* /var/www/pencilparty/
sudo chown -R www-data:www-data /var/www/pencilparty
```

#### 数据库更新

```bash
# 备份当前数据库
./backup.sh

# 执行数据库迁移
mysql -u pencilparty -p pencilparty < server/database/migrations/update_v1.1.0.sql

# 验证更新
mysql -u pencilparty -p pencilparty -e "SHOW TABLES;"
```

### 回滚策略

#### 快速回滚脚本

创建 `/opt/pencilparty/rollback.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/opt/backups/pencilparty"
LATEST_DB=$(ls -t $BACKUP_DIR/db_backup_*.sql.gz | head -1)
LATEST_CODE=$(ls -t $BACKUP_DIR/code_backup_*.tar.gz | head -1)

echo "Rolling back to latest backup..."

# 回滚数据库
gunzip < $LATEST_DB | mysql -u pencilparty -p pencilparty

# 回滚代码
tar -xzf $LATEST_CODE -C /

# 重启服务
pm2 restart pencilparty-server
sudo systemctl restart nginx

echo "Rollback completed"
```

## 📈 监控指标

### 关键指标

- **系统指标**: CPU、内存、磁盘、网络
- **应用指标**: 响应时间、错误率、并发数
- **数据库指标**: 连接数、查询时间、慢查询
- **业务指标**: 活跃用户、游戏数量、成功率

### 监控工具推荐

- **系统监控**: Prometheus + Grafana
- **日志分析**: ELK Stack (Elasticsearch + Logstash + Kibana)
- **错误追踪**: Sentry
- **性能监控**: New Relic / DataDog

---

**部署完成后，建议定期检查系统状态和更新安全补丁。🎉**