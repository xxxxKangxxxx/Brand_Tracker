import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Youtube, Play, Settings, ArrowLeft } from 'lucide-react';
import './AnalysisPanel.css';

// 백엔드 API URL
const API_BASE_URL = 'http://localhost:8000';

const AnalysisPanel = ({ onAnalysisComplete, onAnalysisStart, isAnalyzing, onBackToDashboard }) => {
  const [activeTab, setActiveTab] = useState('youtube');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [file, setFile] = useState(null);
  const [settings, setSettings] = useState({
    resolution: '360p',
    frameInterval: 0.5
  });

  const handleYoutubeAnalysis = async () => {
    if (!youtubeUrl.trim()) {
      alert('유튜브 URL을 입력해주세요.');
      return;
    }

    onAnalysisStart();

    try {
      const response = await fetch(`${API_BASE_URL}/analyze/youtube`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: youtubeUrl,
          resolution: settings.resolution,
          frame_interval: settings.frameInterval
        })
      });

      if (response.ok) {
        const result = await response.json();
        onAnalysisComplete(result);
        setYoutubeUrl('');
      } else {
        let errorMessage = '분석에 실패했습니다.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || `HTTP ${response.status}: ${response.statusText}`;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      const message = error.message || error.toString();
      alert('분석 중 오류가 발생했습니다: ' + message);
      onAnalysisComplete(null);
    }
  };



  const handleFileAnalysis = async () => {
    if (!file) {
      alert('파일을 선택해주세요.');
      return;
    }

    onAnalysisStart();

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/analyze/upload`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        onAnalysisComplete(result);
        setFile(null);
      } else {
        throw new Error('분석에 실패했습니다.');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert('분석 중 오류가 발생했습니다: ' + error.message);
      onAnalysisComplete(null);
    }
  };

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const validTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/mkv'];
      if (validTypes.includes(selectedFile.type) || selectedFile.name.match(/\.(mp4|mov|avi|mkv)$/i)) {
        setFile(selectedFile);
      } else {
        alert('지원하지 않는 파일 형식입니다. MP4, MOV, AVI, MKV 파일만 업로드 가능합니다.');
      }
    }
  };

  return (
    <motion.div 
      className="analysis-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* 대시보드로 돌아가기 버튼 */}
      {onBackToDashboard && (
        <button className="back-to-dashboard-btn" onClick={onBackToDashboard}>
          <ArrowLeft className="back-icon" />
          대시보드로 돌아가기
        </button>
      )}

      <div className="panel-header">
        <h1>영상 분석</h1>
        <p>AI를 활용한 브랜드 자동 탐지 및 분석</p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'youtube' ? 'active' : ''}`}
          onClick={() => setActiveTab('youtube')}
        >
          <Youtube className="tab-icon" />
          유튜브 영상
        </button>
        <button 
          className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          <Upload className="tab-icon" />
          파일 업로드
        </button>
        <button 
          className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings className="tab-icon" />
          설정
        </button>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="tab-content">
        {activeTab === 'youtube' && (
          <motion.div 
            className="youtube-tab"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="input-group">
              <label>유튜브 URL</label>
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                disabled={isAnalyzing}
              />
            </div>
            
            <button 
              className="analyze-button"
              onClick={handleYoutubeAnalysis}
              disabled={isAnalyzing || !youtubeUrl.trim()}
            >
              {isAnalyzing ? (
                <>
                  <div className="loading-spinner"></div>
                  분석 중...
                </>
              ) : (
                <>
                  <Play className="button-icon" />
                  분석 시작
                </>
              )}
            </button>
          </motion.div>
        )}

        {activeTab === 'upload' && (
          <motion.div 
            className="upload-tab"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="file-upload">
              <input
                type="file"
                id="file-input"
                accept=".mp4,.mov,.avi,.mkv"
                onChange={handleFileSelect}
                disabled={isAnalyzing}
                style={{ display: 'none' }}
              />
              <label htmlFor="file-input" className="file-upload-area">
                <Upload className="upload-icon" />
                <div className="upload-text">
                  <h3>파일을 선택하거나 드래그하세요</h3>
                  <p>지원 형식: MP4, MOV, AVI, MKV</p>
                  {file && <p className="selected-file">선택된 파일: {file.name}</p>}
                </div>
              </label>
            </div>

            <button 
              className="analyze-button"
              onClick={handleFileAnalysis}
              disabled={isAnalyzing || !file}
            >
              {isAnalyzing ? (
                <>
                  <div className="loading-spinner"></div>
                  분석 중...
                </>
              ) : (
                <>
                  <Play className="button-icon" />
                  분석 시작
                </>
              )}
            </button>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div 
            className="settings-tab"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="settings-group">
              <div className="setting-item">
                <label>영상 해상도</label>
                <select 
                  value={settings.resolution}
                  onChange={(e) => setSettings({...settings, resolution: e.target.value})}
                >
                  <option value="360p">360p (빠름)</option>
                  <option value="480p">480p</option>
                  <option value="720p">720p</option>
                  <option value="1080p">1080p (느림)</option>
                </select>
              </div>

              <div className="setting-item">
                <label>프레임 추출 간격 (초)</label>
                <input
                  type="range"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={settings.frameInterval}
                  onChange={(e) => setSettings({...settings, frameInterval: parseFloat(e.target.value)})}
                />
                <span className="range-value">{settings.frameInterval}초</span>
              </div>
            </div>

            <div className="settings-info">
              <h4>설정 안내</h4>
              <ul>
                <li><strong>해상도:</strong> 높을수록 정확하지만 처리 시간이 길어집니다.</li>
                <li><strong>프레임 간격:</strong> 짧을수록 정밀하지만 처리 시간이 길어집니다.</li>
              </ul>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default AnalysisPanel; 