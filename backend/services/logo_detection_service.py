import asyncio
import cv2
import numpy as np
from ultralytics import YOLO
from typing import List, Dict, Tuple, Any
import os
from collections import defaultdict

class LogoDetectionService:
    def __init__(self):
        self.model = None
        self.model_path = "models/logo_detection.pt"
        self.confidence_threshold = 0.7
        self.brand_classes = {
            0: "coca-cola",
            1: "pepsi", 
            2: "samsung",
            3: "apple",
            4: "nike",
            5: "adidas",
            6: "lg",
            7: "mcdonalds",
            8: "kfc",
            9: "starbucks"
        }
        self._load_model()
    
    def _load_model(self):
        """YOLO 모델을 로드합니다."""
        try:
            # 사전 훈련된 YOLO 모델 사용 (실제로는 로고 탐지용 커스텀 모델 필요)
            if os.path.exists(self.model_path):
                self.model = YOLO(self.model_path)
                print(f"✅ 커스텀 모델 로드 성공: {self.model_path}")
                
                # 모델의 클래스 정보 출력
                if hasattr(self.model, 'names'):
                    print("📋 모델 클래스 정보:")
                    for class_id, class_name in self.model.names.items():
                        print(f"  {class_id}: {class_name}")
                    
                    # 클래스 매핑 자동 업데이트
                    self.brand_classes = self.model.names
                    print("🔄 클래스 매핑이 자동으로 업데이트되었습니다.")
                else:
                    print("⚠️ 모델에서 클래스 정보를 찾을 수 없습니다.")
                    
            else:
                # 임시로 일반 객체 탐지 모델 사용
                self.model = YOLO('yolov8n.pt')
                print("경고: 로고 탐지용 커스텀 모델이 없어 일반 YOLO 모델을 사용합니다.")
                print(f"찾는 모델 경로: {self.model_path}")
        except Exception as e:
            print(f"모델 로드 실패: {str(e)}")
            self.model = None
    
    async def detect_logos_in_frames(self, frames: List[Tuple[float, np.ndarray]]) -> List[Dict]:
        """프레임들에서 로고를 탐지합니다."""
        try:
            if not self.model:
                raise Exception("YOLO 모델이 로드되지 않았습니다.")
            
            loop = asyncio.get_event_loop()
            results = await loop.run_in_executor(
                None, self._detect_logos_sync, frames
            )
            return results
        except Exception as e:
            raise Exception(f"로고 탐지 실패: {str(e)}")
    
    def _detect_logos_sync(self, frames: List[Tuple[float, np.ndarray]]) -> List[Dict]:
        """동기적으로 로고를 탐지합니다."""
        detection_results = []
        
        for timestamp, frame in frames:
            try:
                # YOLO 모델로 탐지 실행
                results = self.model(frame, conf=self.confidence_threshold, verbose=False)
                
                frame_detections = {
                    "timestamp": timestamp,
                    "detections": []
                }
                
                for result in results:
                    boxes = result.boxes
                    if boxes is not None:
                        for box in boxes:
                            # 클래스 ID와 신뢰도 추출
                            class_id = int(box.cls[0])
                            confidence = float(box.conf[0])
                            
                            # 바운딩 박스 좌표
                            x1, y1, x2, y2 = box.xyxy[0].tolist()
                            
                            # 브랜드 이름 매핑 (실제로는 커스텀 모델에서 로고 클래스 사용)
                            brand_name = self._map_class_to_brand(class_id)
                            
                            if brand_name:
                                frame_detections["detections"].append({
                                    "brand": brand_name,
                                    "confidence": confidence,
                                    "bbox": [x1, y1, x2, y2]
                                })
                
                detection_results.append(frame_detections)
                
            except Exception as e:
                print(f"프레임 {timestamp} 탐지 오류: {str(e)}")
                continue
        
        return detection_results
    
    def _map_class_to_brand(self, class_id: int) -> str:
        """클래스 ID를 브랜드 이름으로 매핑합니다."""
        # 커스텀 모델이 로드된 경우 해당 모델의 클래스 사용
        if hasattr(self.model, 'names') and class_id in self.model.names:
            return self.model.names[class_id]
        
        # 기본 브랜드 클래스 매핑 사용
        if class_id in self.brand_classes:
            return self.brand_classes[class_id]
        
        # 일반 YOLO 모델 사용 시 데모용 매핑
        demo_mapping = {
            0: "coca-cola",  # person -> coca-cola (데모용)
            2: "samsung",    # car -> samsung (데모용)
            5: "apple",      # bus -> apple (데모용)
        }
        return demo_mapping.get(class_id, None)
    
    async def summarize_timeline(self, detection_results: List[Dict]) -> Dict:
        """탐지 결과를 타임라인으로 요약합니다."""
        try:
            loop = asyncio.get_event_loop()
            summary = await loop.run_in_executor(
                None, self._summarize_timeline_sync, detection_results
            )
            return summary
        except Exception as e:
            raise Exception(f"타임라인 요약 실패: {str(e)}")
    
    def _summarize_timeline_sync(self, detection_results: List[Dict]) -> Dict:
        """동기적으로 타임라인을 요약합니다."""
        brand_timeline = defaultdict(lambda: {
            "appearances": 0,
            "total_seconds": 0,
            "timestamps": [],
            "confidence_scores": []
        })
        
        for frame_result in detection_results:
            timestamp = frame_result["timestamp"]
            detections = frame_result["detections"]
            
            detected_brands = set()
            
            for detection in detections:
                brand = detection["brand"]
                confidence = detection["confidence"]
                
                if brand not in detected_brands:
                    brand_timeline[brand]["appearances"] += 1
                    brand_timeline[brand]["total_seconds"] += 1
                    brand_timeline[brand]["timestamps"].append(timestamp)
                    brand_timeline[brand]["confidence_scores"].append(confidence)
                    detected_brands.add(brand)
        
        # 평균 신뢰도 계산
        for brand in brand_timeline:
            scores = brand_timeline[brand]["confidence_scores"]
            brand_timeline[brand]["average_confidence"] = sum(scores) / len(scores) if scores else 0
            brand_timeline[brand]["max_confidence"] = max(scores) if scores else 0
        
        return dict(brand_timeline)
    
    async def get_model_status(self) -> Dict:
        """모델 상태를 반환합니다."""
        return {
            "model_loaded": self.model is not None,
            "model_path": self.model_path,
            "confidence_threshold": self.confidence_threshold,
            "supported_brands": list(self.brand_classes.values())
        }
    
    def set_confidence_threshold(self, threshold: float):
        """신뢰도 임계값을 설정합니다."""
        self.confidence_threshold = max(0.1, min(1.0, threshold))
    
    def set_model_path(self, model_path: str):
        """모델 경로를 설정하고 모델을 다시 로드합니다."""
        self.model_path = model_path
        self._load_model()
        print(f"🔄 모델 경로가 변경되었습니다: {model_path}")
    
    def get_available_models(self) -> List[str]:
        """models 디렉토리에서 사용 가능한 모델 파일들을 반환합니다."""
        models_dir = "models"
        if not os.path.exists(models_dir):
            return []
        
        model_files = []
        for file in os.listdir(models_dir):
            if file.endswith('.pt'):
                model_files.append(os.path.join(models_dir, file))
        
        return model_files 