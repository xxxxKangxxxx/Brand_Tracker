import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home,
  BarChart3, 
  Search,
  MessageCircle,
  FileText,
  Settings,
  LogOut,
  Activity
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './CompanySidebar.css';

const CompanySidebar = ({ activeView, onViewChange }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home, type: 'route', path: '/company/home' },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, type: 'view' },
    { id: 'find-creators', label: 'Find Creators', icon: Search, type: 'view' },
    { id: 'chat', label: 'Chat', icon: MessageCircle, type: 'route', path: '/company/chat' },
    { id: 'report', label: 'Report', icon: FileText, type: 'route', path: '/company/report' },
    { id: 'settings', label: 'Settings', icon: Settings, type: 'route', path: '/company/settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleMenuClick = (item) => {
    if (item.type === 'view') {
      // 뷰 전환 (CompanyPage 내부)
      onViewChange(item.id);
    } else {
      // 라우팅
      navigate(item.path);
    }
  };

  const isActive = (item) => {
    if (item.type === 'view') {
      return activeView === item.id;
    }
    return false; // 라우팅 메뉴는 일단 비활성화 (필요시 추가)
  };

  return (
    <motion.aside 
      className="company-sidebar"
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* 로고 영역 */}
      <div className="company-sidebar-header">
        <div className="company-logo">
          <Activity className="logo-icon" />
          <h2>AdLens</h2>
        </div>
      </div>

      {/* 네비게이션 메뉴 */}
      <nav className="company-sidebar-nav">
        <ul>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            
            return (
              <li key={item.id}>
                <motion.button
                  className={`company-nav-item ${active ? 'active' : ''}`}
                  onClick={() => handleMenuClick(item)}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="nav-icon" />
                  <span>{item.label}</span>
                  {active && <div className="active-indicator" />}
                </motion.button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 필터 섹션 */}
      <div className="filters-section">
        <h3 className="filters-title">Filters</h3>
        
        <div className="filter-group">
          <h4>Category</h4>
          <div className="filter-options">
            <label className="filter-checkbox">
              <input type="checkbox" defaultChecked />
              <span>Beauty</span>
            </label>
            <label className="filter-checkbox">
              <input type="checkbox" />
              <span>Fashion</span>
            </label>
            <label className="filter-checkbox">
              <input type="checkbox" />
              <span>Lifestyle</span>
            </label>
            <label className="filter-checkbox">
              <input type="checkbox" />
              <span>Food</span>
            </label>
            <label className="filter-checkbox">
              <input type="checkbox" />
              <span>Game</span>
            </label>
            <label className="filter-checkbox">
              <input type="checkbox" defaultChecked />
              <span>Travel</span>
            </label>
          </div>
        </div>

        <div className="filter-group">
          <h4>Follower</h4>
          <div className="follower-range">
            <input type="range" min="10" max="100" defaultValue="50" className="range-slider" />
            <div className="range-labels">
              <span>10k</span>
              <span>100k</span>
              <span>10M</span>
            </div>
          </div>
        </div>
      </div>

      {/* 로그아웃 버튼 */}
      <div className="company-sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut className="logout-icon" />
          <span>Logout</span>
        </button>
      </div>
    </motion.aside>
  );
};

export default CompanySidebar;

