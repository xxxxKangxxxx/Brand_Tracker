import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Eye, 
  Clock, 
  Target,
  BarChart3,
  PieChart,
  Activity,
  Play
} from 'lucide-react';
import MetricCard from './MetricCard';
import BrandChart from './BrandChart';
import TimelineChart from './TimelineChart';
import './Dashboard.css';

const Dashboard = ({ analysisResults, analysisHistory, isAnalyzing, onStartAnalysis }) => {
  // 기본 데이터 (분석 결과가 없을 때)
  const defaultMetrics = {
    totalVideos: 0,
    totalBrands: 0,
    totalAnalysisTime: 0,
    averageConfidence: 0
  };

  // 분석 결과에서 메트릭 계산
  const calculateMetrics = () => {
    // 전체 히스토리에서 누적 통계 계산
    const totalVideos = analysisHistory?.length || 0;
    
    if (totalVideos === 0) return defaultMetrics;

    let totalAnalysisTime = 0;
    let totalConfidence = 0;
    let totalAppearances = 0;
    const uniqueBrands = new Set();

    // 모든 분석 결과를 순회하며 누적 통계 계산
    analysisHistory.forEach(result => {
      if (result.brand_analysis) {
        const brands = Object.keys(result.brand_analysis);
        brands.forEach(brand => {
          uniqueBrands.add(brand);
          const data = result.brand_analysis[brand];
          totalConfidence += (data.average_confidence || 0) * data.appearances;
          totalAppearances += data.appearances;
        });
      }
      totalAnalysisTime += result.total_analysis_time || 0;
    });

    const averageConfidence = totalAppearances > 0 ? totalConfidence / totalAppearances : 0;

    return {
      totalVideos,
      totalBrands: uniqueBrands.size,
      totalAnalysisTime: Math.round(totalAnalysisTime),
      averageConfidence: Math.round(averageConfidence * 100)
    };
  };

  const metrics = calculateMetrics();

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

  return (
    <motion.div 
      className="dashboard"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* 헤더 */}
      <motion.div className="dashboard-header" variants={itemVariants}>
        <div>
          <h1>Dashboard</h1>
          <p>AI 기반 영상 내 브랜드 자동 탐지 및 분석</p>
        </div>
        <div className="header-actions">
          {isAnalyzing && (
            <div className="analyzing-indicator">
              <div className="loading-spinner"></div>
              <span>분석 중...</span>
            </div>
          )}
          {!isAnalyzing && (
            <button 
              className="start-analysis-btn"
              onClick={onStartAnalysis}
            >
              <Play className="btn-icon" />
              영상 분석하기
            </button>
          )}
        </div>
      </motion.div>

      {/* 메트릭 카드 */}
      <motion.div className="metrics-grid" variants={itemVariants}>
        <MetricCard
          title="분석된 영상"
          value={metrics.totalVideos}
          unit="개"
          icon={Eye}
          trend={metrics.totalVideos > 0 ? `+${metrics.totalVideos}` : "0%"}
          color="blue"
          clickable={true}
          onClick={() => window.dispatchEvent(new CustomEvent('openVideoDetails', { detail: { analysisHistory } }))}
        />
        <MetricCard
          title="탐지된 브랜드"
          value={metrics.totalBrands}
          unit="개"
          icon={Target}
          trend={metrics.totalBrands > 0 ? `+${metrics.totalBrands}` : "0"}
          color="green"
          clickable={true}
          onClick={() => window.dispatchEvent(new CustomEvent('openBrandDetails', { detail: { analysisHistory } }))}
        />
        <MetricCard
          title="분석 시간"
          value={metrics.totalAnalysisTime}
          unit="초"
          icon={Clock}
          trend={metrics.totalAnalysisTime > 0 ? "완료" : "대기"}
          color="purple"
          clickable={true}
          onClick={() => window.dispatchEvent(new CustomEvent('openAnalysisDetails', { detail: { analysisHistory } }))}
        />
        <MetricCard
          title="평균 신뢰도"
          value={metrics.averageConfidence}
          unit="%"
          icon={TrendingUp}
          trend={metrics.averageConfidence > 80 ? "높음" : metrics.averageConfidence > 60 ? "보통" : "낮음"}
          color="orange"
          clickable={true}
          onClick={() => window.dispatchEvent(new CustomEvent('openConfidenceDetails', { detail: { analysisHistory } }))}
        />
      </motion.div>

      {/* 차트 영역 */}
      <div className="charts-section">
        <div className="charts-grid">
          {/* 브랜드 분석 차트 */}
          <motion.div className="chart-container" variants={itemVariants}>
            <div className="chart-header">
              <h3>
                <BarChart3 className="chart-icon" />
                브랜드별 노출 분석
              </h3>
              <p>탐지된 브랜드의 등장 횟수와 노출 시간</p>
            </div>
            <div className="chart-content">
              <BrandChart data={analysisResults?.brand_analysis} />
            </div>
          </motion.div>

          {/* 타임라인 차트 */}
          <motion.div className="chart-container" variants={itemVariants}>
            <div className="chart-header">
              <h3>
                <Activity className="chart-icon" />
                브랜드 등장 타임라인
              </h3>
              <p>시간에 따른 브랜드 등장 패턴</p>
            </div>
            <div className="chart-content">
              <TimelineChart data={analysisResults?.brand_analysis} />
            </div>
          </motion.div>
        </div>

        {/* 요약 정보 */}
        {analysisResults && (
          <motion.div className="summary-section" variants={itemVariants}>
            <div className="summary-card">
              <h3>
                <PieChart className="summary-icon" />
                분석 요약
              </h3>
              <div className="summary-content">
                <div className="summary-item">
                  <span className="label">영상 길이:</span>
                  <span className="value">
                    {analysisResults.video_info?.duration?.toFixed(1) || 0}초
                  </span>
                </div>
                <div className="summary-item">
                  <span className="label">해상도:</span>
                  <span className="value">
                    {analysisResults.video_info?.width || 0} x {analysisResults.video_info?.height || 0}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="label">FPS:</span>
                  <span className="value">
                    {analysisResults.video_info?.fps?.toFixed(1) || 0}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="label">분석 완료:</span>
                  <span className="value">
                    {new Date(analysisResults.timestamp).toLocaleString('ko-KR')}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* 빈 상태 */}
      {!analysisResults && !isAnalyzing && (
        <motion.div className="empty-state" variants={itemVariants}>
          <div className="empty-content">
            <BarChart3 className="empty-icon" />
            <h3>분석 결과가 없습니다</h3>
            <p>영상을 업로드하고 분석을 시작해보세요.</p>
            <button 
              className="start-analysis-btn"
              onClick={onStartAnalysis}
            >
              분석 시작하기
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Dashboard; 