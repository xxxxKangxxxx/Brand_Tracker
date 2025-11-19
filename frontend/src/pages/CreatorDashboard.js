import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  User, 
  Activity,
  LogOut,
  Upload,
  Clock,
  TrendingUp,
  BarChart3,
  FileText,
  Award,
  Mail,
  Play,
  Edit,
  Save,
  X
} from 'lucide-react';
import HexagonChart from '../components/HexagonChart';
import AnalysisPanel from '../components/AnalysisPanel';
import Dashboard from '../components/Dashboard';
import VideoListDetail from '../components/VideoListDetail';
import BrandDetail from '../components/BrandDetail';
import AnalysisDetail from '../components/AnalysisDetail';
import ConfidenceDetail from '../components/ConfidenceDetail';
import './CreatorDashboard.css';

const API_BASE_URL = 'http://localhost:8000';

const CreatorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // 데이터 상태 관리
  const [analysisResults, setAnalysisResults] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detailView, setDetailView] = useState(null);
  
  // 프로필 편집 상태
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.username || '크리에이터',
    email: user?.username || 'user@example.com',
    membership: 'Pro'
  });
  
  // 현재 활성화된 뷰 확인 (URL 기반)
  const activeView = location.pathname.includes('/analysis') ? 'analysis' 
                    : location.pathname.includes('/dashboard') ? 'dashboard' 
                    : 'home';

  // localStorage에서 프로필 데이터 로드
  useEffect(() => {
    const loadProfileData = () => {
      try {
        const savedProfile = localStorage.getItem('creatorProfile');
        if (savedProfile) {
          const parsed = JSON.parse(savedProfile);
          setProfileData(parsed);
          console.log('✅ 프로필 데이터 로드:', parsed);
        } else {
          // localStorage에 없으면 기본값 저장
          const defaultProfile = {
            name: user?.username || '크리에이터',
            email: user?.username || 'user@example.com',
            membership: 'Pro'
          };
          localStorage.setItem('creatorProfile', JSON.stringify(defaultProfile));
          setProfileData(defaultProfile);
        }
      } catch (error) {
        console.error('프로필 데이터 로드 실패:', error);
      }
    };

    loadProfileData();
  }, [user]);

  useEffect(() => {
    // 분석 히스토리 로드 (홈 화면에서도 로드)
    loadAnalysisHistory();
    
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
  }, [activeView]);

  const loadAnalysisHistory = async () => {
    try {
      // 사용자 정보를 쿼리 파라미터로 전달
      const username = user?.username;
      const url = username 
        ? `${API_BASE_URL}/analysis/history?limit=20&username=${encodeURIComponent(username)}`
        : `${API_BASE_URL}/analysis/history?limit=20`;
      
      console.log(`📊 분석 히스토리 로드 중... (사용자: ${username})`);
      const response = await fetch(url);
      
      if (response.ok) {
        const result = await response.json();
        
        // API 응답 구조: { status, data, total }
        // data 필드에서 실제 배열 추출
        let historyData = [];
        
        if (result.data && Array.isArray(result.data)) {
          historyData = result.data;
        } else if (Array.isArray(result)) {
          // 혹시 직접 배열로 오는 경우도 처리
          historyData = result;
        } else {
          console.warn('분석 히스토리가 예상과 다른 구조입니다:', result);
        }
        
        console.log(`✅ ${username}의 분석 결과 ${historyData.length}개 로드`);
        setAnalysisHistory(historyData);
        if (historyData.length > 0) {
          setAnalysisResults(historyData[0]);
        }
      } else {
        setAnalysisHistory([]);
      }
    } catch (error) {
      console.error('분석 히스토리 로드 실패:', error);
      setAnalysisHistory([]);
    }
  };

  const handleAnalysisComplete = (results) => {
    setAnalysisResults(results);
    setIsAnalyzing(false);
    loadAnalysisHistory();
    navigate('/creator'); // 분석 완료 후 홈으로 이동 (Activity + Brand Analysis 업데이트)
  };

  const handleAnalysisStart = () => {
    setIsAnalyzing(true);
  };

  const handleDeleteAnalysis = async (analysisId) => {
    try {
      // 사용자 정보를 쿼리 파라미터로 전달
      const username = user?.username;
      const url = username
        ? `${API_BASE_URL}/analysis/${analysisId}?username=${encodeURIComponent(username)}`
        : `${API_BASE_URL}/analysis/${analysisId}`;
      
      const response = await fetch(url, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // 현재 선택된 분석 결과가 삭제되는 경우 초기화
        if (analysisResults && analysisResults.id === analysisId) {
          setAnalysisResults(null);
        }
        // 히스토리 새로고침
        await loadAnalysisHistory();
        console.log('✅ 분석 결과 삭제 완료');
      } else {
        const error = await response.json();
        throw new Error(error.detail || '삭제 실패');
      }
    } catch (error) {
      console.error('분석 삭제 실패:', error);
      alert('분석 결과 삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleSelectFromHistory = (result) => {
    setAnalysisResults(result);
    setDetailView(null); // 메인 Dashboard로 돌아가기
  };

  const handleBackToDashboard = () => {
    setDetailView(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCreateProfile = () => {
    alert('자기소개서 작성 기능은 준비 중입니다.');
  };

  const handleViewAnalysis = () => {
    navigate('/creator/dashboard');
  };

  const handleEditProfile = () => {
    setIsEditingProfile(true);
  };

  const handleSaveProfile = () => {
    try {
      // localStorage에 프로필 정보 저장
      localStorage.setItem('creatorProfile', JSON.stringify(profileData));
      console.log('✅ 프로필 저장 완료:', profileData);
      
      // 저장 성공 알림 (선택적)
      alert('프로필이 성공적으로 저장되었습니다!');
      
      setIsEditingProfile(false);
      
      // TODO: 추후 백엔드 API 호출 구현
      // await fetch('/api/user/profile', {
      //   method: 'PUT',
      //   body: JSON.stringify(profileData)
      // });
    } catch (error) {
      console.error('프로필 저장 실패:', error);
      alert('프로필 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleCancelEdit = () => {
    // localStorage에서 원래 데이터 복원
    try {
      const savedProfile = localStorage.getItem('creatorProfile');
      if (savedProfile) {
        setProfileData(JSON.parse(savedProfile));
      } else {
        // 저장된 데이터가 없으면 기본값으로
        setProfileData({
          name: user?.username || '크리에이터',
          email: user?.username || 'user@example.com',
          membership: 'Pro'
        });
      }
    } catch (error) {
      console.error('프로필 복원 실패:', error);
    }
    setIsEditingProfile(false);
  };

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 통계 계산 - useMemo로 최적화
  const stats = useMemo(() => {
    // analysisHistory가 배열인지 확인
    if (!Array.isArray(analysisHistory) || analysisHistory.length === 0) {
      return {
        totalVideos: 0,
        totalBrands: 0,
        topBrands: [],
        totalAppearances: 0
      };
    }

    const brandStats = {};
    let totalAppearances = 0;

    analysisHistory.forEach(analysis => {
      if (analysis && analysis.brand_analysis) {
        Object.entries(analysis.brand_analysis).forEach(([brand, data]) => {
          if (!brandStats[brand]) {
            brandStats[brand] = {
              name: brand,
              appearances: 0,
              totalTime: 0
            };
          }
          brandStats[brand].appearances += data.appearances || 0;
          brandStats[brand].totalTime += data.total_seconds || 0;
          totalAppearances += data.appearances || 0;
        });
      }
    });

    const topBrands = Object.values(brandStats)
      .sort((a, b) => b.appearances - a.appearances)
      .slice(0, 3);

    return {
      totalVideos: analysisHistory.length,
      totalBrands: Object.keys(brandStats).length,
      topBrands,
      totalAppearances
    };
  }, [analysisHistory]);

  // 최근 영상 - useMemo로 최적화
  const recentVideos = useMemo(() => {
    if (!Array.isArray(analysisHistory)) {
      return [];
    }
    return analysisHistory.slice(0, 3);
  }, [analysisHistory]);

  return (
    <div className="creator-dashboard">
      {/* 상단 네비게이션 */}
      <nav className="creator-nav">
        <div className="nav-brand">
          <Activity className="brand-icon" />
          <h2>AdLens</h2>
        </div>
        <div className="nav-actions">
          <button 
            className={`nav-button ${activeView === 'analysis' ? 'active' : ''}`}
            onClick={() => navigate('/creator/analysis')}
          >
            <Play className="nav-icon" />
            영상 분석
          </button>
          <button 
            className={`nav-button ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => navigate('/creator/dashboard')}
          >
            <BarChart3 className="nav-icon" />
            분석 결과
          </button>
          <button className="nav-button logout" onClick={handleLogout}>
            <LogOut className="nav-icon" />
            로그아웃
          </button>
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <div className="creator-content">
        {/* 영상 분석 패널 */}
        {activeView === 'analysis' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <AnalysisPanel 
              onAnalysisComplete={handleAnalysisComplete}
              onAnalysisStart={handleAnalysisStart}
              isAnalyzing={isAnalyzing}
              onBackToDashboard={() => navigate('/creator')}
            />
          </motion.div>
        )}

        {/* 분석 결과 대시보드 */}
        {activeView === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {detailView === 'videos' && (
              <VideoListDetail 
                analysisHistory={analysisHistory}
                onBack={handleBackToDashboard}
                onSelectVideo={handleSelectFromHistory}
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
            
            {!detailView && (
              <Dashboard 
                analysisResults={analysisResults}
                analysisHistory={analysisHistory}
                isAnalyzing={isAnalyzing}
                onDeleteAnalysis={handleDeleteAnalysis}
                onSelectFromHistory={handleSelectFromHistory}
                onStartAnalysis={() => navigate('/creator/analysis')}
                onBackToHome={() => navigate('/creator')}
              />
            )}
          </motion.div>
        )}

        {/* 홈 뷰 */}
        {activeView === 'home' && (
          <motion.div 
            className="creator-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* 환영 섹션 */}
            <div className="welcome-section">
              <h1 className="welcome-title">{profileData.name}님, 안녕하세요!</h1>
              <p className="welcome-subtitle">역량 향상을 위해 자주 만나게 되어 너무 좋아요.</p>
            </div>

          {/* 메인 통합 카드 */}
          <motion.div 
            className="main-unified-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="main-grid">
              {/* 좌측: 기본 정보 */}
              <div className="info-section">
                <div className="section-title-row">
                  <h3 className="card-title">나의 기본정보</h3>
                  {!isEditingProfile ? (
                    <button className="edit-btn" onClick={handleEditProfile}>
                      <Edit className="edit-icon" />
                    </button>
                  ) : (
                    <div className="edit-actions">
                      <button className="save-btn" onClick={handleSaveProfile}>
                        <Save className="action-icon" />
                      </button>
                      <button className="cancel-btn" onClick={handleCancelEdit}>
                        <X className="action-icon" />
                      </button>
                    </div>
                  )}
                </div>
              <div className="info-content">
                <div className="info-avatar">
                  <User className="avatar-icon" />
                </div>
                <div className="info-details">
                  <div className="info-item">
                    <span className="info-label">이름</span>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        className="info-input"
                        value={profileData.name}
                        onChange={(e) => handleProfileChange('name', e.target.value)}
                      />
                    ) : (
                      <span className="info-value">{profileData.name}</span>
                    )}
                  </div>
                  <div className="info-item">
                    <span className="info-label">
                      <Mail className="info-icon" />
                      아이디
                    </span>
                    {isEditingProfile ? (
                      <input
                        type="email"
                        className="info-input"
                        value={profileData.email}
                        onChange={(e) => handleProfileChange('email', e.target.value)}
                      />
                    ) : (
                      <span className="info-value">{profileData.email}</span>
                    )}
                  </div>
                  <div className="info-item">
                    <span className="info-label">멤버십</span>
                    <span className="membership-badge pro">
                      <Award className="badge-icon" />
                      {profileData.membership}
                    </span>
                  </div>
                </div>
              </div>
              </div>

              {/* 중앙: 6각형 차트 */}
              <div className="chart-section">
                <div className="chart-header">
                  <h3 className="card-title">6대 추천 장르</h3>
                <div className="chart-tabs">
                  <button className="tab active">6대 맞춤 카테고리</button>
                  </div>
                </div>
                <div className="chart-content">
                  <HexagonChart />
                </div>
              </div>

              {/* 우측: 자기소개서 기능 */}
              <div className="profile-actions-section">
                <h3 className="card-title">프로필 관리</h3>
              
              <div className="action-section">
                <div className="action-header">
                  <FileText className="action-icon" />
                  <span>자기소개서</span>
                </div>
                <button className="action-btn primary" onClick={handleCreateProfile}>
                  자기소개서 작성하기
                </button>
                <div className="action-stats">
                  <div className="stat-item">
                    <span className="stat-label">작성</span>
                    <span className="stat-number">0</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">완료</span>
                    <span className="stat-number">0</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">수정</span>
                    <span className="stat-number">0</span>
                  </div>
                </div>
              </div>

              <div className="action-section">
                <div className="action-header">
                  <BarChart3 className="action-icon" />
                  <span>분석 결과</span>
                </div>
                <button className="action-btn secondary" onClick={handleViewAnalysis}>
                  자기소개서 기반 분석 결과
                </button>
                <div className="action-stats">
                  <div className="stat-item">
                    <span className="stat-label">신청</span>
                    <span className="stat-number">0</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">승인</span>
                    <span className="stat-number">0</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">완료</span>
                    <span className="stat-number">0</span>
                  </div>
                </div>
              </div>

                <div className="milestone-section">
                  <span className="milestone-label">취득 마일리지</span>
                  <span className="milestone-value">0</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 하단 섹션 */}
          {/* 활동 요약 - 최근 분석 영상 */}
          <motion.div 
            className="activity-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="section-header">
              <h3>
                <Clock className="section-icon" />
                최근 분석 영상
              </h3>
              <button 
                className="view-all-btn"
                onClick={() => navigate('/creator/dashboard')}
              >
                전체보기
              </button>
            </div>
            
            {recentVideos.length > 0 ? (
              <div className="recent-videos-grid">
                {recentVideos.map((video, index) => (
                  <motion.div 
                    key={video.id || index}
                    className="video-summary-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    onClick={() => {
                      handleSelectFromHistory(video);
                      navigate('/creator/dashboard');
                    }}
                  >
                    <div className="video-summary-header">
                      <div className="video-thumbnail">
                        <Play className="play-icon" />
                      </div>
                      <div className="video-info">
                        <h4 className="video-title-small">
                          {video.video_info?.title || video.youtube_title || '영상 제목'}
                        </h4>
                        <p className="video-date-small">
                          {new Date(video.timestamp).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                    </div>
                    <div className="video-summary-stats">
                      <div className="summary-stat-item">
                        <span className="stat-label-small">브랜드</span>
                        <span className="stat-value-small">
                          {video.brand_analysis ? Object.keys(video.brand_analysis).length : 0}개
                        </span>
                      </div>
                      <div className="summary-stat-item">
                        <span className="stat-label-small">탐지</span>
                        <span className="stat-value-small">
                          {video.brand_analysis 
                            ? Object.values(video.brand_analysis).reduce((sum, b) => sum + (b.appearances || 0), 0)
                            : 0}회
                        </span>
                      </div>
                      <div className="summary-stat-item">
                        <span className="stat-label-small">분석시간</span>
                        <span className="stat-value-small">
                          {video.total_analysis_time?.toFixed(1) || 0}초
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="activity-card">
                <div className="activity-content">
                  <p className="activity-message">
                    환영합니다! 크리에이터 대시보드에서 영상 분석 결과를 확인하고 
                    브랜드 노출 통계를 관리하세요.
                  </p>
                  <button className="action-button" onClick={() => navigate('/creator/analysis')}>
                    <Upload className="button-icon" />
                    첫 영상 분석하기
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* 브랜드 노출 분석 섹션 */}
          <motion.div 
            className="brand-analysis-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="section-header">
              <h3>
                <TrendingUp className="section-icon" />
                브랜드 노출 분석
              </h3>
              {stats.totalVideos > 0 && (
                <button 
                  className="view-detail-btn"
                  onClick={() => navigate('/creator/dashboard')}
                >
                  <BarChart3 className="btn-icon" />
                  상세 결과 보기
                </button>
              )}
            </div>
            
            {stats.totalVideos > 0 ? (
              <div className="brand-stats-container">
                {/* 전체 통계 메트릭 */}
                <div className="stats-metrics">
                  <div className="metric-box">
                    <div className="metric-icon-wrapper purple">
                      <Play className="metric-icon-small" />
                    </div>
                    <div className="metric-details">
                      <span className="metric-label-small">분석 영상</span>
                      <span className="metric-value-large">{stats.totalVideos}</span>
                    </div>
                  </div>
                  
                  <div className="metric-box">
                    <div className="metric-icon-wrapper blue">
                      <Award className="metric-icon-small" />
                    </div>
                    <div className="metric-details">
                      <span className="metric-label-small">탐지 브랜드</span>
                      <span className="metric-value-large">{stats.totalBrands}</span>
                    </div>
                  </div>
                  
                  <div className="metric-box">
                    <div className="metric-icon-wrapper green">
                      <TrendingUp className="metric-icon-small" />
                    </div>
                    <div className="metric-details">
                      <span className="metric-label-small">총 탐지 횟수</span>
                      <span className="metric-value-large">{stats.totalAppearances}</span>
                    </div>
                  </div>
                </div>

                {/* Top 3 브랜드 */}
                {stats.topBrands.length > 0 && (
                  <div className="top-brands-section">
                    <h4 className="subsection-title">
                      <Award className="subsection-icon" />
                      가장 많이 탐지된 브랜드
                    </h4>
                    <div className="top-brands-list">
                      {stats.topBrands.map((brand, index) => (
                        <div key={brand.name} className="top-brand-item">
                          <div className="brand-rank-badge">#{index + 1}</div>
                          <div className="brand-info-mini">
                            <span className="brand-name-mini">{brand.name}</span>
                            <div className="brand-bar">
                              <div 
                                className="brand-bar-fill"
                                style={{ 
                                  width: `${(brand.appearances / stats.topBrands[0].appearances) * 100}%`,
                                  background: index === 0 ? '#667eea' : index === 1 ? '#764ba2' : '#a855f7'
                                }}
                              />
                            </div>
                          </div>
                          <div className="brand-stats-mini">
                            <span className="brand-count">{brand.appearances}회</span>
                            <span className="brand-time">{brand.totalTime.toFixed(1)}초</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="analysis-placeholder">
                <BarChart3 className="placeholder-icon" />
                <p>영상을 분석하면 브랜드 노출 데이터를 확인할 수 있습니다.</p>
                <button className="placeholder-btn" onClick={() => navigate('/creator/analysis')}>
                  <Play className="btn-icon" />
                  영상 분석 시작하기
                </button>
              </div>
            )}
          </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CreatorDashboard;
