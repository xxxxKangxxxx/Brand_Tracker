#!/usr/bin/env python3
"""
브랜드 추적 시스템 대시보드 실행 스크립트
"""

import os
import sys
import subprocess

def main():
    """Streamlit 대시보드를 실행합니다."""
    print("🎨 브랜드 추적 시스템 대시보드를 시작합니다...")
    print("🌐 대시보드 URL: http://localhost:8501")
    print("⏹️  종료하려면 Ctrl+C를 누르세요")
    print("-" * 50)
    
    try:
        # Streamlit 앱 실행
        subprocess.run([
            sys.executable, "-m", "streamlit", "run", 
            "dashboard/main.py",
            "--server.port=8501",
            "--server.headless=true",
            "--browser.gatherUsageStats=false"
        ])
    except KeyboardInterrupt:
        print("\n👋 대시보드를 종료합니다.")
    except Exception as e:
        print(f"❌ 대시보드 실행 중 오류가 발생했습니다: {e}")
        sys.exit(1)

 