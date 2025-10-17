-- 客流统计系统数据库架构
-- Store Traffic Counting System Database Schema

-- 访客记录表 (Visits Table)
CREATE TABLE IF NOT EXISTS visits (
    visit_id BIGSERIAL PRIMARY KEY,
    track_id VARCHAR(64) NOT NULL,
    camera_id VARCHAR(32) NOT NULL,
    entry_time TIMESTAMP NOT NULL,
    exit_time TIMESTAMP,
    duration_seconds INTEGER,
    
    -- 特征数据 (Feature Data)
    height_cm INTEGER,
    posture VARCHAR(20) CHECK (posture IN ('standing', 'bending', 'sitting', 'unknown')),
    clothing_color_top VARCHAR(50),
    clothing_color_bottom VARCHAR(50),
    
    -- 过滤标记 (Filter Flags)
    is_delivery_person BOOLEAN DEFAULT FALSE,
    is_short_stay BOOLEAN DEFAULT FALSE,
    is_duplicate BOOLEAN DEFAULT FALSE,
    
    -- 元数据 (Metadata)
    confidence_score FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_entry_time (entry_time),
    INDEX idx_camera_id (camera_id),
    INDEX idx_track_id (track_id)
);

-- 分钟级统计表 (Minute-level Statistics Table)
CREATE TABLE IF NOT EXISTS traffic_stats_minute (
    stat_id BIGSERIAL PRIMARY KEY,
    camera_id VARCHAR(32) NOT NULL,
    timestamp_minute TIMESTAMP NOT NULL,
    
    -- 计数统计 (Count Statistics)
    total_entries INTEGER DEFAULT 0,
    total_exits INTEGER DEFAULT 0,
    valid_visitors INTEGER DEFAULT 0,
    filtered_delivery INTEGER DEFAULT 0,
    filtered_short_stay INTEGER DEFAULT 0,
    filtered_duplicate INTEGER DEFAULT 0,
    
    -- 特征统计 (Feature Statistics)
    avg_height_cm FLOAT,
    avg_duration_seconds FLOAT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE (camera_id, timestamp_minute),
    INDEX idx_timestamp (timestamp_minute)
);

-- 摄像头配置表 (Camera Configuration Table)
CREATE TABLE IF NOT EXISTS cameras (
    camera_id VARCHAR(32) PRIMARY KEY,
    location VARCHAR(100) NOT NULL,
    height_cm INTEGER NOT NULL,
    tilt_angle_degrees FLOAT NOT NULL,
    calibration_data JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
