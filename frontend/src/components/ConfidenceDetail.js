import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  TrendingUp, 
  Award, 
  Target, 
  BarChart3,
  PieChart,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Zap,
  Activity
} from 'lucide-react';
import './ConfidenceDetail.css';

const ConfidenceDetail = ({ analysisHistory, onBack }) => {
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

  // 신뢰도 통계 계산
  const calculateConfidenceStats = () => {
    if (!analysisHistory || analysisHistory.length === 0) {
      return {
        overallStats: { high: 0, medium: 0, low: 0, total: 0, average: 0 },
        brandStats: [],
        confidenceDistribution: [],
        qualityMetrics: { excellent: 0, good: 0, fair: 0, poor: 0 }
      };
    }

    const brandConfidenceData = {};
    const allConfidences = [];
    let totalDetections = 0;

    // 모든 분석 결과에서 신뢰도 데이터 수집
    analysisHistory.forEach((analysis, videoIndex) => {
      if (analysis.brand_analysis) {
        Object.entries(analysis.brand_analysis).forEach(([brandName, data]) => {
          if (!brandConfidenceData[brandName]) {
            brandConfidenceData[brandName] = {
              name: brandName,
              confidences: [],
              detections: 0,
              videoCount: 0,
              highCount: 0,
              mediumCount: 0,
              lowCount: 0
            };
          }

          const brand = brandConfidenceData[brandName];
          brand.videoCount++;
          brand.detections += data.appearances || 0;

          if (data.average_confidence) {
            const confidence = data.average_confidence * 100;
            brand.confidences.push(confidence);
            allConfidences.push(confidence);
            totalDetections++;

            // 신뢰도 등급별 카운트
            if (confidence >= 80) brand.highCount++;
            else if (confidence >= 60) brand.mediumCount++;
            else brand.lowCount++;
          }

          // 개별 탐지 결과도 수집
          if (data.detections) {
            data.detections.forEach(detection => {
              const confidence = detection.confidence * 100;
              allConfidences.push(confidence);
              totalDetections++;
            });
          }
        });
      }
    });

    // 브랜드별 통계 계산
    const brandStats = Object.values(brandConfidenceData).map(brand => {
      const avgConfidence = brand.confidences.length > 0 
        ? brand.confidences.reduce((a, b) => a + b, 0) / brand.confidences.length 
        : 0;
      
      const maxConfidence = brand.confidences.length > 0 
        ? Math.max(...brand.confidences) 
        : 0;
      
      const minConfidence = brand.confidences.length > 0 
        ? Math.min(...brand.confidences) 
        : 0;

      const stdDev = brand.confidences.length > 1 
        ? Math.sqrt(brand.confidences.reduce((sum, conf) => sum + Math.pow(conf - avgConfidence, 2), 0) / brand.confidences.length)
        : 0;

      return {
        ...brand,
        avgConfidence,
        maxConfidence,
        minConfidence,
        stdDev,
        consistency: stdDev < 10 ? 'high' : stdDev < 20 ? 'medium' : 'low'
      };
    }).sort((a, b) => b.avgConfidence - a.avgConfidence);

    // 전체 통계
    const overallAverage = allConfidences.length > 0 
      ? allConfidences.reduce((a, b) => a + b, 0) / allConfidences.length 
      : 0;

    const overallStats = {
      high: allConfidences.filter(c => c >= 80).length,
      medium: allConfidences.filter(c => c >= 60 && c < 80).length,
      low: allConfidences.filter(c => c < 60).length,
      total: allConfidences.length,
      average: overallAverage
    };

    // 신뢰도 분포 (10% 간격)
    const confidenceDistribution = Array.from({ length: 10 }, (_, i) => {
      const min = i * 10;
      const max = (i + 1) * 10;
      const count = allConfidences.filter(c => c >= min && c < max).length;
      return { range: `${min}-${max}%`, count, percentage: (count / allConfidences.length) * 100 };
    });

    // 품질 메트릭
    const qualityMetrics = {
      excellent: allConfidences.filter(c => c >= 90).length,
      good: allConfidences.filter(c => c >= 80 && c < 90).length,
      fair: allConfidences.filter(c => c >= 60 && c < 80).length,
      poor: allConfidences.filter(c => c < 60).length
    };

    return {
      overallStats,
      brandStats,
      confidenceDistribution,
      qualityMetrics
    };
  };

  const stats = calculateConfidenceStats();

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return '#10b981';
    if (confidence >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 90) return '매우 높음';
    if (confidence >= 80) return '높음';
    if (confidence >= 60) return '보통';
    return '낮음';
  };

  const getConsistencyColor = (consistency) => {
    switch (consistency) {
      case 'high': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'low': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getConsistencyLabel = (consistency) => {
    switch (consistency) {
      case 'high': return '일관적';
      case 'medium': return '보통';
      case 'low': return '불안정';
      default: return '알 수 없음';
    }
  };

  return (
    <motion.div 
      className="confidence-detail"
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
          <h1>평균 신뢰도 상세</h1>
          <p>총 {stats.overallStats.total}개 탐지 결과의 신뢰도 분석 및 통계</p>
        </div>
      </motion.div>

      {stats.overallStats.total > 0 ? (
        <div className="confidence-content">
          {/* 전체 신뢰도 요약 */}
          <motion.div className="confidence-summary" variants={itemVariants}>
            <div className="summary-cards">
              <div className="summary-card">
                <TrendingUp className="summary-icon" />
                <div className="summary-info">
                  <span className="summary-value">{Math.round(stats.overallStats.average)}%</span>
                  <span className="summary-label">전체 평균 신뢰도</span>
                </div>
              </div>
              <div className="summary-card high">
                <CheckCircle className="summary-icon" />
                <div className="summary-info">
                  <span className="summary-value">{stats.overallStats.high}</span>
                  <span className="summary-label">높은 신뢰도 (80%+)</span>
                </div>
              </div>
              <div className="summary-card medium">
                <AlertTriangle className="summary-icon" />
                <div className="summary-info">
                  <span className="summary-value">{stats.overallStats.medium}</span>
                  <span className="summary-label">보통 신뢰도 (60-79%)</span>
                </div>
              </div>
              <div className="summary-card low">
                <XCircle className="summary-icon" />
                <div className="summary-info">
                  <span className="summary-value">{stats.overallStats.low}</span>
                  <span className="summary-label">낮은 신뢰도 (~59%)</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 품질 메트릭 */}
          <motion.div className="quality-metrics" variants={itemVariants}>
            <h2>탐지 품질 분석</h2>
            <div className="quality-grid">
              <div className="quality-item excellent">
                <Award className="quality-icon" />
                <div className="quality-content">
                  <span className="quality-value">{stats.qualityMetrics.excellent}</span>
                  <span className="quality-label">매우 우수 (90%+)</span>
                  <span className="quality-percentage">
                    {((stats.qualityMetrics.excellent / stats.overallStats.total) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="quality-item good">
                <CheckCircle className="quality-icon" />
                <div className="quality-content">
                  <span className="quality-value">{stats.qualityMetrics.good}</span>
                  <span className="quality-label">우수 (80-89%)</span>
                  <span className="quality-percentage">
                    {((stats.qualityMetrics.good / stats.overallStats.total) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="quality-item fair">
                <Target className="quality-icon" />
                <div className="quality-content">
                  <span className="quality-value">{stats.qualityMetrics.fair}</span>
                  <span className="quality-label">양호 (60-79%)</span>
                  <span className="quality-percentage">
                    {((stats.qualityMetrics.fair / stats.overallStats.total) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="quality-item poor">
                <XCircle className="quality-icon" />
                <div className="quality-content">
                  <span className="quality-value">{stats.qualityMetrics.poor}</span>
                  <span className="quality-label">개선 필요 (~59%)</span>
                  <span className="quality-percentage">
                    {((stats.qualityMetrics.poor / stats.overallStats.total) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 브랜드별 신뢰도 분석 */}
          <motion.div className="brand-confidence-analysis" variants={itemVariants}>
            <h2>브랜드별 신뢰도 분석</h2>
            <div className="brand-confidence-items">
              {stats.brandStats.map((brand, index) => (
                <motion.div 
                  key={brand.name}
                  className="brand-confidence-item"
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="brand-confidence-header">
                    <div className="brand-info">
                      <h3 className="brand-name">{brand.name}</h3>
                      <div className="brand-rank">#{index + 1} 신뢰도 순위</div>
                    </div>
                    <div className="confidence-score">
                      <div 
                        className="score-badge"
                        style={{ 
                          backgroundColor: `${getConfidenceColor(brand.avgConfidence)}20`,
                          borderColor: getConfidenceColor(brand.avgConfidence),
                          color: getConfidenceColor(brand.avgConfidence)
                        }}
                      >
                        <Award className="score-icon" />
                        <span>{Math.round(brand.avgConfidence)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="confidence-stats">
                    <div className="stat-row">
                      <div className="stat-item">
                        <Eye className="stat-icon" />
                        <span className="stat-label">총 탐지</span>
                        <span className="stat-value">{brand.detections}회</span>
                      </div>
                      <div className="stat-item">
                        <BarChart3 className="stat-icon" />
                        <span className="stat-label">등장 영상</span>
                        <span className="stat-value">{brand.videoCount}개</span>
                      </div>
                    </div>
                    <div className="stat-row">
                      <div className="stat-item">
                        <TrendingUp className="stat-icon" />
                        <span className="stat-label">신뢰도 범위</span>
                        <span className="stat-value">
                          {Math.round(brand.minConfidence)}% - {Math.round(brand.maxConfidence)}%
                        </span>
                      </div>
                      <div className="stat-item">
                        <Activity className="stat-icon" />
                        <span className="stat-label">일관성</span>
                        <span 
                          className="stat-value"
                          style={{ color: getConsistencyColor(brand.consistency) }}
                        >
                          {getConsistencyLabel(brand.consistency)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 신뢰도 등급 분포 */}
                  <div className="confidence-grade-distribution">
                    <div className="distribution-label">신뢰도 등급 분포</div>
                    <div className="grade-bars">
                      <div className="grade-bar">
                        <span className="grade-label">높음</span>
                        <div className="grade-progress">
                          <div 
                            className="grade-fill high"
                            style={{ width: `${(brand.highCount / brand.confidences.length) * 100}%` }}
                          />
                        </div>
                        <span className="grade-count">{brand.highCount}</span>
                      </div>
                      <div className="grade-bar">
                        <span className="grade-label">보통</span>
                        <div className="grade-progress">
                          <div 
                            className="grade-fill medium"
                            style={{ width: `${(brand.mediumCount / brand.confidences.length) * 100}%` }}
                          />
                        </div>
                        <span className="grade-count">{brand.mediumCount}</span>
                      </div>
                      <div className="grade-bar">
                        <span className="grade-label">낮음</span>
                        <div className="grade-progress">
                          <div 
                            className="grade-fill low"
                            style={{ width: `${(brand.lowCount / brand.confidences.length) * 100}%` }}
                          />
                        </div>
                        <span className="grade-count">{brand.lowCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* 신뢰도 품질 표시 */}
                  <div className="confidence-quality">
                    <span className="quality-label">품질 등급:</span>
                    <span 
                      className="quality-badge"
                      style={{ color: getConfidenceColor(brand.avgConfidence) }}
                    >
                      {getConfidenceLabel(brand.avgConfidence)}
                    </span>
                    <span className="consistency-info">
                      (표준편차: {brand.stdDev.toFixed(1)}%)
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      ) : (
        <motion.div className="empty-state" variants={itemVariants}>
          <TrendingUp className="empty-icon" />
          <h3>신뢰도 데이터가 없습니다</h3>
          <p>영상을 분석하면 신뢰도 통계가 여기에 표시됩니다.</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ConfidenceDetail; 