#!/usr/bin/env python3
"""
React 프론트엔드 실행 스크립트
"""

import subprocess
import sys
import os

def check_node_installed():
    """Node.js가 설치되어 있는지 확인합니다."""
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Node.js 버전: {result.stdout.strip()}")
            return True
        else:
            return False
    except FileNotFoundError:
        return False

def check_npm_installed():
    """npm이 설치되어 있는지 확인합니다."""
    try:
        result = subprocess.run(['npm', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ npm 버전: {result.stdout.strip()}")
            return True
        else:
            return False
    except FileNotFoundError:
        return False

def install_dependencies():
    """npm 패키지를 설치합니다."""
    print("📦 npm 패키지 설치 중...")
    try:
        result = subprocess.run(['npm', 'install'], cwd='frontend', check=True)
        print("✅ 패키지 설치 완료!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ 패키지 설치 실패: {e}")
        return False
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        return False

def start_frontend():
    """React 개발 서버를 시작합니다."""
    print("🚀 React 개발 서버 시작 중...")
    try:
        # React 개발 서버 시작 (포트 3001)
        subprocess.run(['npm', 'start'], cwd='frontend', check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ 프론트엔드 시작 실패: {e}")
        return False
    except KeyboardInterrupt:
        print("\n⏹️ 프론트엔드 서버가 중지되었습니다.")
        return True
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        return False

def main():
    print("🎨 Brand Tracker - React 프론트엔드 실행")
    print("=" * 50)
    
    # Node.js 설치 확인
    if not check_node_installed():
        print("❌ Node.js가 설치되어 있지 않습니다.")
        print("   https://nodejs.org/ 에서 Node.js를 설치해주세요.")
        sys.exit(1)
    
    # npm 설치 확인
    if not check_npm_installed():
        print("❌ npm이 설치되어 있지 않습니다.")
        print("   Node.js와 함께 npm을 설치해주세요.")
        sys.exit(1)
    
    # frontend 디렉토리 확인
    if not os.path.exists('frontend'):
        print("❌ frontend 디렉토리를 찾을 수 없습니다.")
        sys.exit(1)
    
    # package.json 확인
    if not os.path.exists('frontend/package.json'):
        print("❌ frontend/package.json 파일을 찾을 수 없습니다.")
        sys.exit(1)
    
    # node_modules 확인 및 설치
    if not os.path.exists('frontend/node_modules'):
        print("📦 node_modules가 없습니다. 패키지를 설치합니다...")
        if not install_dependencies():
            sys.exit(1)
    else:
        print("✅ node_modules 존재함")
    
    print("\n🌟 프론트엔드 서버 정보:")
    print("   - URL: http://localhost:3001")
    print("   - 백엔드와 자동 연결: http://localhost:8000")
    print("\n⚠️  주의: 백엔드 서버(run_backend.py)가 먼저 실행되어야 합니다!")
    print("\n🔥 Ctrl+C로 서버를 중지할 수 있습니다.")
    print("=" * 50)
    
    # 프론트엔드 시작
    start_frontend()

if __name__ == "__main__":
    main() 