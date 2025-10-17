-- 插入示例摄像头配置
-- Insert sample camera configurations

INSERT INTO cameras (camera_id, location, height_cm, tilt_angle_degrees, calibration_data, is_active)
VALUES 
    ('CAM001', '主入口', 250, 15.0, '{"focal_length": 3.6, "sensor_height": 2.7}', TRUE),
    ('CAM002', '侧门', 240, 20.0, '{"focal_length": 3.6, "sensor_height": 2.7}', TRUE),
    ('CAM003', '后门', 260, 10.0, '{"focal_length": 3.6, "sensor_height": 2.7}', TRUE)
ON CONFLICT (camera_id) DO NOTHING;
