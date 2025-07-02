#!/usr/bin/env python3
"""
브랜드 추적 시스템 백엔드 실행 스크립트
"""

import os
import sys
import uvicorn

# 현재 디렉토리를 Python 경로에 추가
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def main():
    """백엔드 서버를 실행합니다."""
    print("🚀 브랜드 추적 시스템 백엔드를 시작합니다...")
    print("📍 API 문서: http://localhost:8000/docs")
    print("🔗 Health Check: http://localhost:8000/health")
    print("⏹️  종료하려면 Ctrl+C를 누르세요")
    print("-" * 50)
    
    try:
        # FastAPI 서버 실행
        uvicorn.run(
            "backend.main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            reload_dirs=["backend"],
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n👋 백엔드 서버를 종료합니다.")
    except Exception as e:
        print(f"❌ 서버 실행 중 오류가 발생했습니다: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 