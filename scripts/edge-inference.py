"""
边缘推理服务 - Edge Inference Service
实时人员检测、跟踪和特征提取
Real-time person detection, tracking, and feature extraction
"""

import cv2
import numpy as np
from dataclasses import dataclass
from typing import List, Dict, Tuple, Optional
from datetime import datetime
import json

@dataclass
class PersonFeatures:
    """人员特征数据类"""
    track_id: str
    height_cm: Optional[int]
    posture: str  # 'standing', 'bending', 'sitting', 'unknown'
    clothing_color_top: str
    clothing_color_bottom: str
    confidence: float

@dataclass
class Visit:
    """访客记录"""
    track_id: str
    camera_id: str
    entry_time: datetime
    exit_time: Optional[datetime]
    features: PersonFeatures
    is_delivery_person: bool
    is_short_stay: bool

class CameraCalibration:
    """摄像头标定和高度估算"""
    
    def __init__(self, camera_height_cm: int, tilt_angle_deg: float, focal_length: float):
        self.camera_height = camera_height_cm
        self.tilt_angle = np.radians(tilt_angle_deg)
        self.focal_length = focal_length
    
    def estimate_height(self, bbox: Tuple[int, int, int, int], frame_height: int) -> int:
        """
        根据边界框估算人员身高
        Estimate person height from bounding box
        """
        x1, y1, x2, y2 = bbox
        bbox_height_pixels = y2 - y1
        
        # 简化的透视投影模型
        # Simplified perspective projection model
        distance_factor = (frame_height - y2) / frame_height
        estimated_height = int(bbox_height_pixels * (1.0 + distance_factor * 0.5))
        
        # 映射到真实高度范围 (120-200cm)
        # Map to realistic height range
        height_cm = int(120 + (estimated_height / frame_height) * 80)
        return np.clip(height_cm, 120, 200)

class PostureClassifier:
    """姿态分类器"""
    
    @staticmethod
    def classify_posture(bbox: Tuple[int, int, int, int], keypoints: Optional[np.ndarray] = None) -> str:
        """
        分类人员姿态
        Classify person posture
        """
        x1, y1, x2, y2 = bbox
        width = x2 - x1
        height = y2 - y1
        aspect_ratio = height / width if width > 0 else 0
        
        # 基于宽高比的简单启发式
        # Simple heuristic based on aspect ratio
        if aspect_ratio > 2.5:
            return 'standing'
        elif aspect_ratio > 1.5:
            return 'bending'
        elif aspect_ratio > 0.8:
            return 'sitting'
        else:
            return 'unknown'

class ClothingAnalyzer:
    """服装颜色分析器"""
    
    @staticmethod
    def extract_dominant_color(image_region: np.ndarray) -> str:
        """
        提取主导颜色
        Extract dominant color from image region
        """
        if image_region.size == 0:
            return 'unknown'
        
        # 转换到HSV色彩空间
        # Convert to HSV color space
        hsv = cv2.cvtColor(image_region, cv2.COLOR_BGR2HSV)
        avg_hue = np.mean(hsv[:, :, 0])
        avg_sat = np.mean(hsv[:, :, 1])
        avg_val = np.mean(hsv[:, :, 2])
        
        # 颜色分类
        # Color classification
        if avg_sat < 30:
            if avg_val > 200:
                return 'white'
            elif avg_val < 50:
                return 'black'
            else:
                return 'gray'
        
        # 基于色调的颜色分类
        # Hue-based color classification
        if avg_hue < 15 or avg_hue > 165:
            return 'red'
        elif avg_hue < 30:
            return 'orange'
        elif avg_hue < 75:
            return 'yellow'
        elif avg_hue < 90:
            return 'green'
        elif avg_hue < 130:
            return 'blue'
        else:
            return 'purple'
    
    @staticmethod
    def analyze_clothing(frame: np.ndarray, bbox: Tuple[int, int, int, int]) -> Tuple[str, str]:
        """
        分析上下装颜色
        Analyze top and bottom clothing colors
        """
        x1, y1, x2, y2 = bbox
        person_region = frame[y1:y2, x1:x2]
        
        if person_region.size == 0:
            return 'unknown', 'unknown'
        
        height = y2 - y1
        # 上半身: 20%-50%
        top_region = person_region[int(height * 0.2):int(height * 0.5), :]
        # 下半身: 50%-80%
        bottom_region = person_region[int(height * 0.5):int(height * 0.8), :]
        
        top_color = ClothingAnalyzer.extract_dominant_color(top_region)
        bottom_color = ClothingAnalyzer.extract_dominant_color(bottom_region)
        
        return top_color, bottom_color

class DeliveryDetector:
    """外卖/快递人员检测器"""
    
    @staticmethod
    def is_delivery_person(features: PersonFeatures, bbox: Tuple[int, int, int, int]) -> bool:
        """
        检测是否为外卖/快递人员
        Detect if person is delivery personnel
        """
        # 启发式规则
        # Heuristic rules
        
        # 1. 典型外卖配色 (黄色、蓝色、绿色上装)
        delivery_colors = ['yellow', 'blue', 'green', 'orange']
        if features.clothing_color_top in delivery_colors:
            return True
        
        # 2. 弯腰姿态 (可能在取餐)
        if features.posture == 'bending':
            return True
        
        # 3. 可以添加更多规则: 背包检测、停留时间短等
        # Additional rules can be added: backpack detection, short stay duration, etc.
        
        return False

class PersonTracker:
    """人员跟踪器 (简化版ByteTrack)"""
    
    def __init__(self, max_age: int = 30):
        self.tracks: Dict[str, Dict] = {}
        self.next_id = 1
        self.max_age = max_age
    
    def update(self, detections: List[Tuple[int, int, int, int, float]]) -> List[Tuple[str, Tuple[int, int, int, int]]]:
        """
        更新跟踪
        Update tracking with new detections
        
        Returns: List of (track_id, bbox)
        """
        # 简化的跟踪逻辑 - 实际应使用IoU匹配
        # Simplified tracking logic - should use IoU matching in production
        
        results = []
        
        for det in detections:
            x1, y1, x2, y2, conf = det
            bbox = (x1, y1, x2, y2)
            
            # 查找最近的跟踪
            # Find closest track
            matched_id = None
            min_dist = float('inf')
            
            for track_id, track_data in self.tracks.items():
                if track_data['age'] > self.max_age:
                    continue
                
                prev_bbox = track_data['bbox']
                # 计算中心点距离
                # Calculate center distance
                prev_center = ((prev_bbox[0] + prev_bbox[2]) / 2, (prev_bbox[1] + prev_bbox[3]) / 2)
                curr_center = ((x1 + x2) / 2, (y1 + y2) / 2)
                dist = np.sqrt((prev_center[0] - curr_center[0])**2 + (prev_center[1] - curr_center[1])**2)
                
                if dist < min_dist and dist < 100:  # 距离阈值
                    min_dist = dist
                    matched_id = track_id
            
            if matched_id:
                # 更新现有跟踪
                self.tracks[matched_id]['bbox'] = bbox
                self.tracks[matched_id]['age'] = 0
                results.append((matched_id, bbox))
            else:
                # 创建新跟踪
                new_id = f"T{self.next_id:06d}"
                self.next_id += 1
                self.tracks[new_id] = {'bbox': bbox, 'age': 0, 'entry_time': datetime.now()}
                results.append((new_id, bbox))
        
        # 增加未匹配跟踪的年龄
        # Age unmatched tracks
        for track_id in list(self.tracks.keys()):
            if track_id not in [r[0] for r in results]:
                self.tracks[track_id]['age'] += 1
                if self.tracks[track_id]['age'] > self.max_age:
                    del self.tracks[track_id]
        
        return results

class EdgeInferenceService:
    """边缘推理服务主类"""
    
    def __init__(self, camera_id: str, camera_config: Dict):
        self.camera_id = camera_id
        self.calibration = CameraCalibration(
            camera_config['height_cm'],
            camera_config['tilt_angle'],
            camera_config.get('focal_length', 3.6)
        )
        self.tracker = PersonTracker()
        self.active_visits: Dict[str, Visit] = {}
        
        print(f"[v0] Edge Inference Service initialized for camera {camera_id}")
    
    def detect_persons(self, frame: np.ndarray) -> List[Tuple[int, int, int, int, float]]:
        """
        人员检测 (模拟YOLO输出)
        Person detection (simulating YOLO output)
        
        Returns: List of (x1, y1, x2, y2, confidence)
        """
        # 实际应用中应使用YOLO模型
        # In production, use YOLO model
        # model = YOLO('yolov8n.pt')
        # results = model(frame, classes=[0])  # class 0 = person
        
        # 这里返回模拟检测结果
        # Return simulated detections for demo
        detections = [
            (100, 150, 200, 450, 0.92),  # 示例检测框
            (350, 180, 450, 480, 0.88),
        ]
        return detections
    
    def process_frame(self, frame: np.ndarray) -> List[Dict]:
        """
        处理单帧
        Process single frame
        
        Returns: List of visit events
        """
        # 1. 人员检测
        detections = self.detect_persons(frame)
        
        # 2. 跟踪
        tracked_persons = self.tracker.update(detections)
        
        # 3. 特征提取
        events = []
        frame_height = frame.shape[0]
        
        for track_id, bbox in tracked_persons:
            # 提取特征
            height_cm = self.calibration.estimate_height(bbox, frame_height)
            posture = PostureClassifier.classify_posture(bbox)
            top_color, bottom_color = ClothingAnalyzer.analyze_clothing(frame, bbox)
            
            features = PersonFeatures(
                track_id=track_id,
                height_cm=height_cm,
                posture=posture,
                clothing_color_top=top_color,
                clothing_color_bottom=bottom_color,
                confidence=0.85
            )
            
            # 检测外卖人员
            is_delivery = DeliveryDetector.is_delivery_person(features, bbox)
            
            # 管理访客记录
            if track_id not in self.active_visits:
                # 新访客进入
                visit = Visit(
                    track_id=track_id,
                    camera_id=self.camera_id,
                    entry_time=datetime.now(),
                    exit_time=None,
                    features=features,
                    is_delivery_person=is_delivery,
                    is_short_stay=False
                )
                self.active_visits[track_id] = visit
                
                events.append({
                    'event_type': 'entry',
                    'visit': visit
                })
            else:
                # 更新现有访客
                self.active_visits[track_id].features = features
        
        # 检查离开的访客
        current_track_ids = {t[0] for t in tracked_persons}
        for track_id in list(self.active_visits.keys()):
            if track_id not in current_track_ids:
                visit = self.active_visits[track_id]
                visit.exit_time = datetime.now()
                
                # 计算停留时间
                duration = (visit.exit_time - visit.entry_time).total_seconds()
                visit.is_short_stay = duration < 120  # 2分钟
                
                events.append({
                    'event_type': 'exit',
                    'visit': visit
                })
                
                del self.active_visits[track_id]
        
        return events
    
    def send_to_central_service(self, events: List[Dict]):
        """
        发送事件到中央服务
        Send events to central service
        """
        # 实际应用中通过HTTP POST发送
        # In production, send via HTTP POST
        for event in events:
            visit = event['visit']
            payload = {
                'event_type': event['event_type'],
                'camera_id': self.camera_id,
                'track_id': visit.track_id,
                'entry_time': visit.entry_time.isoformat(),
                'exit_time': visit.exit_time.isoformat() if visit.exit_time else None,
                'height_cm': visit.features.height_cm,
                'posture': visit.features.posture,
                'clothing_color_top': visit.features.clothing_color_top,
                'clothing_color_bottom': visit.features.clothing_color_bottom,
                'is_delivery_person': visit.is_delivery_person,
                'is_short_stay': visit.is_short_stay,
                'confidence': visit.features.confidence
            }
            
            print(f"[v0] Sending event: {json.dumps(payload, indent=2)}")
            # requests.post('http://central-service/api/events', json=payload)

# 示例使用
# Example usage
if __name__ == "__main__":
    camera_config = {
        'height_cm': 250,
        'tilt_angle': 15.0,
        'focal_length': 3.6
    }
    
    service = EdgeInferenceService('CAM001', camera_config)
    
    # 模拟视频流处理
    # Simulate video stream processing
    print("[v0] Starting edge inference service...")
    print("[v0] Processing frames and extracting features...")
    print("[v0] Service ready to detect and track persons")
