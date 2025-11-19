# 🎯 AdLens - AI 광고 영상 분석 플랫폼

> AI 기반 영상 내 브랜드 자동 탐지 및 분석 솔루션

**AdLens**는 유튜브 영상이나 광고 영상 속 브랜드를 자동으로 탐지하고 분석하는 AI 플랫폼입니다. 크리에이터는 자신의 강점을 분석하고, 기업은 적합한 크리에이터를 찾아 광고 성과를 분석할 수 있습니다.

## 📋 목차

- [주요 기능](#-주요-기능)
- [시스템 구조](#️-시스템-구조)
- [설치 및 실행](#-설치-및-실행)
- [사용자 가이드](#-사용자-가이드)
- [API 문서](#-api-문서)
- [기술 스택](#-기술-스택)
- [향후 계획](#-향후-계획)

---

## ✨ 주요 기능

### 👤 크리에이터 기능
- **프로필 관리**: 6대 맞춤 카테고리 분석 및 시각화
- **자기소개서**: 크리에이터 강점 어필 및 기업 노출
- **활동 분석**: 영상 업로드, 브랜드 협업 현황
- **마일리지 시스템**: 활동에 따른 포인트 적립

### 🏢 기업 기능
- **크리에이터 검색**: 카테고리, 팔로워 수 기반 필터링
- **브랜드 추적 대시보드**: 
  - 영상 내 브랜드 자동 탐지 (YOLO 기반)
  - 브랜드별 노출 시간, 등장 횟수, 신뢰도 분석
  - 타임라인 시각화 및 리포트 생성
- **영상 분석**:
  - 유튜브 URL 분석
  - 직접 파일 업로드 (MP4, MOV, AVI, MKV)
- **분석 히스토리**: 과거 분석 결과 저장 및 조회

### 🔐 인증 및 권한 관리
- 회원가입 시 크리에이터/기업 선택
- JWT 기반 인증
- 사용자 타입별 라우팅 및 권한 관리

---

## 🏗️ 시스템 구조

```
AdLens/
├── frontend/                    # React 프론트엔드
│   ├── src/
│   │   ├── components/          # 재사용 컴포넌트
│   │   │   ├── Dashboard.js     # 브랜드 추적 대시보드
│   │   │   ├── AnalysisPanel.js # 영상 분석 패널
│   │   │   ├── CompanySidebar.js # 기업용 사이드바
│   │   │   ├── CreatorCard.js   # 크리에이터 카드
│   │   │   ├── HexagonChart.js  # 6각형 차트
│   │   │   ├── MetricCard.js    # 메트릭 카드
│   │   │   └── ...
│   │   ├── pages/               # 페이지 컴포넌트
│   │   │   ├── LoginPage.js     # 로그인
│   │   │   ├── RegisterPage.js  # 회원가입
│   │   │   ├── CreatorDashboard.js # 크리에이터 대시보드
│   │   │   ├── CompanyPage.js   # 기업 메인 페이지
│   │   │   └── ...
│   │   ├── contexts/
│   │   │   └── AuthContext.js   # 인증 컨텍스트
│   │   ├── App.js               # 라우팅 설정
│   │   └── index.js             # 엔트리 포인트
│   ├── public/
│   │   ├── profile_*.jpg        # 크리에이터 프로필 이미지
│   │   └── ...
│   └── package.json
│
├── backend/                     # FastAPI 백엔드
│   ├── main.py                  # API 메인 서버
│   └── services/                # 비즈니스 로직
│       ├── youtube_service.py         # 유튜브 영상 다운로드
│       ├── logo_detection_service.py  # YOLO 기반 로고 탐지
│       ├── video_processing_service.py # 영상 처리
│       └── analysis_storage_service.py # 분석 결과 저장
│
├── models/                      # AI 모델
│   ├── logo_detection.pt        # YOLO 로고 탐지 모델
│   └── best.pt
│
├── data/                        # 학습 데이터셋
│   └── OpenLogo.v2i.yolov11/
│
├── analysis_results/            # 분석 결과 저장소
│   └── analysis_history.json
│
├── users.json                   # 사용자 정보 (개발용)
├── requirements.txt             # Python 의존성
├── run_backend.py              # 백엔드 실행 스크립트
└── run_frontend.py             # 프론트엔드 실행 스크립트
```

---

## 🚀 설치 및 실행

### 사전 요구사항
- Python 3.8+
- Node.js 14+
- npm 또는 yarn

### 1️⃣ 프로젝트 클론
```bash
git clone <repository-url>
cd Image_segmentation
```

### 2️⃣ Python 가상환경 설정 및 의존성 설치
```bash
# 가상환경 생성
python -m venv venv

# 가상환경 활성화 (Mac/Linux)
source venv/bin/activate

# 가상환경 활성화 (Windows)
venv\Scripts\activate

# Python 패키지 설치
pip install -r requirements.txt
```

### 3️⃣ 프론트엔드 의존성 설치
```bash
cd frontend
npm install
cd ..
```

### 4️⃣ YOLO 모델 설정 (선택사항)
```bash
# 학습된 모델 파일을 models/ 디렉토리에 배치
python setup_model.py /path/to/your/trained_model.pt

# 사용 가능한 모델 목록 확인
python setup_model.py list
```

### 5️⃣ 백엔드 서버 실행
```bash
python run_backend.py
```
- 🌐 API 서버: http://localhost:8000
- 📚 API 문서: http://localhost:8000/docs
- ✅ Health Check: http://localhost:8000/health

### 6️⃣ 프론트엔드 실행 (새 터미널)
```bash
python run_frontend.py
```
- 🎨 웹 애플리케이션: http://localhost:3001

---

## 📖 사용자 가이드

### 회원가입 및 로그인

1. **회원가입**
   - http://localhost:3001 접속
   - "회원가입" 링크 클릭
   - 크리에이터 또는 기업 선택
   - 아이디, 비밀번호 입력 후 가입

2. **로그인**
   - 아이디와 비밀번호 입력
   - 사용자 타입에 따라 자동으로 대시보드로 이동

### 크리에이터 사용법

1. **대시보드 확인**
   - 기본 정보 (이름, 이메일, 멤버십)
   - 6대 맞춤 카테고리 차트
   - 활동 현황 및 브랜드 분석

2. **프로필 관리**
   - 자기소개서 작성
   - AI 기반 분석 결과 확인
   - 취득 마일리지 조회

### 기업 사용법

#### 📍 크리에이터 검색
1. 좌측 사이드바에서 "Find Creators" 선택 (기본 화면)
2. 상단 검색바에서 크리에이터 검색
3. 필터링 옵션 활용:
   - 카테고리 (Beauty, Fashion, Lifestyle 등)
   - 팔로워 범위 (10k ~ 10M)
4. 크리에이터 카드에서 상세 정보 확인

#### 📊 브랜드 추적 대시보드
1. 좌측 사이드바에서 "Dashboard" 선택
2. 우측 상단 "영상 분석하기" 버튼 클릭
3. 분석 결과 확인:
   - 메트릭 카드 (분석된 영상, 탐지된 브랜드, 분석 시간, 평균 신뢰도)
   - 브랜드별 노출 분석 차트
   - 브랜드 등장 타임라인
   - 분석 요약 정보

#### 🎬 영상 분석
1. **유튜브 영상 분석**
   - "유튜브 영상" 탭 선택
   - 유튜브 URL 입력
   - 해상도 및 프레임 추출 간격 설정
   - "분석 시작" 버튼 클릭

2. **파일 업로드 분석**
   - "파일 업로드" 탭 선택
   - 영상 파일 드래그 앤 드롭 또는 선택
   - 지원 형식: MP4, MOV, AVI, MKV
   - "분석 시작" 버튼 클릭

3. **설정 옵션**
   - 해상도: 360p ~ 1080p
   - 프레임 간격: 0.5초 ~ 10초
   - 신뢰도 임계값: 0.1 ~ 1.0

4. **결과 확인 및 다운로드**
   - 브랜드별 상세 분석 클릭
   - JSON/CSV 형식으로 결과 다운로드
   - 분석 히스토리에서 과거 결과 조회

---

## 🔌 API 문서

### 인증 API

#### POST `/auth/register`
사용자 회원가입
```json
{
  "username": "user@example.com",
  "password": "password123",
  "user_type": "creator" // or "company"
}
```

#### POST `/auth/login`
사용자 로그인
```json
{
  "username": "user@example.com",
  "password": "password123"
}
```

**응답:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "username": "user@example.com",
    "user_type": "creator"
  }
}
```

### 영상 분석 API

#### POST `/analyze/youtube`
유튜브 영상 분석
```json
{
  "url": "https://www.youtube.com/watch?v=...",
  "resolution": "360p",
  "frame_interval": 1.0
}
```

#### POST `/analyze/upload`
파일 업로드 분석
- Content-Type: multipart/form-data
- 파일: video file

**응답 예시:**
```json
{
  "id": "unique_analysis_id",
  "video_info": {
    "duration": 30.5,
    "fps": 30.0,
    "width": 1280,
    "height": 720
  },
  "brand_analysis": {
    "coca-cola": {
      "appearances": 5,
      "total_seconds": 5.0,
      "timestamps": [2.0, 3.0, 4.0, 5.0, 6.0],
      "average_confidence": 0.85,
      "max_confidence": 0.92
    }
  },
  "total_analysis_time": 45.2,
  "timestamp": "2025-01-01T12:00:00"
}
```

#### GET `/analysis/history`
분석 히스토리 조회
- Query params: `limit` (기본값: 20)

#### DELETE `/analysis/{analysis_id}`
분석 결과 삭제

#### GET `/models/status`
YOLO 모델 상태 확인

#### GET `/health`
서버 상태 확인

---

## 🛠 기술 스택

### Frontend
| 기술 | 버전 | 용도 |
|-----|------|------|
| React | 18.x | UI 프레임워크 |
| React Router | 6.x | 클라이언트 사이드 라우팅 |
| Framer Motion | 10.x | 애니메이션 |
| Recharts | 2.x | 차트 시각화 |
| Lucide React | - | 아이콘 |
| Axios | 1.x | HTTP 클라이언트 |

### Backend
| 기술 | 버전 | 용도 |
|-----|------|------|
| Python | 3.8+ | 백엔드 언어 |
| FastAPI | 0.100+ | REST API 프레임워크 |
| Ultralytics YOLO | 8.x | 객체 탐지 모델 |
| OpenCV | 4.x | 영상 처리 |
| yt-dlp | - | 유튜브 다운로드 |

### AI/ML
- **YOLO v8/v11**: 로고 탐지 모델
- **OpenLogo Dataset**: 로고 학습 데이터셋 (10개 브랜드)

---

## 🎯 탐지 가능 브랜드

현재 시스템에서 탐지 가능한 브랜드:
- ✅ Coca-Cola
- ✅ Pepsi
- ✅ Samsung
- ✅ Apple
- ✅ Nike
- ✅ Adidas
- ✅ LG
- ✅ McDonald's
- ✅ KFC
- ✅ Starbucks

> 💡 **커스텀 브랜드 추가**: `data/` 디렉토리에 학습 데이터를 추가하고 모델을 재훈련하여 새로운 브랜드를 탐지할 수 있습니다.

---

## 🔮 향후 계획

### 단기 계획 (1-2개월)
- [ ] YouTube Data API 연동으로 크리에이터 실시간 정보 수집
- [ ] 크리에이터 자기소개서 기능 완성
- [ ] 기업-크리에이터 매칭 시스템
- [ ] 실시간 분석 진행률 표시

### 중기 계획 (3-6개월)
- [ ] 영상 구간별 분석 기능
- [ ] PDF/Excel 리포트 생성
- [ ] OCR 연동으로 제품명 텍스트 추출
- [ ] 결제 시스템 (Pro/Enterprise 멤버십)
- [ ] 관리자 대시보드

### 장기 계획 (6개월 이상)
- [ ] 모바일 앱 (React Native)
- [ ] 커스텀 브랜드 모델 훈련 서비스
- [ ] 다국어 지원
- [ ] 실시간 스트리밍 분석
- [ ] 광고 성과 예측 AI

---

## 🎨 UI/UX 특징

### 디자인 시스템
- **색상**: 보라색-파란색 그라디언트 (`#667eea` → `#764ba2`)
- **배경**: 밝은 회색 (`#f8f9fa`)
- **카드**: 불투명 흰색 배경 + 미세한 그림자
- **폰트**: Inter (Google Fonts)

### 애니메이션
- **페이지 전환**: Framer Motion의 부드러운 fade/slide
- **호버 효과**: 카드 lift, 버튼 transform
- **로딩**: 커스텀 스피너 및 인디케이터

### 반응형
- 데스크톱 (1024px+): 전체 기능
- 태블릿 (768px-1024px): 조정된 레이아웃
- 모바일 (< 768px): 모바일 최적화 UI

---

## 📄 라이센스

MIT License

Copyright (c) 2025 AdLens

---

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## ⚠️ 주의사항

- **모델 학습**: 실제 운영 환경에서는 충분한 데이터로 학습된 커스텀 모델이 필요합니다.
- **저작권**: 유튜브 영상 다운로드 시 저작권을 준수해 주세요.
- **개발 모드**: `users.json`은 개발용입니다. 프로덕션에서는 데이터베이스를 사용하세요.
- **보안**: JWT 시크릿 키를 환경 변수로 관리하세요.

---

## 📞 문의

프로젝트 관련 문의사항이 있으시면 Issue를 등록해 주세요.

**⭐️ 이 프로젝트가 도움이 되었다면 Star를 눌러주세요!**
