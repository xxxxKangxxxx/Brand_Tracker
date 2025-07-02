import streamlit as st
import requests
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
import json
from datetime import datetime
import time

# 페이지 설정
st.set_page_config(
    page_title="브랜드 추적 시스템",
    page_icon="🎥",
    layout="wide",
    initial_sidebar_state="expanded"
)

# API 베이스 URL
API_BASE_URL = "http://localhost:8000"

def main():
    st.title("🎥 브랜드 자동 추적 시스템")
    st.markdown("---")
    
    # 사이드바
    with st.sidebar:
        st.header("📊 분석 옵션")
        
        # 분석 타입 선택
        analysis_type = st.selectbox(
            "분석 타입",
            ["유튜브 영상", "파일 업로드"]
        )
        
        # 설정 옵션
        st.subheader("⚙️ 설정")
        resolution = st.selectbox(
            "영상 해상도",
            ["360p", "480p", "720p", "1080p"],
            index=0
        )
        
        frame_interval = st.slider(
            "프레임 추출 간격 (초)",
            min_value=0.5,
            max_value=10.0,
            value=0.5,
            step=0.5,
            help="몇 초마다 프레임을 추출할지 설정합니다"
        )
        
        # 모델 상태 확인
        if st.button("🔍 모델 상태 확인"):
            check_model_status()
    
    # 메인 컨텐츠
    if analysis_type == "유튜브 영상":
        youtube_analysis_tab()
    else:
        file_upload_tab()

def youtube_analysis_tab():
    st.header("📺 유튜브 영상 분석")
    
    # 유튜브 URL 입력
    youtube_url = st.text_input(
        "유튜브 URL을 입력하세요:",
        placeholder="https://www.youtube.com/watch?v=..."
    )
    
    col1, col2 = st.columns([1, 4])
    
    with col1:
        analyze_button = st.button("🚀 분석 시작", type="primary")
    
    with col2:
        if st.button("📋 샘플 URL 사용"):
            st.session_state.sample_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            st.rerun()
    
    # 샘플 URL 처리
    if hasattr(st.session_state, 'sample_url'):
        youtube_url = st.session_state.sample_url
        st.info(f"샘플 URL이 설정되었습니다: {youtube_url}")
    
    if analyze_button and youtube_url:
        analyze_youtube_video(youtube_url)

def file_upload_tab():
    st.header("📁 파일 업로드 분석")
    
    uploaded_file = st.file_uploader(
        "영상 파일을 업로드하세요",
        type=['mp4', 'mov', 'avi', 'mkv'],
        help="지원 형식: MP4, MOV, AVI, MKV"
    )
    
    if uploaded_file is not None:
        st.success(f"파일 업로드 완료: {uploaded_file.name}")
        
        if st.button("🚀 분석 시작", type="primary"):
            analyze_uploaded_file(uploaded_file)

def analyze_youtube_video(url):
    """유튜브 영상을 분석합니다."""
    
    # 프로그레스 바와 상태 표시
    progress_bar = st.progress(0)
    status_text = st.empty()
    
    try:
        status_text.text("🔄 분석을 시작합니다...")
        progress_bar.progress(10)
        
        # API 요청 데이터
        request_data = {
            "url": url,
            "resolution": st.session_state.get("resolution", "360p"),
            "frame_interval": st.session_state.get("frame_interval", 0.5)
        }
        
        status_text.text("📥 유튜브 영상을 다운로드 중...")
        progress_bar.progress(30)
        
        # API 호출
        response = requests.post(
            f"{API_BASE_URL}/analyze/youtube",
            json=request_data,
            timeout=300  # 5분 타임아웃
        )
        
        progress_bar.progress(60)
        status_text.text("🔍 로고 탐지 중...")
        
        if response.status_code == 200:
            progress_bar.progress(100)
            status_text.text("✅ 분석 완료!")
            
            result = response.json()
            display_analysis_results(result)
            
        else:
            st.error(f"분석 실패: {response.text}")
            
    except requests.exceptions.Timeout:
        st.error("⏰ 분석 시간이 초과되었습니다. 더 짧은 영상을 시도해보세요.")
    except Exception as e:
        st.error(f"❌ 오류가 발생했습니다: {str(e)}")
    finally:
        progress_bar.empty()
        status_text.empty()

def analyze_uploaded_file(uploaded_file):
    """업로드된 파일을 분석합니다."""
    
    progress_bar = st.progress(0)
    status_text = st.empty()
    
    try:
        status_text.text("📤 파일을 업로드 중...")
        progress_bar.progress(20)
        
        # 파일 업로드
        files = {"file": uploaded_file.getvalue()}
        
        status_text.text("🔍 로고 탐지 중...")
        progress_bar.progress(50)
        
        response = requests.post(
            f"{API_BASE_URL}/analyze/upload",
            files={"file": (uploaded_file.name, uploaded_file.getvalue(), uploaded_file.type)},
            timeout=300
        )
        
        progress_bar.progress(80)
        
        if response.status_code == 200:
            progress_bar.progress(100)
            status_text.text("✅ 분석 완료!")
            
            result = response.json()
            display_analysis_results(result)
            
        else:
            st.error(f"분석 실패: {response.text}")
            
    except Exception as e:
        st.error(f"❌ 오류가 발생했습니다: {str(e)}")
    finally:
        progress_bar.empty()
        status_text.empty()

def display_analysis_results(result):
    """분석 결과를 표시합니다."""
    
    st.markdown("---")
    st.header("📊 분석 결과")
    
    # 영상 정보
    video_info = result.get("video_info", {})
    brand_analysis = result.get("brand_analysis", {})
    
    # 영상 정보 표시
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("영상 길이", f"{video_info.get('duration', 0):.1f}초")
    
    with col2:
        st.metric("해상도", f"{video_info.get('width', 0)}x{video_info.get('height', 0)}")
    
    with col3:
        st.metric("FPS", f"{video_info.get('fps', 0):.1f}")
    
    with col4:
        st.metric("분석 시간", f"{result.get('total_analysis_time', 0):.1f}초")
    
    if not brand_analysis:
        st.warning("🔍 탐지된 브랜드가 없습니다.")
        return
    
    # 브랜드 분석 결과
    st.subheader("🏷️ 탐지된 브랜드")
    
    # 브랜드 요약 테이블
    brand_data = []
    for brand, data in brand_analysis.items():
        brand_data.append({
            "브랜드": brand.upper(),
            "등장 횟수": data["appearances"],
            "총 노출 시간 (초)": data["total_seconds"],
            "평균 신뢰도": f"{data.get('average_confidence', 0):.2%}",
            "최대 신뢰도": f"{data.get('max_confidence', 0):.2%}"
        })
    
    if brand_data:
        df = pd.DataFrame(brand_data)
        st.dataframe(df, use_container_width=True)
        
        # 시각화
        create_visualizations(brand_analysis)
        
        # 타임라인 표시
        display_timeline(brand_analysis)
    
    # 결과 다운로드
    st.subheader("💾 결과 다운로드")
    
    col1, col2 = st.columns(2)
    
    with col1:
        # JSON 다운로드
        json_data = json.dumps(result, indent=2, ensure_ascii=False)
        st.download_button(
            label="📄 JSON 다운로드",
            data=json_data,
            file_name=f"brand_analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
            mime="application/json"
        )
    
    with col2:
        # CSV 다운로드
        if brand_data:
            csv_data = pd.DataFrame(brand_data).to_csv(index=False)
            st.download_button(
                label="📊 CSV 다운로드",
                data=csv_data,
                file_name=f"brand_analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
                mime="text/csv"
            )

def create_visualizations(brand_analysis):
    """브랜드 분석 결과를 시각화합니다."""
    
    st.subheader("📈 시각화")
    
    # 데이터 준비
    brands = list(brand_analysis.keys())
    appearances = [data["appearances"] for data in brand_analysis.values()]
    total_seconds = [data["total_seconds"] for data in brand_analysis.values()]
    avg_confidence = [data.get("average_confidence", 0) for data in brand_analysis.values()]
    
    col1, col2 = st.columns(2)
    
    with col1:
        # 등장 횟수 바 차트
        fig_appearances = px.bar(
            x=brands,
            y=appearances,
            title="브랜드별 등장 횟수",
            labels={"x": "브랜드", "y": "등장 횟수"},
            color=appearances,
            color_continuous_scale="viridis"
        )
        fig_appearances.update_layout(showlegend=False)
        st.plotly_chart(fig_appearances, use_container_width=True)
    
    with col2:
        # 총 노출 시간 파이 차트
        fig_time = px.pie(
            values=total_seconds,
            names=brands,
            title="브랜드별 총 노출 시간 비율"
        )
        st.plotly_chart(fig_time, use_container_width=True)
    
    # 신뢰도 스캐터 플롯
    fig_confidence = px.scatter(
        x=appearances,
        y=avg_confidence,
        size=total_seconds,
        color=brands,
        title="브랜드별 등장 횟수 vs 평균 신뢰도",
        labels={"x": "등장 횟수", "y": "평균 신뢰도"},
        hover_name=brands
    )
    st.plotly_chart(fig_confidence, use_container_width=True)

def display_timeline(brand_analysis):
    """브랜드 등장 타임라인을 표시합니다."""
    
    st.subheader("⏰ 브랜드 등장 타임라인")
    
    # 타임라인 데이터 준비
    timeline_data = []
    for brand, data in brand_analysis.items():
        for timestamp in data["timestamps"]:
            timeline_data.append({
                "브랜드": brand.upper(),
                "시간": timestamp,
                "등장": 1
            })
    
    if timeline_data:
        df_timeline = pd.DataFrame(timeline_data)
        
        # 타임라인 차트
        fig_timeline = px.scatter(
            df_timeline,
            x="시간",
            y="브랜드",
            color="브랜드",
            title="브랜드 등장 타임라인",
            labels={"시간": "시간 (초)"},
            size_max=10
        )
        fig_timeline.update_traces(marker=dict(size=12))
        st.plotly_chart(fig_timeline, use_container_width=True)
        
        # 상세 타임라인 테이블
        with st.expander("상세 타임라인 보기"):
            st.dataframe(df_timeline.sort_values("시간"), use_container_width=True)

def check_model_status():
    """모델 상태를 확인합니다."""
    try:
        response = requests.get(f"{API_BASE_URL}/models/status")
        if response.status_code == 200:
            status = response.json()
            
            st.success("✅ API 연결 성공")
            
            col1, col2 = st.columns(2)
            with col1:
                st.metric("모델 로드 상태", "✅ 로드됨" if status["model_loaded"] else "❌ 로드 안됨")
            
            with col2:
                st.metric("신뢰도 임계값", f"{status['confidence_threshold']:.2f}")
            
            st.write("**지원 브랜드:**")
            for brand in status["supported_brands"]:
                st.write(f"• {brand.upper()}")
                
        else:
            st.error("❌ API 연결 실패")
            
    except Exception as e:
        st.error(f"❌ 연결 오류: {str(e)}")

if __name__ == "__main__":
    main() 