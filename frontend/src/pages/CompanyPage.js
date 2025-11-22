import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, ChevronDown, LogOut, Edit, X } from 'lucide-react';
import CompanySidebar from '../components/CompanySidebar';
import CreatorCard from '../components/CreatorCard';
import Dashboard from '../components/Dashboard';
import AnalysisPanel from '../components/AnalysisPanel';
import VideoListDetail from '../components/VideoListDetail';
import BrandDetail from '../components/BrandDetail';
import AnalysisDetail from '../components/AnalysisDetail';
import ConfidenceDetail from '../components/ConfidenceDetail';
import './CompanyPage.css';

// 백엔드 API URL
const API_BASE_URL = 'http://localhost:8000';

// 하드코딩 크리에이터 데이터
// name: 사용자명 (표시용), username: id(이메일) (알림 전송용)
const creatorsData = [
  {
    id: 1,
    name: '산비스',
    username: 'sanbis@example.com',  // id(이메일) - 실제 회원가입한 이메일과 일치해야 함
    avatar: '/profile_com_1.png',
    categories: ['스타트업', '일상 브이로그'],
    stats: {
      youtube: '500만',
      instagram: '300만',
      avgViews: '평균 250k'
    },
    tags: ['스타트업', '데일리', '라이프스타일']
  },
  {
    id: 2,
    name: '규진',
    username: 'gyuuujin@example.com',
    avatar: '/profile_1.jpg',
    categories: ['뷰티', '일상 브이로그'],
    stats: {
      youtube: '23.8만',
      instagram: '13.1만',
      avgViews: '평균 28k'
    },
    tags: ['뷰티', '데일리', '패션', '아웃']
  },
  {
    id: 3,
    name: 'LeoJ Makeup',
    username: 'leojmakeup@example.com',
    avatar: '/profile_2.jpg',
    categories: ['뷰티'],
    stats: {
      youtube: '145만',
      instagram: '73.2만',
      avgViews: '평균 45k'
    },
    tags: ['뷰티', '여행', '화장품', '메이크업']
  },
  {
    id: 4,
    name: '권또또',
    username: 'ttottokwon@example.com',
    avatar: '/profile_3.jpg',
    categories: ['토크', '일상 브이로그'],
    stats: {
      youtube: '36.9만',
      instagram: '22.1만',
      avgViews: '평균 12k'
    },
    tags: ['멘스', '데일리', '토크', '먹방']
  },
  {
    id: 5,
    name: '가비걸',
    username: 'gabeegirl@example.com',
    avatar: '/profile_4.jpg',
    categories: ['뷰티', '일상 브이로그'],
    stats: {
      youtube: '97.5만',
      instagram: '55.9만',
      avgViews: '평균 28k'
    },
    tags: ['뷰티', '데일리', '패션', '아웃']
  },
  {
    id: 6,
    name: '공부왕찐천재홍진경',
    username: 'zzin_oneleft@example.com',
    avatar: '/profile_5.jpg',
    categories: ['일상 브이로그', '토크'],
    stats: {
      youtube: '177만',
      instagram: '132.1만',
      avgViews: '평균 45k'
    },
    tags: ['토크', '데일리', '개그', '아웃']
  },
  {
    id: 7,
    name: '할명수',
    username: 'halmyungsoo@example.com',
    avatar: '/profile_6.jpg',
    categories: ['토크'],
    stats: {
      youtube: '166만',
      instagram: '57.5만',
      avgViews: '평균 55k'
    },
    tags: ['토크', '먹방']
  },
  {
    id: 8,
    name: '찰스엔터',
    username: 'charlesenter@example.com',
    avatar: '/profile_7.jpg',
    categories: ['토크', '일상 브이로그'],
    stats: {
      youtube: '99.9만',
      instagram: '24.4만',
      avgViews: '평균 121k'
    },
    tags: ['일상', '리액션', '토크', '먹방']
  },
  {
    id: 9,
    name: '느낌적인느낌',
    username: 'feellikefeel@example.com',
    avatar: '/profile_8.jpg',
    categories: ['댄스', '일상 브이로그'],
    stats: {
      youtube: '64.9만',
      instagram: '55.9만',
      avgViews: '평균 28k'
    },
    tags: ['뷰티', '데일리', '패션', '아웃']
  }
];

const CompanyPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Company는 알림을 받지 않으므로 빈 배열로 처리
  // (협업 제안을 보내는 쪽이므로 알림을 받을 필요 없음)
  
  // 뷰 상태
  const [activeView, setActiveView] = useState('find-creators');
  
  // Find Creators 뷰 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCreators, setFilteredCreators] = useState(creatorsData);

  // Dashboard 뷰 상태
  const [activeTab, setActiveTab] = useState('dashboard');
  const [analysisResults, setAnalysisResults] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detailView, setDetailView] = useState(null);
  
  // 프로필 드롭다운 상태
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // 프로필 편집 모달 상태
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [companyProfile, setCompanyProfile] = useState({
    name: user?.username || 'Company',
    type: 'advertising agency',
    avatar: '/profile_com_1.png'
  });
  
  // 알림 모달 상태
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  // localStorage에서 프로필 데이터 로드
  useEffect(() => {
    const loadCompanyProfile = () => {
      try {
        const savedProfile = localStorage.getItem('companyProfile');
        if (savedProfile) {
          const parsed = JSON.parse(savedProfile);
          setCompanyProfile(parsed);
          console.log('✅ 회사 프로필 데이터 로드:', parsed);
        } else {
          // localStorage에 없으면 기본값 저장
          const defaultProfile = {
            name: user?.username || 'Company',
            type: 'advertising agency',
            avatar: '/profile_com_1.png'
          };
          localStorage.setItem('companyProfile', JSON.stringify(defaultProfile));
          setCompanyProfile(defaultProfile);
        }
      } catch (error) {
        console.error('프로필 데이터 로드 실패:', error);
      }
    };

    loadCompanyProfile();
  }, [user]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 프로필 드롭다운 토글
  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  // 로그아웃 핸들러
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // 프로필 편집 모달 열기
  const handleOpenEditModal = () => {
    setIsEditModalOpen(true);
    setIsProfileDropdownOpen(false);
  };

  // 프로필 편집 모달 닫기
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    // 원래 데이터로 복원
    const savedProfile = localStorage.getItem('companyProfile');
    if (savedProfile) {
      setCompanyProfile(JSON.parse(savedProfile));
    }
  };

  // 프로필 저장
  const handleSaveProfile = () => {
    try {
      localStorage.setItem('companyProfile', JSON.stringify(companyProfile));
      console.log('✅ 회사 프로필 저장 완료:', companyProfile);
      alert('프로필이 성공적으로 저장되었습니다!');
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('프로필 저장 실패:', error);
      alert('프로필 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 프로필 데이터 변경
  const handleProfileChange = (field, value) => {
    setCompanyProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Dashboard 뷰가 활성화될 때 데이터 로드
  // Dashboard 함수들
  const loadAnalysisHistory = useCallback(async () => {
    try {
      // 사용자 정보를 쿼리 파라미터로 전달
      const username = user?.username;
      const url = username 
        ? `${API_BASE_URL}/analysis/history?limit=20&username=${encodeURIComponent(username)}`
        : `${API_BASE_URL}/analysis/history?limit=20`;
      
      console.log(`📊 분석 히스토리 로드 중... (사용자: ${username})`);
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${username}의 분석 결과 ${data.data?.length || 0}개 로드`);
        setAnalysisHistory(data.data || []);
        if (data.data && data.data.length > 0) {
          setAnalysisResults(data.data[0]);
        }
      }
    } catch (error) {
      console.error('분석 히스토리 로드 실패:', error);
    }
  }, [user?.username]);

  useEffect(() => {
    if (activeView === 'dashboard') {
      loadAnalysisHistory();
      checkModelStatus();
      
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
    }
  }, [activeView, loadAnalysisHistory]);

  const checkModelStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/models/status`);
      await response.json();
      // 모델 상태는 현재 UI에서 사용하지 않음
    } catch (error) {
      console.error('모델 상태 확인 실패:', error);
    }
  };

  const handleAnalysisComplete = (results) => {
    if (results) {
      setAnalysisResults(results);
      loadAnalysisHistory();
    }
    setIsAnalyzing(false);
    setActiveTab('dashboard');
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
        if (analysisResults && analysisResults.id === analysisId) {
          setAnalysisResults(null);
        }
        console.log('✅ 분석 결과 삭제 완료');
        loadAnalysisHistory();
      } else {
        const error = await response.json();
        alert(error.detail || '분석 결과 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('분석 결과 삭제 오류:', error);
      alert('분석 결과 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleSelectFromHistory = (historyItem) => {
    setAnalysisResults(historyItem);
    setActiveTab('dashboard');
  };

  const handleAnalysisStart = () => {
    setIsAnalyzing(true);
  };

  const handleBackToDashboard = () => {
    setDetailView(null);
    setActiveTab('dashboard');
  };

  const handleSelectVideo = (video) => {
    setAnalysisResults(video);
    setDetailView(null);
    setActiveTab('dashboard');
  };

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setDetailView(null);
  };

  // Find Creators 함수들
  const handleSearch = () => {
    if (searchQuery.trim() === '') {
      setFilteredCreators(creatorsData);
    } else {
      const filtered = creatorsData.filter(creator => 
        creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        creator.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        creator.categories.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase())) ||
        creator.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredCreators(filtered);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 뷰 전환 핸들러
  const handleViewChange = (view) => {
    setActiveView(view);
    // Dashboard로 전환 시 초기화
    if (view === 'dashboard') {
      setActiveTab('dashboard');
      setDetailView(null);
    }
  };

  return (
    <div className="company-page">
      <CompanySidebar 
        activeView={activeView}
        onViewChange={handleViewChange}
      />
      
      <div className="company-main-content">
        {/* 상단 헤더 */}
        <header className="company-header">
          <h1 className="page-title">
            {activeView === 'find-creators' ? 'Find Creators' : 'Brand Tracking Dashboard'}
          </h1>
          
          <div className="header-right">
            {activeView === 'find-creators' && (
              <div className="search-bar">
                <Search className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search creators, keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button className="search-btn" onClick={handleSearch}>
                  Search
                </button>
              </div>
            )}
            
            <button 
              className="notification-btn" 
              onClick={() => setIsNotificationModalOpen(true)}
            >
              <Bell className="bell-icon" />
              {/* Company는 알림을 받지 않으므로 배지 표시 안 함 */}
            </button>
            
            <div className="user-profile-wrapper" ref={dropdownRef}>
              <button 
                className={`user-profile ${isProfileDropdownOpen ? 'active' : ''}`}
                onClick={toggleProfileDropdown}
              >
                <div className="profile-avatar">
                  <img src={companyProfile.avatar} alt="Company" />
                </div>
                <div className="profile-info">
                  <span className="profile-name">{companyProfile.name}</span>
                  <span className="profile-type">{companyProfile.type}</span>
                </div>
                <ChevronDown className={`chevron-icon ${isProfileDropdownOpen ? 'rotated' : ''}`} />
              </button>
              
              {isProfileDropdownOpen && (
                <motion.div 
                  className="profile-dropdown"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <button className="dropdown-item" onClick={handleOpenEditModal}>
                    <Edit className="dropdown-icon" />
                    <span>Edit Profile</span>
                  </button>
                  <button className="dropdown-item logout-item" onClick={handleLogout}>
                    <LogOut className="dropdown-icon" />
                    <span>Logout</span>
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </header>

        {/* 메인 콘텐츠 - 조건부 렌더링 */}
        {activeView === 'find-creators' && (
          <div className="creators-container">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="section-title">Best for you</h2>
              
              <div className="creators-grid">
                {filteredCreators.map((creator, index) => (
                  <motion.div
                    key={creator.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <CreatorCard creator={creator} />
                  </motion.div>
                ))}
              </div>

              {filteredCreators.length === 0 && (
                <div className="no-results">
                  <p>검색 결과가 없습니다.</p>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {activeView === 'dashboard' && (
          <div className="dashboard-container">
            <motion.div
              key={detailView || activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="dashboard-content-wrapper"
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
                  onStartAnalysis={() => handleTabChange('analysis')}
                />
              )}
              
              {!detailView && activeTab === 'analysis' && (
                <AnalysisPanel 
                  onAnalysisComplete={handleAnalysisComplete}
                  onAnalysisStart={handleAnalysisStart}
                  isAnalyzing={isAnalyzing}
                  onBackToDashboard={() => handleTabChange('dashboard')}
                />
              )}
            </motion.div>
          </div>
        )}
      </div>

      {/* 프로필 편집 모달 */}
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseEditModal}
          >
            <motion.div 
              className="edit-profile-modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>프로필 편집</h2>
                <button className="modal-close-btn" onClick={handleCloseEditModal}>
                  <X className="close-icon" />
                </button>
              </div>
              
              <div className="modal-body">
                {/* 프로필 이미지 미리보기 - 상단 */}
                <div className="avatar-preview-section">
                  <div className="avatar-preview">
                    <img src={companyProfile.avatar} alt="Preview" />
                  </div>
                </div>
                
                <div className="modal-form-group">
                  <label>회사명</label>
                  <input
                    type="text"
                    className="modal-input"
                    value={companyProfile.name}
                    onChange={(e) => handleProfileChange('name', e.target.value)}
                    placeholder="회사명을 입력하세요"
                  />
                </div>
                
                <div className="modal-form-group">
                  <label>회사 타입</label>
                  <select
                    className="modal-select"
                    value={companyProfile.type}
                    onChange={(e) => handleProfileChange('type', e.target.value)}
                  >
                    <option value="advertising agency">Advertising Agency</option>
                    <option value="brand">Brand</option>
                    <option value="startup">Startup</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="media">Media</option>
                    <option value="e-commerce">E-commerce</option>
                  </select>
                </div>
                
                <div className="modal-form-group">
                  <label>프로필 이미지 URL</label>
                  <input
                    type="text"
                    className="modal-input"
                    value={companyProfile.avatar}
                    onChange={(e) => handleProfileChange('avatar', e.target.value)}
                    placeholder="이미지 URL을 입력하세요"
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button className="modal-btn cancel-btn" onClick={handleCloseEditModal}>
                  취소
                </button>
                <button className="modal-btn save-btn" onClick={handleSaveProfile}>
                  저장
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 알림 모달 */}
      <AnimatePresence>
        {isNotificationModalOpen && (
          <motion.div 
            className="notification-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsNotificationModalOpen(false)}
          >
            <motion.div 
              className="notification-modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="notification-modal-header">
                <h2>알림</h2>
                <div className="notification-header-actions">
                  <button className="notification-modal-close" onClick={() => setIsNotificationModalOpen(false)}>
                    <X className="close-icon" />
                  </button>
                </div>
              </div>
              
              <div className="notification-modal-body">
                {/* Company는 알림을 받지 않음 (협업 제안을 보내는 쪽) */}
                <div className="notification-empty">
                  <Bell className="empty-icon" />
                  <p>알림이 없습니다</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


export default CompanyPage;
