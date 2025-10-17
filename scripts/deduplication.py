"""
去重服务 - Deduplication Service
基于特征相似度的访客去重
Visitor deduplication based on feature similarity
"""

from dataclasses import dataclass
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import numpy as np

@dataclass
class VisitRecord:
    """访客记录"""
    visit_id: int
    track_id: str
    camera_id: str
    entry_time: datetime
    height_cm: int
    posture: str
    clothing_color_top: str
    clothing_color_bottom: str

class FeatureMatcher:
    """特征匹配器"""
    
    @staticmethod
    def calculate_similarity(visit1: VisitRecord, visit2: VisitRecord) -> float:
        """
        计算两个访客记录的相似度
        Calculate similarity between two visit records
        
        Returns: Similarity score (0-1)
        """
        score = 0.0
        
        # 1. 身高相似度 (权重: 0.3)
        # Height similarity (weight: 0.3)
        height_diff = abs(visit1.height_cm - visit2.height_cm)
        height_score = max(0, 1 - height_diff / 30)  # 30cm容差
        score += height_score * 0.3
        
        # 2. 服装颜色相似度 (权重: 0.5)
        # Clothing color similarity (weight: 0.5)
        top_match = 1.0 if visit1.clothing_color_top == visit2.clothing_color_top else 0.0
        bottom_match = 1.0 if visit1.clothing_color_bottom == visit2.clothing_color_bottom else 0.0
        clothing_score = (top_match + bottom_match) / 2
        score += clothing_score * 0.5
        
        # 3. 姿态相似度 (权重: 0.2)
        # Posture similarity (weight: 0.2)
        posture_score = 1.0 if visit1.posture == visit2.posture else 0.3
        score += posture_score * 0.2
        
        return score
    
    @staticmethod
    def is_duplicate(visit1: VisitRecord, visit2: VisitRecord, threshold: float = 0.7) -> bool:
        """
        判断是否为重复访客
        Determine if visits are duplicates
        """
        similarity = FeatureMatcher.calculate_similarity(visit1, visit2)
        return similarity >= threshold

class DeduplicationService:
    """去重服务"""
    
    def __init__(self, time_window_minutes: int = 30, similarity_threshold: float = 0.7):
        self.time_window = timedelta(minutes=time_window_minutes)
        self.similarity_threshold = similarity_threshold
        self.recent_visits: List[VisitRecord] = []
    
    def check_duplicate(self, new_visit: VisitRecord) -> Optional[int]:
        """
        检查新访客是否为重复
        Check if new visit is a duplicate
        
        Returns: Original visit_id if duplicate, None otherwise
        """
        # 清理过期记录
        # Clean up expired records
        cutoff_time = new_visit.entry_time - self.time_window
        self.recent_visits = [v for v in self.recent_visits if v.entry_time >= cutoff_time]
        
        # 查找匹配
        # Find matches
        for existing_visit in self.recent_visits:
            # 跳过同一摄像头的记录 (可能是同一个跟踪)
            # Skip records from same camera (might be same track)
            if existing_visit.camera_id == new_visit.camera_id:
                continue
            
            # 检查时间窗口
            # Check time window
            time_diff = abs((new_visit.entry_time - existing_visit.entry_time).total_seconds())
            if time_diff > self.time_window.total_seconds():
                continue
            
            # 计算相似度
            # Calculate similarity
            if FeatureMatcher.is_duplicate(existing_visit, new_visit, self.similarity_threshold):
                print(f"[v0] Duplicate detected: {new_visit.track_id} matches {existing_visit.track_id}")
                return existing_visit.visit_id
        
        # 添加到最近访客列表
        # Add to recent visits
        self.recent_visits.append(new_visit)
        return None
    
    def process_batch(self, visits: List[VisitRecord]) -> Dict[int, Optional[int]]:
        """
        批量处理访客记录
        Process batch of visit records
        
        Returns: Dict mapping visit_id to original_visit_id (if duplicate)
        """
        results = {}
        
        for visit in visits:
            original_id = self.check_duplicate(visit)
            results[visit.visit_id] = original_id
        
        return results

# 示例使用
# Example usage
if __name__ == "__main__":
    dedup_service = DeduplicationService(time_window_minutes=30, similarity_threshold=0.7)
    
    # 模拟访客记录
    # Simulate visit records
    visit1 = VisitRecord(
        visit_id=1,
        track_id="T000001",
        camera_id="CAM001",
        entry_time=datetime.now(),
        height_cm=175,
        posture="standing",
        clothing_color_top="blue",
        clothing_color_bottom="black"
    )
    
    visit2 = VisitRecord(
        visit_id=2,
        track_id="T000002",
        camera_id="CAM002",
        entry_time=datetime.now() + timedelta(minutes=5),
        height_cm=173,
        posture="standing",
        clothing_color_top="blue",
        clothing_color_bottom="black"
    )
    
    # 检查重复
    # Check for duplicates
    is_dup = dedup_service.check_duplicate(visit1)
    print(f"[v0] Visit 1 duplicate: {is_dup}")
    
    is_dup = dedup_service.check_duplicate(visit2)
    print(f"[v0] Visit 2 duplicate: {is_dup}")
