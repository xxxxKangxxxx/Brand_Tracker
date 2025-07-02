#!/usr/bin/env python3
"""
YOLO 모델 설정 유틸리티
학습한 모델을 브랜드 추적 시스템에 적용하는 스크립트
"""

import os
import shutil
import sys
from ultralytics import YOLO

def setup_model(source_model_path: str, target_name: str = "logo_detection.pt"):
    """
    학습한 모델을 시스템에 설정합니다.
    
    Args:
        source_model_path: 학습한 모델 파일 경로
        target_name: 대상 모델 파일명 (기본값: logo_detection.pt)
    """
    
    # 1. 모델 파일 존재 확인
    if not os.path.exists(source_model_path):
        print(f"❌ 모델 파일을 찾을 수 없습니다: {source_model_path}")
        return False
    
    # 2. models 디렉토리 생성
    models_dir = "models"
    os.makedirs(models_dir, exist_ok=True)
    
    # 3. 모델 파일 복사
    target_path = os.path.join(models_dir, target_name)
    try:
        shutil.copy2(source_model_path, target_path)
        print(f"✅ 모델 파일 복사 완료: {source_model_path} → {target_path}")
    except Exception as e:
        print(f"❌ 모델 파일 복사 실패: {e}")
        return False
    
    # 4. 모델 정보 확인
    try:
        model = YOLO(target_path)
        print(f"\n📋 모델 정보:")
        print(f"  파일 크기: {os.path.getsize(target_path) / (1024*1024):.1f} MB")
        
        if hasattr(model, 'names'):
            print(f"  클래스 개수: {len(model.names)}")
            print(f"  클래스 목록:")
            for class_id, class_name in model.names.items():
                print(f"    {class_id}: {class_name}")
        else:
            print("  ⚠️ 클래스 정보를 찾을 수 없습니다.")
            
        print(f"\n🎯 모델 설정이 완료되었습니다!")
        print(f"이제 백엔드를 실행하면 커스텀 모델이 사용됩니다.")
        
    except Exception as e:
        print(f"❌ 모델 로드 테스트 실패: {e}")
        return False
    
    return True

def list_available_models():
    """사용 가능한 모델 목록을 표시합니다."""
    models_dir = "models"
    
    if not os.path.exists(models_dir):
        print("📁 models 디렉토리가 없습니다.")
        return
    
    model_files = [f for f in os.listdir(models_dir) if f.endswith('.pt')]
    
    if not model_files:
        print("📁 models 디렉토리에 .pt 파일이 없습니다.")
        return
    
    print("📋 사용 가능한 모델:")
    for i, model_file in enumerate(model_files, 1):
        model_path = os.path.join(models_dir, model_file)
        size_mb = os.path.getsize(model_path) / (1024*1024)
        print(f"  {i}. {model_file} ({size_mb:.1f} MB)")

def main():
    print("🎯 YOLO 모델 설정 유틸리티")
    print("=" * 50)
    
    if len(sys.argv) < 2:
        print("사용법:")
        print("  python setup_model.py <모델_파일_경로>")
        print("  python setup_model.py list  # 사용 가능한 모델 목록")
        print("\n예시:")
        print("  python setup_model.py /path/to/your/trained_model.pt")
        print("  python setup_model.py ../my_models/logo_detection_v2.pt")
        return
    
    command = sys.argv[1]
    
    if command == "list":
        list_available_models()
    elif os.path.exists(command):
        # 모델 파일 경로가 주어진 경우
        setup_model(command)
    else:
        print(f"❌ 파일을 찾을 수 없습니다: {command}")

if __name__ == "__main__":
    main() 