import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, UserPlus, User, Building } from 'lucide-react';
import './RegisterPage.css';

const API_BASE_URL = 'http://localhost:8000';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('creator');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 비밀번호 확인
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 비밀번호 길이 확인
    if (password.length < 4) {
      setError('비밀번호는 최소 4자 이상이어야 합니다.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          user_type: userType,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 회원가입 성공
        alert('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
        navigate('/');
      } else {
        setError(data.detail || '회원가입에 실패했습니다.');
      }
    } catch (err) {
      setError('서버 연결에 실패했습니다.');
      console.error('회원가입 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <motion.div 
        className="register-container"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="register-header">
          <Brain className="logo-icon" />
          <h1>회원가입</h1>
          <p>AdLens에 오신 것을 환영합니다</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {error && (
            <motion.div 
              className="error-message"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.div>
          )}

          <div className="form-group">
            <label htmlFor="username">아이디</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="아이디를 입력하세요"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요 (최소 4자)"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">비밀번호 확인</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호를 다시 입력하세요"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>사용자 타입</label>
            <div className="user-type-options">
              <motion.label 
                className={`user-type-option ${userType === 'creator' ? 'selected' : ''}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <input
                  type="radio"
                  name="userType"
                  value="creator"
                  checked={userType === 'creator'}
                  onChange={(e) => setUserType(e.target.value)}
                  disabled={loading}
                />
                <User className="option-icon" />
                <div className="option-content">
                  <span className="option-title">크리에이터</span>
                  <span className="option-description">영상 콘텐츠 제작자</span>
                </div>
              </motion.label>

              <motion.label 
                className={`user-type-option ${userType === 'company' ? 'selected' : ''}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <input
                  type="radio"
                  name="userType"
                  value="company"
                  checked={userType === 'company'}
                  onChange={(e) => setUserType(e.target.value)}
                  disabled={loading}
                />
                <Building className="option-icon" />
                <div className="option-content">
                  <span className="option-title">기업</span>
                  <span className="option-description">광고 분석 및 크리에이터 검색</span>
                </div>
              </motion.label>
            </div>
          </div>

          <motion.button
            type="submit"
            className="register-button"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? (
              <span className="loading-spinner"></span>
            ) : (
              <>
                <UserPlus className="button-icon" />
                회원가입
              </>
            )}
          </motion.button>
        </form>

        <div className="register-footer">
          <p>
            이미 계정이 있으신가요? <Link to="/">로그인</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;

