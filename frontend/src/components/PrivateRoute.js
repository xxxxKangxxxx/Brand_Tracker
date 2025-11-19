import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children, requiredUserType }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // 로딩 중이면 로딩 표시
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '18px'
      }}>
        로딩 중...
      </div>
    );
  }

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // 사용자 타입이 요구되는 경우 확인
  if (requiredUserType && user?.user_type !== requiredUserType) {
    // 사용자 타입이 맞지 않으면 해당 타입의 대시보드로 리다이렉트
    if (user?.user_type === 'creator') {
      return <Navigate to="/creator" replace />;
    } else if (user?.user_type === 'company') {
      return <Navigate to="/company" replace />;
    }
  }

  return children;
};

export default PrivateRoute;

