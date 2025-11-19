import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Upload, 
  Settings, 
  Brain, 
  Activity,
  CheckCircle,
  XCircle
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ activeTab, setActiveTab, modelStatus }) => {
  const menuItems = [
    { id: 'dashboard', label: '대시보드', icon: BarChart3 },
    { id: 'analysis', label: '영상 분석', icon: Upload },
    { id: 'settings', label: '설정', icon: Settings },
  ];

  return (
    <motion.aside 
      className="sidebar"
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* 로고 영역 */}
      <div className="sidebar-header">
        <div className="logo">
          <Brain className="logo-icon" />
          <h2>AdLens</h2>
        </div>
        <p className="subtitle">AI 광고 분석 플랫폼</p>
      </div>

      {/* 네비게이션 메뉴 */}
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <motion.button
                  className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="nav-icon" />
                  <span>{item.label}</span>
                </motion.button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 모델 상태 */}
      <div className="model-status">
        <h3>
          <Activity className="status-icon" />
          모델 상태
        </h3>
        
        {modelStatus ? (
          <div className="status-content">
            <div className="status-item">
              {modelStatus.model_loaded ? (
                <CheckCircle className="status-indicator success" />
              ) : (
                <XCircle className="status-indicator error" />
              )}
              <span>
                {modelStatus.model_loaded ? '모델 로드됨' : '모델 로드 실패'}
              </span>
            </div>
            
            <div className="status-details">
              <p>신뢰도 임계값: {modelStatus.confidence_threshold}</p>
              <p>지원 브랜드: {modelStatus.supported_brands?.length || 0}개</p>
            </div>
            
            {modelStatus.supported_brands && (
              <div className="brands-list">
                <p className="brands-title">지원 브랜드:</p>
                <div className="brands-grid">
                  {modelStatus.supported_brands.slice(0, 8).map((brand, index) => (
                    <span key={index} className="brand-tag">
                      {brand}
                    </span>
                  ))}
                  {modelStatus.supported_brands.length > 8 && (
                    <span className="brand-tag more">
                      +{modelStatus.supported_brands.length - 8}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="status-loading">
            <div className="loading-spinner"></div>
            <span>상태 확인 중...</span>
          </div>
        )}
      </div>

      {/* 푸터 */}
      <div className="sidebar-footer">
        <p>&copy; 2025 AdLens</p>
        <p>AI-Powered Advertising Analysis Platform</p>
      </div>
    </motion.aside>
  );
};

export default Sidebar; 