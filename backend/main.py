from fastapi import FastAPI, HTTPException, UploadFile, File, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
import json
from typing import Dict, List, Optional
import asyncio
from datetime import datetime
import hashlib
import secrets

from .services.youtube_service import YouTubeService
from .services.logo_detection_service import LogoDetectionService
from .services.video_processing_service import VideoProcessingService
from .services.analysis_storage_service import AnalysisStorageService
from .services.notification_service import NotificationService

app = FastAPI(title="브랜드 추적 시스템 API", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket 연결 관리
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        print(f"🔌 WebSocket 연결: {user_id}")
    
    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            print(f"❌ WebSocket 연결 해제: {user_id}")
    
    async def send_notification(self, user_id: str, message: dict):
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_json(message)
                print(f"📤 알림 전송: {user_id} -> {message.get('message', '')}")
                return True
            except Exception as e:
                print(f"⚠️ 알림 전송 실패: {user_id} - {str(e)}")
                return False
        else:
            print(f"⚠️ WebSocket 미연결: {user_id}")
            return False

manager = ConnectionManager()

# 서비스 인스턴스 생성
youtube_service = YouTubeService()
logo_detection_service = LogoDetectionService()
video_processing_service = VideoProcessingService()
storage_service = AnalysisStorageService()
notification_service = NotificationService()

# 사용자 데이터 파일 경로
USERS_FILE = "users.json"

# 사용자 데이터 로드/저장 함수
def load_users():
    """사용자 데이터를 파일에서 로드합니다."""
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def save_users(users):
    """사용자 데이터를 파일에 저장합니다."""
    with open(USERS_FILE, 'w', encoding='utf-8') as f:
        json.dump(users, f, ensure_ascii=False, indent=2)

def hash_password(password: str) -> str:
    """비밀번호를 해시화합니다."""
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token() -> str:
    """간단한 세션 토큰을 생성합니다."""
    return secrets.token_urlsafe(32)

class YouTubeAnalysisRequest(BaseModel):
    url: str
    resolution: str = "360p"
    frame_interval: float = 0.5

class AnalysisResponse(BaseModel):
    video_info: Dict
    brand_analysis: Dict
    total_analysis_time: float
    timestamp: str
    analysis_settings: Dict

class RegisterRequest(BaseModel):
    id: str  # 이메일 형식
    username: str  # 사용자명
    password: str
    user_type: str  # "creator" or "company"

class LoginRequest(BaseModel):
    id: str  # 이메일 형식
    password: str

class AuthResponse(BaseModel):
    status: str
    message: str
    token: Optional[str] = None
    user: Optional[Dict] = None

class NotificationSendRequest(BaseModel):
    to_user: str
    from_user: str
    from_type: str = "company"
    type: str = "collaboration_request"
    message: str
    data: Optional[Dict] = None

@app.get("/")
async def root():
    return {"message": "브랜드 추적 시스템 API가 실행 중입니다!"}

@app.post("/auth/register", response_model=AuthResponse)
async def register(request: RegisterRequest):
    """회원가입을 처리합니다."""
    try:
        # 사용자 타입 검증
        if request.user_type not in ["creator", "company"]:
            raise HTTPException(status_code=400, detail="사용자 타입은 'creator' 또는 'company'여야 합니다.")
        
        # 이메일 형식 검증
        import re
        email_pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
        if not re.match(email_pattern, request.id):
            raise HTTPException(status_code=400, detail="올바른 이메일 형식을 입력해주세요.")
        
        # 사용자 데이터 로드
        users = load_users()
        
        # 중복 확인 (id 기준)
        if request.id in users:
            raise HTTPException(status_code=400, detail="이미 존재하는 이메일입니다.")
        
        # 비밀번호 해시화
        hashed_password = hash_password(request.password)
        
        # 새 사용자 저장 (id를 키로 사용)
        users[request.id] = {
            "id": request.id,
            "username": request.username,
            "password": hashed_password,
            "user_type": request.user_type,
            "created_at": datetime.now().isoformat()
        }
        
        save_users(users)
        
        print(f"✅ 새 사용자 등록: {request.id} ({request.username}, {request.user_type})")
        
        return AuthResponse(
            status="success",
            message="회원가입이 완료되었습니다."
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 회원가입 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"회원가입 중 오류가 발생했습니다: {str(e)}")

@app.post("/auth/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    """로그인을 처리합니다."""
    try:
        # 사용자 데이터 로드
        users = load_users()
        
        # 사용자 확인 (id 기준)
        if request.id not in users:
            raise HTTPException(status_code=401, detail="아이디 또는 비밀번호가 올바르지 않습니다.")
        
        user = users[request.id]
        
        # 비밀번호 확인
        hashed_password = hash_password(request.password)
        if user["password"] != hashed_password:
            raise HTTPException(status_code=401, detail="아이디 또는 비밀번호가 올바르지 않습니다.")
        
        # 토큰 생성
        token = generate_token()
        
        print(f"✅ 로그인 성공: {request.id} ({user['username']}, {user['user_type']})")
        
        return AuthResponse(
            status="success",
            message="로그인 성공",
            token=token,
            user={
                "id": user["id"],
                "username": user["username"],
                "user_type": user["user_type"]
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 로그인 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"로그인 중 오류가 발생했습니다: {str(e)}")

@app.post("/analyze/youtube", response_model=AnalysisResponse)
async def analyze_youtube_video(request: YouTubeAnalysisRequest, username: str = None):
    """유튜브 영상을 분석하여 브랜드 로고를 탐지합니다."""
    video_path = None  # finally에서 사용하기 위해 초기화
    try:
        start_time = datetime.now()
        
        print(f"🎬 [YOUTUBE 분석] 요청받음: {request.url} (사용자: {username})")
        print(f"🎬 [YOUTUBE 분석] 해상도: {request.resolution}, 프레임 간격: {request.frame_interval}초")
        
        # 1. 유튜브 영상 정보 먼저 가져오기
        print("📋 영상 정보 가져오는 중...")
        video_info_raw = await youtube_service.get_video_info(request.url)
        
        # 2. 유튜브 영상 다운로드
        print("📥 영상 다운로드 중...")
        video_path = await youtube_service.download_video(
            request.url, 
            resolution=request.resolution
        )
        
        # 3. 영상 파일 정보 추출
        print("📊 영상 파일 분석 중...")
        video_file_info = await video_processing_service.get_video_info(video_path)
        
        # 4. 프레임 추출
        print("🖼️ 프레임 추출 중...")
        frames = await video_processing_service.extract_frames(
            video_path, 
            frame_interval=request.frame_interval
        )
        
        print(f"📸 총 {len(frames)}개 프레임 추출 완료")
        
        # 5. 로고 탐지
        print("🔍 브랜드 로고 탐지 중...")
        detection_results = await logo_detection_service.detect_logos_in_frames(frames)
        
        # 6. 결과 요약
        print("📈 분석 결과 요약 중...")
        brand_analysis = await logo_detection_service.summarize_timeline(detection_results)
        
        # 7. 영상 정보 통합
        video_info = {
            **video_info_raw,
            "fps": video_file_info.get("fps", 30.0),
            "width": video_file_info.get("width", 1920),
            "height": video_file_info.get("height", 1080),
            "file_size": video_file_info.get("file_size", 0),
            "duration": video_file_info.get("duration", video_info_raw.get("length", 0)),
            "input_url": request.url
        }
        
        end_time = datetime.now()
        analysis_time = (end_time - start_time).total_seconds()
        
        detected_brands = len(brand_analysis)
        total_detections = sum(brand_data.get("appearances", 0) for brand_data in brand_analysis.values())
        
        print(f"✅ [YOUTUBE 분석] 완료: {analysis_time:.2f}초 - {detected_brands}개 브랜드, {total_detections}회 탐지")
        
        # 분석 결과 구성
        analysis_result = AnalysisResponse(
            video_info=video_info,
            brand_analysis=brand_analysis,
            total_analysis_time=analysis_time,
            timestamp=datetime.now().isoformat(),
            analysis_settings={
                "resolution": request.resolution,
                "frame_interval": request.frame_interval
            }
        )
        
        # 분석 결과 저장 (사용자 정보 포함)
        analysis_id = storage_service.save_analysis(analysis_result.dict(), "youtube", username)
        if analysis_id:
            print(f"💾 분석 결과 저장됨: {analysis_id} (사용자: {username})")
        
        return analysis_result
        
    except Exception as e:
        print(f"❌ YouTube 분석 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"분석 중 오류가 발생했습니다: {str(e)}")
    
    finally:
        # 항상 임시 파일 정리 (성공/실패 무관)
        if video_path and os.path.exists(video_path):
            try:
                os.remove(video_path)
                print("🗑️ 임시 파일 정리 완료")
            except Exception as cleanup_error:
                print(f"⚠️ 임시 파일 정리 실패: {cleanup_error}")

@app.post("/analyze/upload")
async def analyze_uploaded_video(file: UploadFile = File(...), username: str = None):
    """업로드된 영상 파일을 분석하여 브랜드 로고를 탐지합니다."""
    file_path = None  # finally에서 사용하기 위해 초기화
    try:
        start_time = datetime.now()
        
        print(f"📤 [업로드 분석] 요청받음: {file.filename} (사용자: {username})")
        
        # 파일 저장
        file_path = f"temp_{file.filename}"
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # 영상 분석
        video_info = await video_processing_service.get_video_info(file_path)
        frames = await video_processing_service.extract_frames(file_path)
        detection_results = await logo_detection_service.detect_logos_in_frames(frames)
        brand_analysis = await logo_detection_service.summarize_timeline(detection_results)
        
        end_time = datetime.now()
        analysis_time = (end_time - start_time).total_seconds()
        
        # 분석 결과 구성
        analysis_result = AnalysisResponse(
            video_info=video_info,
            brand_analysis=brand_analysis,
            total_analysis_time=analysis_time,
            timestamp=datetime.now().isoformat(),
            analysis_settings={
                "resolution": "original",
                "frame_interval": 0.5
            }
        )
        
        # 분석 결과 저장 (사용자 정보 포함)
        analysis_id = storage_service.save_analysis(analysis_result.dict(), "upload", username)
        if analysis_id:
            print(f"💾 업로드 분석 결과 저장됨: {analysis_id} (사용자: {username})")
        
        return analysis_result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"분석 중 오류가 발생했습니다: {str(e)}")
    
    finally:
        # 항상 임시 파일 정리 (성공/실패 무관)
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
                print("🗑️ 업로드 임시 파일 정리 완료")
            except Exception as cleanup_error:
                print(f"⚠️ 업로드 임시 파일 정리 실패: {cleanup_error}")

@app.get("/models/status")
async def get_model_status():
    """YOLO 모델 상태를 확인합니다."""
    return await logo_detection_service.get_model_status()

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/analysis/history")
async def get_analysis_history(limit: int = 20, username: str = None):
    """분석 히스토리를 조회합니다."""
    try:
        print(f"📊 [히스토리 조회] 사용자: {username}, 제한: {limit}")
        history = storage_service.get_analysis_history(limit, username)
        return {
            "status": "success",
            "data": history,
            "total": len(history)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"히스토리 조회 오류: {str(e)}")

@app.get("/analysis/statistics")
async def get_analysis_statistics():
    """분석 통계 요약을 조회합니다."""
    try:
        stats = storage_service.get_statistics_summary()
        return {
            "status": "success",
            "data": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"통계 조회 오류: {str(e)}")

@app.get("/analysis/{analysis_id}")
async def get_analysis_by_id(analysis_id: str, username: str = None):
    """특정 ID의 분석 결과를 조회합니다."""
    try:
        analysis = storage_service.get_analysis_by_id(analysis_id, username)
        if analysis:
            return {
                "status": "success",
                "data": analysis
            }
        else:
            raise HTTPException(status_code=404, detail="분석 결과를 찾을 수 없습니다.")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"분석 결과 조회 오류: {str(e)}")

@app.delete("/analysis/{analysis_id}")
async def delete_analysis(analysis_id: str, username: str = None):
    """특정 분석 결과를 삭제합니다."""
    try:
        print(f"🗑️ [삭제 요청] 분석 ID: {analysis_id}, 사용자: {username}")
        success = storage_service.delete_analysis(analysis_id, username)
        if success:
            return {
                "status": "success",
                "message": "분석 결과가 삭제되었습니다."
            }
        else:
            raise HTTPException(status_code=404, detail="삭제할 분석 결과를 찾을 수 없거나 권한이 없습니다.")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"분석 결과 삭제 오류: {str(e)}")

@app.post("/test/youtube")
async def test_youtube_analysis():
    """테스트용 유튜브 분석 엔드포인트"""
    try:
        start_time = datetime.now()
        
        print("🧪 [테스트 분석] 요청받음 - 빠른 데모 분석 시작")
        
        # 짧은 시뮬레이션 시간
        await asyncio.sleep(1)
        
        # 간단한 테스트 응답
        video_info = {
            "title": "🧪 테스트 모드 - 데모 영상",
            "author": "테스트 시스템",
            "duration": 30.0,
            "fps": 24.0,
            "width": 1280,
            "height": 720,
            "views": 12345,
            "description": "이것은 테스트 분석 결과입니다. 실제 YouTube 영상이 아닙니다.",
            "thumbnail_url": "https://via.placeholder.com/320x180/10b981/ffffff?text=TEST",
            "publish_date": "2024-01-01T00:00:00"
        }
        
        brand_analysis = {
            "starbucks": {
                "appearances": 3,
                "total_seconds": 5,
                "timestamps": [2.5, 12.0, 25.8],
                "average_confidence": 0.92,
                "max_confidence": 0.95,
                "confidence_scores": [0.89, 0.95, 0.92]
            },
            "mcdonalds": {
                "appearances": 2,
                "total_seconds": 3,
                "timestamps": [8.2, 18.5],
                "average_confidence": 0.88,
                "max_confidence": 0.91,
                "confidence_scores": [0.85, 0.91]
            }
        }
        
        end_time = datetime.now()
        analysis_time = (end_time - start_time).total_seconds()
        
        print(f"✅ [테스트 분석] 완료: {analysis_time:.2f}초 - 2개 브랜드 탐지 (Starbucks, McDonald's)")
        
        return AnalysisResponse(
            video_info=video_info,
            brand_analysis=brand_analysis,
            total_analysis_time=analysis_time,
            timestamp=datetime.now().isoformat()
        )
    except Exception as e:
        print(f"❌ 테스트 분석 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"테스트 분석 오류: {str(e)}")

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket 연결 엔드포인트 - 실시간 알림 수신용 (id 기준)"""
    await manager.connect(user_id, websocket)
    try:
        while True:
            # 클라이언트로부터 메시지 수신 (연결 유지용)
            data = await websocket.receive_text()
            # 필요시 메시지 처리 로직 추가
    except WebSocketDisconnect:
        manager.disconnect(user_id)
        print(f"🔌 WebSocket 연결 종료: {user_id}")

# 알림 API 엔드포인트
@app.post("/notifications/send")
async def send_notification(request: NotificationSendRequest):
    """알림 생성 및 전송"""
    try:
        # 알림 생성 및 저장
        notification = notification_service.create_notification(
            to_user=request.to_user,
            from_user=request.from_user,
            from_type=request.from_type,
            notification_type=request.type,
            message=request.message,
            data=request.data
        )
        
        # WebSocket을 통해 실시간 전송
        await manager.send_notification(request.to_user, notification)
        
        return {
            "status": "success",
            "message": "알림이 전송되었습니다.",
            "notification": notification
        }
    except Exception as e:
        print(f"❌ 알림 전송 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"알림 전송 실패: {str(e)}")

@app.get("/notifications")
async def get_notifications(username: str, limit: int = 20, unread_only: bool = False):
    """사용자의 알림 목록 조회"""
    try:
        notifications = notification_service.get_user_notifications(
            username=username,
            limit=limit,
            unread_only=unread_only
        )
        unread_count = notification_service.get_unread_count(username)
        
        return {
            "status": "success",
            "data": notifications,
            "unread_count": unread_count,
            "total": len(notifications)
        }
    except Exception as e:
        print(f"❌ 알림 조회 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"알림 조회 실패: {str(e)}")

@app.put("/notifications/{notification_id}/read")
async def mark_notification_as_read(notification_id: str, username: str):
    """알림을 읽음으로 표시"""
    try:
        success = notification_service.mark_as_read(username, notification_id)
        if success:
            return {
                "status": "success",
                "message": "알림이 읽음 처리되었습니다."
            }
        else:
            raise HTTPException(status_code=404, detail="알림을 찾을 수 없습니다.")
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 알림 읽음 처리 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"알림 읽음 처리 실패: {str(e)}")

@app.put("/notifications/read-all")
async def mark_all_notifications_as_read(username: str):
    """모든 알림을 읽음으로 표시"""
    try:
        count = notification_service.mark_all_as_read(username)
        return {
            "status": "success",
            "message": f"{count}개의 알림이 읽음 처리되었습니다.",
            "count": count
        }
    except Exception as e:
        print(f"❌ 모든 알림 읽음 처리 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"모든 알림 읽음 처리 실패: {str(e)}")

@app.delete("/notifications/{notification_id}")
async def delete_notification(notification_id: str, username: str):
    """알림 삭제"""
    try:
        success = notification_service.delete_notification(username, notification_id)
        if success:
            return {
                "status": "success",
                "message": "알림이 삭제되었습니다."
            }
        else:
            raise HTTPException(status_code=404, detail="알림을 찾을 수 없습니다.")
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 알림 삭제 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"알림 삭제 실패: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 