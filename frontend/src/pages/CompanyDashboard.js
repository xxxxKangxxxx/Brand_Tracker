import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './CompanyDashboard.css';
import Sidebar from '../components/Sidebar';
import Dashboard from '../components/Dashboard';
import AnalysisPanel from '../components/AnalysisPanel';
import VideoListDetail from '../components/VideoListDetail';
import BrandDetail from '../components/BrandDetail';
import AnalysisDetail from '../components/AnalysisDetail';
import ConfidenceDetail from '../components/ConfidenceDetail';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';

// 백엔드 API URL
const API_BASE_URL = 'http://localhost:8000';

function CompanyDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [analysisResults, setAnalysisResults] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [modelStatus, setModelStatus] = useState(null);
  const [detailView, setDetailView] = useState(null); // 'videos', 'brands', 'analysis', 'confidence'

  const { logout } = useAuth();

  // 컴포넌트 마운트 시 백엔드에서 데이터 불러오기
  useEffect(() => {
    loadAnalysisHistory();
    checkModelStatus();
    
    // 상세 페이지 이벤트 리스너 등록
    const handleOpenVideoDetails = () => setDetailView('videos');
    const handleOpenBrandDetails = () => setDetailView('brands');
    const handleOpenAnalysisDetails = () => setDetailView('analysis');
    const handleOpenConfidenceDetails = () => setDetailView('confidence');
    
    window.addEventListener('openVideoDetails', handleOpenVideoDetails);
    window.addEventListener('openBrandDetails', handleOpenBrandDetails);
    window.addEventListener('openAnalysisDetails', handleOpenAnalysisDetails);
    window.addEventListener('openConfidenceDetails', handleOpenConfidenceDetails);
    
    return () => {
      window.removeEventListener('openVideoDetails', handleOpenVideoDetails);
      window.removeEventListener('openBrandDetails', handleOpenBrandDetails);
      window.removeEventListener('openAnalysisDetails', handleOpenAnalysisDetails);
      window.removeEventListener('openConfidenceDetails', handleOpenConfidenceDetails);
    };
  }, []);

  // 백엔드에서 분석 히스토리 불러오기
  const loadAnalysisHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/analysis/history?limit=20`);
      if (response.ok) {
        const data = await response.json();
        setAnalysisHistory(data.data || []);
        
        // 가장 최근 분석 결과를 현재 결과로 설정
        if (data.data && data.data.length > 0) {
          setAnalysisResults(data.data[0]);
        }
      }
    } catch (error) {
      console.error('분석 히스토리 로드 실패:', error);
    }
  };

  const checkModelStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/models/status`);
      const data = await response.json();
      setModelStatus(data);
    } catch (error) {
      console.error('모델 상태 확인 실패:', error);
    }
  };

  const handleAnalysisComplete = (results) => {
    if (results) {
      // 현재 결과 설정
      setAnalysisResults(results);
      
      // 히스토리 새로고침 (백엔드에서 자동 저장됨)
      loadAnalysisHistory();
    }
    
    setIsAnalyzing(false);
    setActiveTab('dashboard');
  };

  // 분석 결과 삭제
  const handleDeleteAnalysis = async (analysisId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/analysis/${analysisId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // 삭제된 항목이 현재 표시 중인 결과인지 확인
        if (analysisResults && analysisResults.id === analysisId) {
          setAnalysisResults(null);
        }
        
        // 히스토리 새로고침
        loadAnalysisHistory();
      } else {
        alert('분석 결과 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('분석 결과 삭제 오류:', error);
      alert('분석 결과 삭제 중 오류가 발생했습니다.');
    }
  };

  // 히스토리에서 결과 선택
  const handleSelectFromHistory = (historyItem) => {
    setAnalysisResults(historyItem);
    setActiveTab('dashboard');
  };

  const handleAnalysisStart = () => {
    setIsAnalyzing(true);
  };

  // 상세 페이지에서 뒤로 가기
  const handleBackToDashboard = () => {
    setDetailView(null);
    setActiveTab('dashboard');
  };

  // 영상 선택
  const handleSelectVideo = (video) => {
    setAnalysisResults(video);
    setDetailView(null);
    setActiveTab('dashboard');
  };

  // 탭 변경 시 상세 뷰 초기화
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setDetailView(null); // 상세 뷰 초기화
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="company-dashboard">
      {/* 로그아웃 버튼 */}
      <button className="logout-button" onClick={handleLogout}>
        <LogOut className="logout-icon" />
        로그아웃
      </button>

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={handleTabChange}
        modelStatus={modelStatus}
      />
      
      <main className="main-content">
        <motion.div
          key={detailView || activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="content-wrapper"
        >
          {detailView === 'videos' && (
            <VideoListDetail 
              analysisHistory={analysisHistory}
              onBack={handleBackToDashboard}
              onSelectVideo={handleSelectVideo}
              onDeleteVideo={handleDeleteAnalysis}
            />
          )}
          
          {detailView === 'brands' && (
            <BrandDetail 
              analysisHistory={analysisHistory}
              onBack={handleBackToDashboard}
            />
          )}
          
          {detailView === 'analysis' && (
            <AnalysisDetail 
              analysisHistory={analysisHistory}
              onBack={handleBackToDashboard}
            />
          )}
          
          {detailView === 'confidence' && (
            <ConfidenceDetail 
              analysisHistory={analysisHistory}
              onBack={handleBackToDashboard}
            />
          )}
          
          {!detailView && activeTab === 'dashboard' && (
            <Dashboard 
              analysisResults={analysisResults}
              analysisHistory={analysisHistory}
              isAnalyzing={isAnalyzing}
              onDeleteAnalysis={handleDeleteAnalysis}
              onSelectFromHistory={handleSelectFromHistory}
            />
          )}
          
          {!detailView && activeTab === 'analysis' && (
            <AnalysisPanel 
              onAnalysisComplete={handleAnalysisComplete}
              onAnalysisStart={handleAnalysisStart}
              isAnalyzing={isAnalyzing}
            />
          )}
        </motion.div>
      </main>
    </div>
  );
}

export default CompanyDashboard;

