import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Mail
} from 'lucide-react';
import HexagonChart from '../components/HexagonChart';
import './CreatorDashboard.css';

const CreatorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // 크리에이터 통계 로드 (향후 구현 예정)
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleUploadVideo = () => {
    alert('영상 업로드 기능은 준비 중입니다.');
  };

  const handleCreateProfile = () => {
    alert('자기소개서 작성 기능은 준비 중입니다.');
  };

  const handleViewAnalysis = () => {
    alert('분석 결과 보기 기능은 준비 중입니다.');
  };

  return (
    <div className="creator-dashboard">
      {/* 상단 네비게이션 */}
      <nav className="creator-nav">
        <div className="nav-brand">
          <Activity className="brand-icon" />
          <h2>AdLens</h2>
        </div>
        <div className="nav-actions">
          <button className="nav-button" onClick={handleUploadVideo}>
            <Upload className="nav-icon" />
            영상 업로드
          </button>
          <button className="nav-button logout" onClick={handleLogout}>
            <LogOut className="nav-icon" />
            로그아웃
          </button>
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <div className="creator-content">
        <motion.div 
          className="creator-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* 환영 섹션 */}
          <div className="welcome-section">
            <h1 className="welcome-title">{user?.username || '크리에이터'}님, 안녕하세요!</h1>
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
                <h3 className="card-title">나의 기본정보</h3>
              <div className="info-content">
                <div className="info-avatar">
                  <User className="avatar-icon" />
                </div>
                <div className="info-details">
                  <div className="info-item">
                    <span className="info-label">이름</span>
                    <span className="info-value">{user?.username || '크리에이터'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">
                      <Mail className="info-icon" />
                      아이디
                    </span>
                    <span className="info-value">{user?.username || 'user@example.com'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">멤버십</span>
                    <span className="membership-badge pro">
                      <Award className="badge-icon" />
                      Pro
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
          {/* 활동 요약 */}
          <motion.div 
            className="activity-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="section-header">
              <h3>
                <Clock className="section-icon" />
                최근 활동
              </h3>
            </div>
            
            <div className="activity-card">
              <div className="activity-content">
                <p className="activity-message">
                  환영합니다! 크리에이터 대시보드에서 영상 분석 결과를 확인하고 
                  브랜드 노출 통계를 관리하세요.
                </p>
                <button className="action-button" onClick={handleUploadVideo}>
                  <Upload className="button-icon" />
                  첫 영상 분석하기
                </button>
              </div>
            </div>
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
            </div>
            
            <div className="analysis-placeholder">
              <BarChart3 className="placeholder-icon" />
              <p>영상을 분석하면 브랜드 노출 데이터를 확인할 수 있습니다.</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default CreatorDashboard;
