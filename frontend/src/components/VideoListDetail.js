import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Play, 
  Clock, 
  Eye, 
  Calendar,
  Monitor,
  Target,
  TrendingUp,
  Trash2
} from 'lucide-react';
import './VideoListDetail.css';

const VideoListDetail = ({ analysisHistory, onBack, onSelectVideo, onDeleteVideo }) => {
  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0초';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins > 0 ? `${mins}분 ${secs}초` : `${secs}초`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBrandCount = (brandAnalysis) => {
    return brandAnalysis ? Object.keys(brandAnalysis).length : 0;
  };

  const getAverageConfidence = (brandAnalysis) => {
    if (!brandAnalysis) return 0;
    
    const brands = Object.keys(brandAnalysis);
    if (brands.length === 0) return 0;
    
    let totalConfidence = 0;
    let totalAppearances = 0;
    
    brands.forEach(brand => {
      const data = brandAnalysis[brand];
      totalConfidence += (data.average_confidence || 0) * data.appearances;
      totalAppearances += data.appearances;
    });
    
    return totalAppearances > 0 ? Math.round((totalConfidence / totalAppearances) * 100) : 0;
  };

  const handleDeleteVideo = (e, video) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    if (window.confirm(`"${video.video_info?.title || '분석 영상'}"을(를) 삭제하시겠습니까?`)) {
      onDeleteVideo(video.id);
    }
  };

  return (
    <motion.div 
      className="video-list-detail"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* 헤더 */}
      <motion.div className="detail-header" variants={itemVariants}>
        <button className="back-button" onClick={onBack}>
          <ArrowLeft className="back-icon" />
          <span>대시보드로 돌아가기</span>
        </button>
        <div className="header-content">
          <h1>분석된 영상 목록</h1>
          <p>총 {analysisHistory?.length || 0}개의 영상이 분석되었습니다</p>
        </div>
      </motion.div>

      {/* 영상 리스트 */}
      <div className="video-list">
        {analysisHistory && analysisHistory.length > 0 ? (
          analysisHistory.map((video, index) => (
            <motion.div 
              key={video.id || index}
              className="video-item"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              onClick={() => onSelectVideo(video)}
            >
              <div className="analysis-date">
                <Calendar className="date-icon" />
                {formatDate(video.timestamp)}
              </div>
              
              <div className="video-thumbnail">
                <div 
                  className="play-overlay"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (video.video_info?.input_url) {
                      window.open(video.video_info.input_url, '_blank');
                    }
                  }}
                >
                  <Play className="play-icon" />
                </div>
                <div className="video-index">#{index + 1}</div>
              </div>
              
              <div className="video-info">
                <div className="video-header">
                  <h3 className="video-title">
                    {video.video_info?.title || `분석 영상 #${index + 1}`}
                  </h3>
                </div>
                
                <div className="video-details">
                  <div className="detail-item">
                    <Clock className="detail-icon" />
                    <span>길이: {formatDuration(video.video_info?.duration)}</span>
                  </div>
                  <div className="detail-item">
                    <Monitor className="detail-icon" />
                    <span>
                      해상도: {video.analysis_settings?.resolution || '알 수 없음'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <Target className="detail-icon" />
                    <span>브랜드: {getBrandCount(video.brand_analysis)}개</span>
                  </div>
                  <div className="detail-item">
                    <TrendingUp className="detail-icon" />
                    <span>신뢰도: {getAverageConfidence(video.brand_analysis)}%</span>
                  </div>
                </div>
                
                <div className="video-stats">
                  <div className="stat-item">
                    <span className="stat-label">분석 시간</span>
                    <span className="stat-value">{Math.round(video.total_analysis_time || 0)}초</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">FPS</span>
                    <span className="stat-value">{video.video_info?.fps?.toFixed(1) || 0}</span>
                  </div>
                </div>
              </div>
              
              <div className="video-actions">
                <button className="view-button">
                  <Eye className="button-icon" />
                  상세 보기
                </button>
                <button 
                  className="delete-button"
                  onClick={(e) => handleDeleteVideo(e, video)}
                >
                  <Trash2 className="button-icon" />
                  삭제
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div className="empty-state" variants={itemVariants}>
            <Play className="empty-icon" />
            <h3>분석된 영상이 없습니다</h3>
            <p>영상을 업로드하고 분석을 시작해보세요.</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default VideoListDetail; 