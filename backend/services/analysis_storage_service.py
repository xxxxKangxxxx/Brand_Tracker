import json
import os
from datetime import datetime
from typing import Dict, List, Optional
import uuid

class AnalysisStorageService:
    def __init__(self):
        self.storage_dir = "analysis_results"
        self.storage_file = os.path.join(self.storage_dir, "analysis_history.json")
        self._ensure_storage_exists()
    
    def _ensure_storage_exists(self):
        """저장 디렉토리와 파일이 존재하는지 확인하고 생성합니다."""
        os.makedirs(self.storage_dir, exist_ok=True)
        
        if not os.path.exists(self.storage_file):
            initial_data = {
                "analyses": [],
                "metadata": {
                    "total_analyses": 0,
                    "created_at": datetime.now().isoformat(),
                    "last_updated": datetime.now().isoformat()
                }
            }
            self._save_data(initial_data)
    
    def _load_data(self) -> Dict:
        """저장된 데이터를 로드합니다."""
        try:
            with open(self.storage_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"데이터 로드 오류: {str(e)}")
            return {
                "analyses": [],
                "metadata": {
                    "total_analyses": 0,
                    "created_at": datetime.now().isoformat(),
                    "last_updated": datetime.now().isoformat()
                }
            }
    
    def _save_data(self, data: Dict):
        """데이터를 파일에 저장합니다."""
        try:
            with open(self.storage_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"데이터 저장 오류: {str(e)}")
    
    def save_analysis(self, analysis_data: Dict, analysis_type: str = "youtube", username: str = None) -> str:
        """분석 결과를 저장합니다.
        
        Args:
            analysis_data: 분석 결과 데이터
            analysis_type: 분석 타입 (youtube, upload)
            username: 사용자 id (이메일) - username 필드에 저장됨
        """
        try:
            data = self._load_data()
            
            # 고유 ID 생성
            analysis_id = str(uuid.uuid4())
            
            # 분석 결과 데이터 구성
            analysis_record = {
                "id": analysis_id,
                "username": username,  # 사용자 id (이메일) 저장 - users.json의 id와 일치해야 함
                "type": analysis_type,
                "timestamp": datetime.now().isoformat(),
                "video_info": analysis_data.get("video_info", {}),
                "brand_analysis": analysis_data.get("brand_analysis", {}),
                "total_analysis_time": analysis_data.get("total_analysis_time", 0),
                "statistics": self._calculate_statistics(analysis_data.get("brand_analysis", {})),
                "analysis_settings": analysis_data.get("analysis_settings", {})
            }
            
            # 새 분석 결과 추가
            data["analyses"].append(analysis_record)
            
            # 메타데이터 업데이트
            data["metadata"]["total_analyses"] = len(data["analyses"])
            data["metadata"]["last_updated"] = datetime.now().isoformat()
            
            # 최근 100개만 유지 (용량 관리)
            if len(data["analyses"]) > 100:
                data["analyses"] = data["analyses"][-100:]
                data["metadata"]["total_analyses"] = 100
            
            # 저장
            self._save_data(data)
            
            print(f"💾 분석 결과 저장 완료: {analysis_id} (사용자: {username})")
            return analysis_id
            
        except Exception as e:
            print(f"분석 결과 저장 오류: {str(e)}")
            return None
    
    def _calculate_statistics(self, brand_analysis: Dict) -> Dict:
        """브랜드 분석 결과의 통계를 계산합니다."""
        if not brand_analysis:
            return {}
        
        total_brands = len(brand_analysis)
        total_appearances = sum(brand.get("appearances", 0) for brand in brand_analysis.values())
        total_seconds = sum(brand.get("total_seconds", 0) for brand in brand_analysis.values())
        
        # 가장 많이 탐지된 브랜드
        most_detected = max(brand_analysis.items(), key=lambda x: x[1].get("appearances", 0)) if brand_analysis else None
        
        # 평균 신뢰도
        all_confidences = []
        for brand_data in brand_analysis.values():
            all_confidences.extend(brand_data.get("confidence_scores", []))
        
        avg_confidence = sum(all_confidences) / len(all_confidences) if all_confidences else 0
        
        return {
            "total_brands_detected": total_brands,
            "total_appearances": total_appearances,
            "total_detection_seconds": total_seconds,
            "most_detected_brand": {
                "name": most_detected[0] if most_detected else None,
                "appearances": most_detected[1].get("appearances", 0) if most_detected else 0
            },
            "average_confidence": round(avg_confidence, 3)
        }
    
    def get_analysis_history(self, limit: int = 20, username: str = None) -> List[Dict]:
        """분석 히스토리를 가져옵니다.
        
        Args:
            limit: 반환할 최대 개수
            username: 사용자 id (이메일) - username 필드에 id가 저장되어 있음
        """
        try:
            data = self._load_data()
            analyses = data.get("analyses", [])
            
            # 사용자별 필터링 (username 필드에 실제로는 id가 저장됨)
            if username:
                analyses = [analysis for analysis in analyses if analysis.get("username") == username]
                print(f"📊 사용자 id '{username}'의 분석 결과: {len(analyses)}개")
            
            # 최신순으로 정렬하여 반환
            return sorted(analyses, key=lambda x: x["timestamp"], reverse=True)[:limit]
            
        except Exception as e:
            print(f"히스토리 조회 오류: {str(e)}")
            return []
    
    def get_analysis_by_id(self, analysis_id: str, username: str = None) -> Optional[Dict]:
        """특정 ID의 분석 결과를 가져옵니다."""
        try:
            data = self._load_data()
            analyses = data.get("analyses", [])
            
            for analysis in analyses:
                if analysis["id"] == analysis_id:
                    # 사용자 검증 (username이 제공된 경우)
                    if username and analysis.get("username") != username:
                        print(f"⚠️ 권한 없음: 사용자 '{username}'이 '{analysis_id}' 접근 시도")
                        return None
                    return analysis
            
            return None
            
        except Exception as e:
            print(f"분석 결과 조회 오류: {str(e)}")
            return None
    
    def get_statistics_summary(self) -> Dict:
        """전체 분석 통계 요약을 가져옵니다."""
        try:
            data = self._load_data()
            analyses = data.get("analyses", [])
            
            if not analyses:
                return {
                    "total_analyses": 0,
                    "total_videos_analyzed": 0,
                    "total_brands_detected": 0,
                    "most_common_brands": [],
                    "average_analysis_time": 0
                }
            
            # 브랜드별 통계
            brand_counts = {}
            total_analysis_time = 0
            
            for analysis in analyses:
                total_analysis_time += analysis.get("total_analysis_time", 0)
                
                for brand_name, brand_data in analysis.get("brand_analysis", {}).items():
                    if brand_name not in brand_counts:
                        brand_counts[brand_name] = 0
                    brand_counts[brand_name] += brand_data.get("appearances", 0)
            
            # 가장 많이 탐지된 브랜드 순으로 정렬
            most_common_brands = sorted(brand_counts.items(), key=lambda x: x[1], reverse=True)[:10]
            
            return {
                "total_analyses": len(analyses),
                "total_videos_analyzed": len(analyses),
                "total_brands_detected": len(brand_counts),
                "most_common_brands": [{"name": brand, "total_appearances": count} for brand, count in most_common_brands],
                "average_analysis_time": round(total_analysis_time / len(analyses), 2) if analyses else 0,
                "metadata": data.get("metadata", {})
            }
            
        except Exception as e:
            print(f"통계 요약 조회 오류: {str(e)}")
            return {}
    
    def delete_analysis(self, analysis_id: str, username: str = None) -> bool:
        """특정 분석 결과를 삭제합니다."""
        try:
            data = self._load_data()
            analyses = data.get("analyses", [])
            
            # 사용자 권한 검증
            if username:
                analysis_to_delete = None
                for analysis in analyses:
                    if analysis["id"] == analysis_id:
                        analysis_to_delete = analysis
                        break
                
                if analysis_to_delete and analysis_to_delete.get("username") != username:
                    print(f"⚠️ 권한 없음: 사용자 '{username}'이 '{analysis_id}' 삭제 시도")
                    return False
            
            # 해당 ID의 분석 결과 찾아서 제거
            original_length = len(analyses)
            data["analyses"] = [analysis for analysis in analyses if analysis["id"] != analysis_id]
            
            if len(data["analyses"]) < original_length:
                data["metadata"]["total_analyses"] = len(data["analyses"])
                data["metadata"]["last_updated"] = datetime.now().isoformat()
                self._save_data(data)
                print(f"🗑️ 분석 결과 삭제 완료: {analysis_id} (사용자: {username})")
                return True
            else:
                print(f"❌ 분석 결과를 찾을 수 없음: {analysis_id}")
                return False
                
        except Exception as e:
            print(f"분석 결과 삭제 오류: {str(e)}")
            return False 