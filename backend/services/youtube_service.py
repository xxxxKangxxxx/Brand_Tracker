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
            
            # SABR 스트리밍 문제 회피: 여러 클라이언트 시도
            # iOS와 Android 클라이언트는 SABR 제한이 없어서 안정적
            
            # 해상도별 높이 매핑
            resolution_heights = {
                '360p': 360,
                '480p': 480,
                '720p': 720,
                '1080p': 1080,
            }
            height = resolution_heights.get(resolution, 720)  # 기본값 720p
            
            # yt-dlp 옵션 설정
            print(f"⚙️ 다운로드 설정: {resolution} 해상도 (최대 높이: {height}px)")
            
            # 더 정확한 포맷 선택
            # bestvideo[height<=N]+bestaudio: 비디오와 오디오를 별도로 최적 선택 후 병합
            # best[height<=N]: 단일 파일 중 최적 선택 (폴백)
            format_selector = f'bestvideo[height<={height}]+bestaudio/best[height<={height}]'
            
            ydl_opts = {
                # 해상도 제한 적용 (개선된 포맷 선택)
                'format': format_selector,
                'outtmpl': filepath,
                'noplaylist': True,
                'nocheckcertificate': True,
                'quiet': False,
                'no_warnings': False,
                'socket_timeout': 60,  # 60초 타임아웃
                # 여러 클라이언트를 폴백으로 시도
                'extractor_args': {
                    'youtube': {
                        'player_client': ['android', 'ios', 'web'],
                        'player_skip': ['webpage'],
                    }
                },
                # Fragmented 다운로드 방지
                'noprogress': False,  # 진행률 표시
                'fragment_retries': 10,
                'skip_unavailable_fragments': False,
                # Postprocessor 추가하여 완전한 파일 생성 보장
                'postprocessors': [{
                    'key': 'FFmpegVideoRemuxer',
                    'preferedformat': 'mp4',
                }],
            }
            
            print("📥 yt-dlp 다운로드 시작...")
            
            # 다운로드 실행
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([url])
            
            print("🔍 다운로드된 파일 찾는 중...")
            # 실제 다운로드된 파일 경로 찾기 (.part 파일 제외)
            for file in os.listdir(self.download_dir):
                if file.startswith(f"video_{file_id}") and not file.endswith('.part'):
                    file_path = os.path.join(self.download_dir, file)
                    # 파일이 실제로 존재하고 읽을 수 있는지 확인
                    if os.path.exists(file_path) and os.path.getsize(file_path) > 0:
                        file_size_mb = os.path.getsize(file_path) / (1024 * 1024)
                        print(f"✅ 다운로드 완료: {file} ({file_size_mb:.2f}MB)")
                        
                        # 실제 영상 해상도 확인 (OpenCV 사용)
                        try:
                            import cv2
                            cap = cv2.VideoCapture(file_path)
                            actual_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                            actual_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                            cap.release()
                            print(f"📺 실제 해상도: {actual_width}x{actual_height}")
                            print(f"🎯 요청 해상도: {resolution} (최대 높이 {height}px)")
                        except Exception as e:
                            print(f"⚠️ 해상도 확인 실패: {str(e)}")
                        
                        return file_path
            
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
            print(f"🔍 유튜브 정보 추출 시작: {url}")
            ydl_opts = {
                'quiet': False,  # 진행 상황 표시
                'no_warnings': False,  # 경고 표시
                'socket_timeout': 30,  # 30초 타임아웃
                'noplaylist': True,  # 재생목록 무시, 단일 영상만
                # 여러 클라이언트를 폴백으로 시도
                'extractor_args': {
                    'youtube': {
                        'player_client': ['android', 'ios', 'web'],
                        'player_skip': ['webpage'],
                    }
                },
            }
            
            print("📡 유튜브 메타데이터 가져오는 중...")
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
            print("✅ 유튜브 정보 추출 완료")
            
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