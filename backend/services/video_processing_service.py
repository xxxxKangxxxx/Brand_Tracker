import cv2
import asyncio
import numpy as np
from typing import List, Tuple, Dict
import os

class VideoProcessingService:
    def __init__(self):
        pass
    
    async def get_video_info(self, video_path: str) -> Dict:
        """영상 파일의 정보를 추출합니다."""
        try:
            loop = asyncio.get_event_loop()
            info = await loop.run_in_executor(
                None, self._get_video_info_sync, video_path
            )
            return info
        except Exception as e:
            raise Exception(f"영상 정보 추출 실패: {str(e)}")
    
    def _get_video_info_sync(self, video_path: str) -> Dict:
        """동기적으로 영상 파일 정보를 추출합니다."""
        try:
            cap = cv2.VideoCapture(video_path)
            
            if not cap.isOpened():
                raise Exception("영상 파일을 열 수 없습니다.")
            
            # 영상 속성 추출
            fps = cap.get(cv2.CAP_PROP_FPS)
            frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            duration = frame_count / fps if fps > 0 else 0
            
            cap.release()
            
            return {
                "duration": duration,
                "fps": fps,
                "frame_count": frame_count,
                "width": width,
                "height": height,
                "file_size": os.path.getsize(video_path),
                "format": "mp4"
            }
            
        except Exception as e:
            raise Exception(f"영상 정보 추출 오류: {str(e)}")
    
    async def extract_frames(self, video_path: str, frame_interval: float = 0.5) -> List[Tuple[float, np.ndarray]]:
        """영상에서 프레임을 추출합니다."""
        try:
            loop = asyncio.get_event_loop()
            frames = await loop.run_in_executor(
                None, self._extract_frames_sync, video_path, frame_interval
            )
            return frames
        except Exception as e:
            raise Exception(f"프레임 추출 실패: {str(e)}")
    
    def _extract_frames_sync(self, video_path: str, frame_interval: float) -> List[Tuple[float, np.ndarray]]:
        """동기적으로 프레임을 추출합니다."""
        try:
            cap = cv2.VideoCapture(video_path)
            
            if not cap.isOpened():
                raise Exception("영상 파일을 열 수 없습니다.")
            
            fps = cap.get(cv2.CAP_PROP_FPS)
            frames = []
            frame_number = 0
            
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                
                # 지정된 간격마다 프레임 저장
                if frame_number % (int(fps * frame_interval)) == 0:
                    timestamp = frame_number / fps
                    frames.append((timestamp, frame))
                
                frame_number += 1
            
            cap.release()
            
            return frames
            
        except Exception as e:
            raise Exception(f"프레임 추출 오류: {str(e)}")
    
    async def extract_frame_at_time(self, video_path: str, timestamp: float) -> np.ndarray:
        """특정 시간의 프레임을 추출합니다."""
        try:
            loop = asyncio.get_event_loop()
            frame = await loop.run_in_executor(
                None, self._extract_frame_at_time_sync, video_path, timestamp
            )
            return frame
        except Exception as e:
            raise Exception(f"특정 시간 프레임 추출 실패: {str(e)}")
    
    def _extract_frame_at_time_sync(self, video_path: str, timestamp: float) -> np.ndarray:
        """동기적으로 특정 시간의 프레임을 추출합니다."""
        try:
            cap = cv2.VideoCapture(video_path)
            
            if not cap.isOpened():
                raise Exception("영상 파일을 열 수 없습니다.")
            
            # 특정 시간으로 이동
            cap.set(cv2.CAP_PROP_POS_MSEC, timestamp * 1000)
            
            ret, frame = cap.read()
            cap.release()
            
            if not ret:
                raise Exception("해당 시간의 프레임을 읽을 수 없습니다.")
            
            return frame
            
        except Exception as e:
            raise Exception(f"특정 시간 프레임 추출 오류: {str(e)}")
    
    async def resize_frame(self, frame: np.ndarray, width: int = None, height: int = None) -> np.ndarray:
        """프레임 크기를 조정합니다."""
        try:
            loop = asyncio.get_event_loop()
            resized = await loop.run_in_executor(
                None, self._resize_frame_sync, frame, width, height
            )
            return resized
        except Exception as e:
            raise Exception(f"프레임 크기 조정 실패: {str(e)}")
    
    def _resize_frame_sync(self, frame: np.ndarray, width: int = None, height: int = None) -> np.ndarray:
        """동기적으로 프레임 크기를 조정합니다."""
        try:
            if width is None and height is None:
                return frame
            
            h, w = frame.shape[:2]
            
            if width is None:
                width = int(w * height / h)
            elif height is None:
                height = int(h * width / w)
            
            return cv2.resize(frame, (width, height))
            
        except Exception as e:
            raise Exception(f"프레임 크기 조정 오류: {str(e)}")
    
    def save_frame(self, frame: np.ndarray, output_path: str) -> bool:
        """프레임을 이미지 파일로 저장합니다."""
        try:
            return cv2.imwrite(output_path, frame)
        except Exception as e:
            print(f"프레임 저장 오류: {str(e)}")
            return False 