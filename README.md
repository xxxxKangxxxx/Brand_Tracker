# 🎥 브랜드 자동 추적 시스템

TV 광고나 유튜브 영상 속 브랜드 자동 추적 및 분석 시스템입니다.

## 📋 서비스 개요

### 주요 기능
- 🎥 **입력**: 유튜브 영상 또는 TV 광고 영상 파일 (.mp4, .mov 등)
- 🔍 **처리**: 영상 프레임마다 YOLO 모델로 로고 탐지
- 🕒 **출력**: 로고 등장 타임라인 + 총 등장 시간 + 노출 횟수
- 📊 **활용**: 광고 성과 리포트, PPL 분석, 브랜드 모니터링

### 처리 흐름
```
[영상 파일] → [프레임 추출] → [YOLO 로고 탐지] → [브랜드 등장 시간 기록] → [요약 리포트]
```

## 🏗️ 시스템 구조

```
├── backend/                 # FastAPI 백엔드
│   ├── main.py             # API 메인 서버
│   └── services/           # 비즈니스 로직
│       ├── youtube_service.py
│       ├── logo_detection_service.py
│       └── video_processing_service.py
├── frontend/               # React 프론트엔드
│   ├── src/
│   │   ├── components/     # React 컴포넌트
│   │   ├── App.js         # 메인 앱
│   │   └── index.js       # 엔트리 포인트
│   ├── package.json       # npm 의존성
│   └── public/            # 정적 파일
├── models/                # YOLO 모델 파일
├── requirements.txt       # Python 의존성 패키지
├── run_backend.py        # 백엔드 실행 스크립트
└── run_frontend.py       # React 프론트엔드 실행 스크립트
```

## 🚀 설치 및 실행

### 1. 의존성 설치
```bash
# Python 의존성 설치
pip install -r requirements.txt

# 프론트엔드 의존성 설치
cd frontend
npm install
cd ..
```

### 2. 학습한 YOLO 모델 설정 (선택사항)
```bash
# 학습한 모델 파일을 시스템에 설정
python setup_model.py /path/to/your/trained_model.pt

# 사용 가능한 모델 목록 확인
python setup_model.py list
```

### 3. 백엔드 서버 실행
```bash
python run_backend.py
```
- API 문서: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

### 4. 프론트엔드 실행 (새 터미널)
```bash
python run_frontend.py
```
- React 대시보드: http://localhost:3001
- 현대적인 UI/UX, 반응형 디자인
- 다크 테마, 애니메이션 효과

## 📊 사용법

### 1. 유튜브 영상 분석
1. 대시보드에서 "유튜브 영상" 탭 선택
2. 유튜브 URL 입력
3. 해상도 및 프레임 추출 간격 설정
4. "분석 시작" 버튼 클릭

### 2. 파일 업로드 분석
1. "파일 업로드" 탭 선택
2. 영상 파일 업로드 (MP4, MOV, AVI, MKV)
3. "분석 시작" 버튼 클릭

### 3. 결과 확인
- 📈 **시각화**: 브랜드별 등장 횟수, 노출 시간 비율, 신뢰도 분석
- ⏰ **타임라인**: 브랜드 등장 시점 시각화
- 💾 **다운로드**: JSON, CSV 형식으로 결과 저장

## 🔧 API 엔드포인트

### POST `/analyze/youtube`
유튜브 영상 분석
```json
{
  "url": "https://www.youtube.com/watch?v=...",
  "resolution": "360p",
  "frame_interval": 1
}
```

### POST `/analyze/upload`
업로드된 파일 분석
- 파일을 multipart/form-data로 전송

### GET `/models/status`
YOLO 모델 상태 확인

### GET `/health`
서버 상태 확인

## 📊 출력 예시

```json
{
  "video_info": {
    "duration": 30.5,
    "fps": 30.0,
    "width": 1280,
    "height": 720
  },
  "brand_analysis": {
    "coca-cola": {
      "appearances": 5,
      "total_seconds": 5,
      "timestamps": [2.0, 3.0, 4.0, 5.0, 6.0],
      "average_confidence": 0.85,
      "max_confidence": 0.92
    },
    "samsung": {
      "appearances": 2,
      "total_seconds": 2,
      "timestamps": [18.0, 19.0],
      "average_confidence": 0.78,
      "max_confidence": 0.83
    }
  },
  "total_analysis_time": 45.2,
  "timestamp": "2024-01-01T12:00:00"
}
```

## 🎯 지원 브랜드

현재 탐지 가능한 브랜드:
- Coca-Cola
- Pepsi
- Samsung
- Apple
- Nike
- Adidas
- LG
- McDonald's
- KFC
- Starbucks

## ⚙️ 설정 옵션

### 영상 해상도
- 360p (기본값, 빠른 처리)
- 480p
- 720p
- 1080p (고화질, 느린 처리)

### 프레임 추출 간격
- 1초 (기본값, 정밀 분석)
- 2-10초 (빠른 처리)

### 신뢰도 임계값
- 기본값: 0.5
- 범위: 0.1 - 1.0

## ✨ React 프론트엔드 특징

### 🎨 모던 UI/UX
- **다크 테마**: 보라색-파란색 그라데이션 배경
- **글래스 효과**: 반투명 배경과 블러 효과
- **카드형 레이아웃**: 메트릭과 차트를 카드로 구성
- **애니메이션**: Framer Motion을 활용한 부드러운 전환

### 📊 인터랙티브 차트
- **Recharts 라이브러리**: 반응형 차트
- **브랜드별 분석**: 바 차트, 파이 차트
- **타임라인 시각화**: 시간별 브랜드 등장 패턴
- **실시간 업데이트**: 분석 진행 상황 표시

### ⚡ 성능 최적화
- **React 18**: 최신 React 버전
- **컴포넌트 기반**: 재사용 가능한 모듈화
- **반응형 디자인**: 모바일/태블릿 지원

## 🔮 향후 확장 계획

- 🧩 **대시보드 고도화**: 실시간 분석 진행률, 상세 통계
- 🎞️ **영상 구간 분석**: 특정 시간대만 분석
- 📤 **리포트 다양화**: PDF, Excel 형식 지원
- 🧠 **PPL 분석**: OCR 연계로 제품명 추출
- 🤖 **커스텀 모델**: 특정 브랜드 전용 모델 훈련
- 🌐 **PWA 지원**: 모바일 앱처럼 사용 가능

## 🛠️ 개발 환경

### 백엔드
- Python 3.8+
- FastAPI
- YOLO v8
- OpenCV
- yt-dlp (유튜브 다운로드)

### 프론트엔드
- React 18
- Framer Motion (애니메이션)
- Recharts (차트)
- Lucide React (아이콘)
- Axios (HTTP 클라이언트)

### 기존 대시보드
- Streamlit
- Plotly

## 📝 라이센스

MIT License

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch
3. Commit your Changes
4. Push to the Branch
5. Open a Pull Request

---

**⚠️ 주의사항**
- 실제 운영 환경에서는 커스텀 로고 탐지 모델이 필요합니다
- 현재는 데모용으로 일반 YOLO 모델을 사용합니다
- 유튜브 영상 다운로드 시 저작권을 준수해 주세요 