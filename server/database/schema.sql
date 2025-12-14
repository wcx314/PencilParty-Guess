-- PencilParty Game Database Schema
-- 创建数据库
CREATE DATABASE IF NOT EXISTS pencilparty CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pencilparty;

-- 用户表
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    openid VARCHAR(128) UNIQUE,
    nickname VARCHAR(50) NOT NULL DEFAULT '玩家昵称',
    avatar VARCHAR(255) DEFAULT '/static/logo.png',
    gender ENUM('male', 'female', 'secret') DEFAULT 'secret',
    birthday DATE,
    signature VARCHAR(200) DEFAULT '',
    level INT DEFAULT 1 COMMENT '用户等级',
    experience INT DEFAULT 0 COMMENT '经验值',
    coins INT DEFAULT 0 COMMENT '游戏金币',
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nickname (nickname),
    INDEX idx_openid (openid),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 用户偏好表
CREATE TABLE user_preferences (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    favorite_games JSON DEFAULT '[]' COMMENT '喜欢的游戏类型',
    skill_level ENUM('beginner', 'intermediate', 'advanced', 'master') DEFAULT 'beginner',
    privacy ENUM('public', 'friends', 'private') DEFAULT 'public',
    notification_enabled BOOLEAN DEFAULT TRUE,
    sound_enabled BOOLEAN DEFAULT TRUE,
    vibration_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户偏好表';

-- 游戏类型表
CREATE TABLE game_types (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(50) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    icon VARCHAR(10) DEFAULT '🎮',
    description VARCHAR(200),
    min_players INT DEFAULT 1,
    max_players INT DEFAULT 8,
    avg_duration INT DEFAULT 10 COMMENT '平均游戏时长(分钟)',
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'easy',
    status ENUM('active', 'inactive') DEFAULT 'active',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_status (status),
    INDEX idx_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='游戏类型表';

-- 游戏记录表
CREATE TABLE game_records (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    game_type VARCHAR(50) NOT NULL,
    room_id VARCHAR(36) COMMENT '房间ID，多人游戏时使用',
    score INT DEFAULT 0,
    duration INT DEFAULT 0 COMMENT '游戏时长(秒)',
    result ENUM('win', 'lose', 'draw', 'playing') DEFAULT 'playing',
    accuracy DECIMAL(5,2) DEFAULT 0.00 COMMENT '准确率',
    combo_max INT DEFAULT 0 COMMENT '最大连击数',
    experience_gained INT DEFAULT 0 COMMENT '获得经验值',
    coins_gained INT DEFAULT 0 COMMENT '获得金币',
    details JSON DEFAULT '{}' COMMENT '游戏详情数据',
    started_at TIMESTAMP NULL,
    finished_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_game_type (game_type),
    INDEX idx_result (result),
    INDEX idx_created_at (created_at),
    INDEX idx_score (score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='游戏记录表';

-- 排行榜表
CREATE TABLE leaderboards (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    game_type VARCHAR(50) NOT NULL,
    score INT NOT NULL,
    duration INT DEFAULT 0,
    accuracy DECIMAL(5,2) DEFAULT 0.00,
    rank_type ENUM('daily', 'weekly', 'monthly', 'alltime') DEFAULT 'alltime',
    period_date DATE COMMENT '周期日期，用于日/周/月排行',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_game_type (game_type),
    INDEX idx_rank_type (rank_type),
    INDEX idx_period_date (period_date),
    INDEX idx_score (score),
    UNIQUE KEY uk_user_game_type_period (user_id, game_type, rank_type, period_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='排行榜表';

-- 好友关系表
CREATE TABLE friendships (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    friend_id VARCHAR(36) NOT NULL,
    status ENUM('pending', 'accepted', 'blocked') DEFAULT 'pending',
    requested_by VARCHAR(36) NOT NULL COMMENT '发起请求的用户ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_friend (user_id, friend_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='好友关系表';

-- 系统日志表
CREATE TABLE system_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) COMMENT '用户ID，可为空',
    action VARCHAR(50) NOT NULL COMMENT '操作类型',
    resource VARCHAR(100) COMMENT '资源标识',
    details JSON DEFAULT '{}' COMMENT '详细信息',
    ip_address VARCHAR(45) COMMENT 'IP地址',
    user_agent TEXT COMMENT '用户代理',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统日志表';

-- 插入初始游戏类型数据
INSERT INTO game_types (name, code, icon, description, min_players, max_players, avg_duration, difficulty, sort_order) VALUES
('你画我猜', 'draw-guess', '🎨', '发挥想象力，画出精彩作品', 2, 8, 10, 'easy', 1),
('推箱子', 'sokoban', '📦', '考验逻辑思维，挑战经典关卡', 1, 1, 15, 'medium', 2),
('贪吃蛇', 'snake', '🐍', '重温经典，挑战最高分数', 1, 1, 5, 'easy', 3),
('益智拼图', 'puzzle', '🧩', '锻炼观察力和耐心', 1, 4, 12, 'medium', 4),
('动作游戏', 'action', '⚡', '考验反应速度和手眼协调', 1, 6, 8, 'hard', 5),
('策略游戏', 'strategy', '🎯', '需要深思熟虑的策略对决', 1, 8, 20, 'hard', 6),
('休闲游戏', 'casual', '🌸', '轻松愉快的休闲时光', 1, 4, 6, 'easy', 7),
('经典游戏', 'classic', '🎮', '永不过时的经典玩法', 1, 2, 10, 'medium', 8);

-- 创建视图：用户统计信息
CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.nickname,
    u.level,
    u.experience,
    u.coins,
    COUNT(gr.id) as total_games,
    MAX(gr.score) as best_score,
    AVG(gr.score) as avg_score,
    SUM(gr.experience_gained) as total_experience_gained,
    SUM(gr.coins_gained) as total_coins_gained,
    u.created_at
FROM users u
LEFT JOIN game_records gr ON u.id = gr.user_id
WHERE u.status = 'active'
GROUP BY u.id, u.nickname, u.level, u.experience, u.coins, u.created_at;

-- 创建视图：游戏排行榜
CREATE VIEW game_leaderboard AS
SELECT 
    u.id as user_id,
    u.nickname,
    u.avatar,
    u.level,
    gr.game_type,
    MAX(gr.score) as best_score,
    COUNT(gr.id) as games_played,
    AVG(gr.score) as avg_score,
    MAX(gr.created_at) as last_played
FROM users u
INNER JOIN game_records gr ON u.id = gr.user_id
WHERE u.status = 'active' AND gr.result IN ('win', 'draw')
GROUP BY u.id, u.nickname, u.avatar, u.level, gr.game_type
ORDER BY gr.game_type, best_score DESC;