import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Clock, 
  Zap, 
  Cpu, 
  HardDrive,
  BarChart3,
  TrendingUp,
  Activity,
  Timer,
  PlayCircle,
  CheckCircle
} from 'lucide-react';
import './AnalysisDetail.css';

const AnalysisDetail = ({ analysisHistory, onBack }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
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

  // 분석 통계 계산
  const calculateAnalysisStats = () => {
    if (!analysisHistory || analysisHistory.length === 0) {
      return {
        totalAnalysisTime: 0,
        totalVideoTime: 0,
        averageAnalysisTime: 0,
        averageProcessingSpeed: 0,
        totalFramesProcessed: 0,
        averageFPS: 0,
        performanceData: []
      };
    }

    let totalAnalysisTime = 0;
    let totalVideoTime = 0;
    let totalFrames = 0;
    let totalFPS = 0;
    const performanceData = [];

    analysisHistory.forEach((analysis, index) => {
      const analysisTime = analysis.total_analysis_time || 0;
      const videoTime = analysis.video_info?.duration || 0;
      const fps = analysis.video_info?.fps || 0;
      const frames = Math.round(videoTime * fps);

      totalAnalysisTime += analysisTime;
      totalVideoTime += videoTime;
      totalFrames += frames;
      totalFPS += fps;

      performanceData.push({
        index: index + 1,
        videoTime,
        analysisTime,
        fps,
        frames,
        processingSpeed: videoTime > 0 ? analysisTime / videoTime : 0,
        efficiency: analysisTime > 0 ? videoTime / analysisTime : 0,
        timestamp: analysis.timestamp,
        brandCount: analysis.brand_analysis ? Object.keys(analysis.brand_analysis).length : 0
      });
    });

    return {
      totalAnalysisTime,
      totalVideoTime,
      averageAnalysisTime: totalAnalysisTime / analysisHistory.length,
      averageProcessingSpeed: totalVideoTime > 0 ? totalAnalysisTime / totalVideoTime : 0,
      totalFramesProcessed: totalFrames,
      averageFPS: totalFPS / analysisHistory.length,
      performanceData: performanceData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    };
  };

  const stats = calculateAnalysisStats();

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds.toFixed(1)}초`;
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return `${mins}분 ${secs}초`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 1) return '#10b981'; // 실시간 이상
    if (efficiency >= 0.5) return '#f59e0b'; // 준실시간
    return '#ef4444'; // 느림
  };

  const getEfficiencyLabel = (efficiency) => {
    if (efficiency >= 1) return '실시간+';
    if (efficiency >= 0.5) return '준실시간';
    return '처리 지연';
  };

  return (
    <motion.div 
      className="analysis-detail"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="detail-header" variants={itemVariants}>
        <button className="back-button" onClick={onBack}>
          <ArrowLeft className="back-icon" />
          <span>대시보드로 돌아가기</span>
        </button>
        <div className="header-content">
          <h1>분석 시간 상세</h1>
          <p>총 {analysisHistory?.length || 0}개 영상의 분석 성능 및 처리 통계</p>
        </div>
      </motion.div>

      {analysisHistory && analysisHistory.length > 0 ? (
        <div className="analysis-content">
          {/* 전체 통계 요약 */}
          <motion.div className="analysis-summary" variants={itemVariants}>
            <div className="summary-cards">
              <div className="summary-card">
                <Clock className="summary-icon" />
                <div className="summary-info">
                  <span className="summary-value">{formatTime(stats.totalAnalysisTime)}</span>
                  <span className="summary-label">총 분석 시간</span>
                </div>
              </div>
              <div className="summary-card">
                <PlayCircle className="summary-icon" />
                <div className="summary-info">
                  <span className="summary-value">{formatTime(stats.totalVideoTime)}</span>
                  <span className="summary-label">총 영상 길이</span>
                </div>
              </div>
              <div className="summary-card">
                <Zap className="summary-icon" />
                <div className="summary-info">
                  <span className="summary-value">{stats.averageProcessingSpeed.toFixed(1)}x</span>
                  <span className="summary-label">평균 처리 속도</span>
                </div>
              </div>
              <div className="summary-card">
                <Activity className="summary-icon" />
                <div className="summary-info">
                  <span className="summary-value">{Math.round(stats.averageFPS)}</span>
                  <span className="summary-label">평균 FPS</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 성능 분석 차트 영역 */}
          <motion.div className="performance-overview" variants={itemVariants}>
            <h2>처리 성능 개요</h2>
            <div className="performance-metrics">
              <div className="metric-item">
                <HardDrive className="metric-icon" />
                <div className="metric-content">
                  <span className="metric-label">총 처리 프레임</span>
                  <span className="metric-value">{stats.totalFramesProcessed.toLocaleString()}개</span>
                </div>
              </div>
              <div className="metric-item">
                <Cpu className="metric-icon" />
                <div className="metric-content">
                  <span className="metric-label">평균 분석 시간</span>
                  <span className="metric-value">{formatTime(stats.averageAnalysisTime)}</span>
                </div>
              </div>
              <div className="metric-item">
                <TrendingUp className="metric-icon" />
                <div className="metric-content">
                  <span className="metric-label">처리 효율성</span>
                  <span className="metric-value">
                    {stats.totalVideoTime > 0 ? 
                      `${((stats.totalVideoTime / stats.totalAnalysisTime) * 100).toFixed(1)}%` 
                      : '0%'
                    }
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 영상별 분석 성능 */}
          <motion.div className="video-performance-list" variants={itemVariants}>
            <h2>영상별 분석 성능</h2>
            <div className="performance-items">
              {stats.performanceData.map((video, index) => (
                <motion.div 
                  key={index}
                  className="performance-item"
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="performance-header">
                    <div className="video-info">
                      <h3 className="video-title">영상 #{video.index}</h3>
                      <span className="analysis-date">{formatDate(video.timestamp)}</span>
                    </div>
                    <div className="efficiency-badge">
                      <div 
                        className="efficiency-indicator"
                        style={{ 
                          backgroundColor: `${getEfficiencyColor(video.efficiency)}20`,
                          borderColor: getEfficiencyColor(video.efficiency),
                          color: getEfficiencyColor(video.efficiency)
                        }}
                      >
                        <Timer className="efficiency-icon" />
                        <span>{getEfficiencyLabel(video.efficiency)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="performance-stats">
                    <div className="stat-row">
                      <div className="stat-item">
                        <PlayCircle className="stat-icon" />
                        <span className="stat-label">영상 길이</span>
                        <span className="stat-value">{formatTime(video.videoTime)}</span>
                      </div>
                      <div className="stat-item">
                        <Clock className="stat-icon" />
                        <span className="stat-label">분석 시간</span>
                        <span className="stat-value">{formatTime(video.analysisTime)}</span>
                      </div>
                    </div>
                    <div className="stat-row">
                      <div className="stat-item">
                        <Activity className="stat-icon" />
                        <span className="stat-label">FPS</span>
                        <span className="stat-value">{video.fps.toFixed(1)}</span>
                      </div>
                      <div className="stat-item">
                        <BarChart3 className="stat-icon" />
                        <span className="stat-label">탐지 브랜드</span>
                        <span className="stat-value">{video.brandCount}개</span>
                      </div>
                    </div>
                  </div>

                  {/* 처리 속도 시각화 */}
                  <div className="speed-visualization">
                    <div className="speed-info">
                      <span className="speed-label">처리 속도: {video.processingSpeed.toFixed(2)}x</span>
                      <span className="efficiency-ratio">
                        효율성: {(video.efficiency * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="speed-bar">
                      <div 
                        className="speed-fill"
                        style={{ 
                          width: `${Math.min(video.efficiency * 100, 100)}%`,
                          backgroundColor: getEfficiencyColor(video.efficiency)
                        }}
                      />
                    </div>
                  </div>

                  {/* 처리 단계 */}
                  <div className="processing-stages">
                    <div className="stage-item completed">
                      <CheckCircle className="stage-icon" />
                      <span>영상 다운로드</span>
                    </div>
                    <div className="stage-item completed">
                      <CheckCircle className="stage-icon" />
                      <span>프레임 추출</span>
                    </div>
                    <div className="stage-item completed">
                      <CheckCircle className="stage-icon" />
                      <span>AI 분석</span>
                    </div>
                    <div className="stage-item completed">
                      <CheckCircle className="stage-icon" />
                      <span>결과 저장</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      ) : (
        <motion.div className="empty-state" variants={itemVariants}>
          <Clock className="empty-icon" />
          <h3>분석 데이터가 없습니다</h3>
          <p>영상을 분석하면 성능 통계가 여기에 표시됩니다.</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AnalysisDetail; 