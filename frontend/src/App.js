import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import ScrollToTop from './components/ScrollToTop';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CreatorDashboard from './pages/CreatorDashboard';
import CompanyPage from './pages/CompanyPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <Routes>
        {/* 공개 라우트 */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* 보호된 라우트 - 크리에이터 (중첩 라우팅) */}
        <Route
          path="/creator/*"
          element={
            <PrivateRoute requiredUserType="creator">
              <CreatorDashboard />
            </PrivateRoute>
          }
        />

        {/* 보호된 라우트 - 기업 */}
        <Route
          path="/company"
          element={
            <PrivateRoute requiredUserType="company">
              <CompanyPage />
            </PrivateRoute>
          }
        />

        {/* 404 - 존재하지 않는 경로는 로그인 페이지로 리다이렉트 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
