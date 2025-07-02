import os
import asyncio
import yt_dlp
from typing import Optional
import uuid
import json

class YouTubeService:
    def __init__(self):
        self.download_dir = "temp_downloads"
        os.makedirs(self.download_dir, exist_ok=True)
    
    async def download_video(self, url: str, resolution: str = "360p") -> str:
        """유튜브 영상을 다운로드합니다."""
        try:
            # 비동기 실행을 위해 executor 사용
            loop = asyncio.get_event_loop()
            video_path = await loop.run_in_executor(
                None, self._download_sync, url, resolution
            )
            return video_path
        except Exception as e:
            raise Exception(f"유튜브 영상 다운로드 실패: {str(e)}")
    
    def _download_sync(self, url: str, resolution: str) -> str:
        """동기적으로 유튜브 영상을 다운로드합니다."""
        try:
            # 고유한 파일명 생성
            file_id = str(uuid.uuid4())
            filename = f"video_{file_id}.%(ext)s"
            filepath = os.path.join(self.download_dir, filename)
            
            # 해상도에 따른 품질 설정
            quality_map = {
                "360p": "best[height<=360]",
                "480p": "best[height<=480]",
                "720p": "best[height<=720]",
                "1080p": "best[height<=1080]"
            }
            
            format_selector = quality_map.get(resolution, "best[height<=360]")
            
            # yt-dlp 옵션 설정
            ydl_opts = {
                'format': f'{format_selector}/best',
                'outtmpl': filepath,
                'noplaylist': True,
            }
            
            # 다운로드 실행
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([url])
            
            # 실제 다운로드된 파일 경로 찾기
            for file in os.listdir(self.download_dir):
                if file.startswith(f"video_{file_id}"):
                    return os.path.join(self.download_dir, file)
            
            raise Exception("다운로드된 파일을 찾을 수 없습니다.")
            
        except Exception as e:
            raise Exception(f"유튜브 다운로드 오류: {str(e)}")
    
    async def get_video_info(self, url: str) -> dict:
        """유튜브 영상 정보를 가져옵니다."""
        try:
            loop = asyncio.get_event_loop()
            info = await loop.run_in_executor(
                None, self._get_video_info_sync, url
            )
            return info
        except Exception as e:
            raise Exception(f"영상 정보 가져오기 실패: {str(e)}")
    
    def _get_video_info_sync(self, url: str) -> dict:
        """동기적으로 유튜브 영상 정보를 가져옵니다."""
        try:
            ydl_opts = {
                'quiet': True,
                'no_warnings': True,
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                
                return {
                    "title": info.get('title', '제목 없음'),
                    "author": info.get('uploader', '채널 없음'),
                    "length": info.get('duration', 0),
                    "views": info.get('view_count', 0),
                    "description": (info.get('description', '')[:200] + "...") if len(info.get('description', '')) > 200 else info.get('description', ''),
                    "thumbnail_url": info.get('thumbnail', ''),
                    "publish_date": info.get('upload_date', None)
                }
        except Exception as e:
            raise Exception(f"영상 정보 추출 오류: {str(e)}")
    
    def cleanup_temp_files(self):
        """임시 다운로드 파일들을 정리합니다."""
        try:
            for filename in os.listdir(self.download_dir):
                file_path = os.path.join(self.download_dir, filename)
                if os.path.isfile(file_path):
                    os.remove(file_path)
        except Exception as e:
            print(f"임시 파일 정리 중 오류: {str(e)}") 