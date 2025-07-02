import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Target, 
  TrendingUp, 
  Clock, 
  Eye,
  BarChart3,
  Zap,
  Award,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import './BrandDetail.css';

const BrandDetail = ({ analysisHistory, onBack }) => {
  // 각 영상의 타임라인 확장 상태 관리
  const [expandedTimelines, setExpandedTimelines] = useState({});
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

  // 모든 분석 결과에서 브랜드 데이터 수집
  const collectBrandData = () => {
    const brandStats = {};
    
    if (!analysisHistory || analysisHistory.length === 0) return {};

    analysisHistory.forEach((analysis, analysisIndex) => {
      if (analysis.brand_analysis) {
        Object.entries(analysis.brand_analysis).forEach(([brandName, data]) => {
          if (!brandStats[brandName]) {
            brandStats[brandName] = {
              name: brandName,
              totalAppearances: 0,
              totalExposureTime: 0,
              confidenceScores: [],
              appearances: [],
              videoCount: 0,
              avgConfidence: 0,
              maxConfidence: 0,
              minConfidence: 100
            };
          }

          const brand = brandStats[brandName];
          brand.totalAppearances += data.appearances || 0;
          brand.totalExposureTime += data.total_seconds || 0; // total_seconds 사용
          brand.videoCount += 1;

          // 신뢰도 점수 수집
          if (data.average_confidence) {
            brand.confidenceScores.push(data.average_confidence * 100);
            brand.maxConfidence = Math.max(brand.maxConfidence, data.average_confidence * 100);
            brand.minConfidence = Math.min(brand.minConfidence, data.average_confidence * 100);
          }

          // 개별 등장 정보 수집 (timestamps와 confidence_scores 배열 사용)
          if (data.timestamps && data.confidence_scores) {
            data.timestamps.forEach((timestamp, idx) => {
              const confidence = data.confidence_scores[idx] || 0;
              brand.appearances.push({
                videoIndex: analysisIndex,
                timestamp: timestamp,
                confidence: confidence * 100,
                bbox: null // bbox 정보는 현재 저장되지 않음
              });
            });
          }
        });
      }
    });

    // 평균 신뢰도 계산
    Object.values(brandStats).forEach(brand => {
      if (brand.confidenceScores.length > 0) {
        brand.avgConfidence = brand.confidenceScores.reduce((a, b) => a + b, 0) / brand.confidenceScores.length;
      }
    });

    return brandStats;
  };

  const brandData = collectBrandData();
  const brands = Object.values(brandData).sort((a, b) => b.totalAppearances - a.totalAppearances);

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds.toFixed(1)}초`;
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return `${mins}분 ${secs}초`;
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return '#10b981'; // 높음 - 초록
    if (confidence >= 60) return '#f59e0b'; // 보통 - 주황
    return '#ef4444'; // 낮음 - 빨강
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 80) return '높음';
    if (confidence >= 60) return '보통';
    return '낮음';
  };

  // 타임라인 확장/축소 토글
  const toggleTimeline = (brandName, videoIndex) => {
    const key = `${brandName}-${videoIndex}`;
    setExpandedTimelines(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // 특정 타임라인이 확장되어 있는지 확인
  const isTimelineExpanded = (brandName, videoIndex) => {
    const key = `${brandName}-${videoIndex}`;
    return expandedTimelines[key] || false;
  };

  return (
    <motion.div 
      className="brand-detail"
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
          <h1>탐지된 브랜드 상세</h1>
          <p>총 {brands.length}개 브랜드가 {analysisHistory?.length || 0}개 영상에서 탐지되었습니다</p>
        </div>
      </motion.div>

      {brands.length > 0 ? (
        <div className="brand-content">
          {/* 브랜드 요약 통계 */}
          <motion.div className="brand-summary" variants={itemVariants}>
            <div className="summary-cards">
              <div className="summary-card">
                <Target className="summary-icon" />
                <div className="summary-info">
                  <span className="summary-value">{brands.length}</span>
                  <span className="summary-label">총 브랜드 수</span>
                </div>
              </div>
              <div className="summary-card">
                <Eye className="summary-icon" />
                <div className="summary-info">
                  <span className="summary-value">
                    {brands.reduce((sum, brand) => sum + brand.totalAppearances, 0)}
                  </span>
                  <span className="summary-label">총 등장 횟수</span>
                </div>
              </div>
              <div className="summary-card">
                <Clock className="summary-icon" />
                <div className="summary-info">
                  <span className="summary-value">
                    {formatTime(brands.reduce((sum, brand) => sum + brand.totalExposureTime, 0))}
                  </span>
                  <span className="summary-label">총 노출 시간</span>
                </div>
              </div>
              <div className="summary-card">
                <TrendingUp className="summary-icon" />
                <div className="summary-info">
                  <span className="summary-value">
                    {brands.length > 0 ? 
                      Math.round(brands.reduce((sum, brand) => sum + brand.avgConfidence, 0) / brands.length) : 0
                    }%
                  </span>
                  <span className="summary-label">평균 신뢰도</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 브랜드 상세 리스트 */}
          <motion.div className="brand-list" variants={itemVariants}>
            <h2>브랜드별 상세 분석</h2>
            <div className="brand-items">
              {brands.map((brand, index) => (
                <motion.div 
                  key={brand.name}
                  className="brand-item"
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="brand-header">
                    <div className="brand-info">
                      <h3 className="brand-name">{brand.name}</h3>
                      <div className="brand-rank">#{index + 1} 순위</div>
                    </div>
                    <div className="brand-confidence">
                      <div 
                        className="confidence-badge"
                        style={{ 
                          backgroundColor: `${getConfidenceColor(brand.avgConfidence)}20`,
                          borderColor: getConfidenceColor(brand.avgConfidence),
                          color: getConfidenceColor(brand.avgConfidence)
                        }}
                      >
                        <Award className="confidence-icon" />
                        <span>{Math.round(brand.avgConfidence)}% ({getConfidenceLabel(brand.avgConfidence)})</span>
                      </div>
                    </div>
                  </div>

                  <div className="brand-stats">
                    <div className="stat-row">
                      <div className="stat-item">
                        <Eye className="stat-icon" />
                        <span className="stat-label">등장 횟수</span>
                        <span className="stat-value">{brand.totalAppearances}회</span>
                      </div>
                      <div className="stat-item">
                        <Clock className="stat-icon" />
                        <span className="stat-label">노출 시간</span>
                        <span className="stat-value">{formatTime(brand.totalExposureTime)}</span>
                      </div>
                    </div>
                    <div className="stat-row">
                      <div className="stat-item">
                        <BarChart3 className="stat-icon" />
                        <span className="stat-label">등장 영상</span>
                        <span className="stat-value">{brand.videoCount}개</span>
                      </div>
                      <div className="stat-item">
                        <Zap className="stat-icon" />
                        <span className="stat-label">신뢰도 범위</span>
                        <span className="stat-value">
                          {Math.round(brand.minConfidence)}% - {Math.round(brand.maxConfidence)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 신뢰도 분포 바 */}
                                     {/* 신뢰도 분포 바 */}
                   <div className="confidence-distribution">
                     <div className="distribution-label">신뢰도 분포</div>
                     <div className="distribution-bar">
                       <div 
                         className="distribution-fill"
                         style={{ 
                           width: `${brand.avgConfidence}%`,
                           backgroundColor: getConfidenceColor(brand.avgConfidence)
                         }}
                       />
                     </div>
                     <div className="distribution-values">
                       <span>0%</span>
                       <span>100%</span>
                     </div>
                   </div>

                   {/* 영상별 등장 내역 */}
                   <div className="video-appearances">
                     <h4 className="appearances-title">영상별 등장 내역</h4>
                     <div className="video-list">
                       {analysisHistory
                         .map((video, videoIndex) => {
                           const brandInVideo = video.brand_analysis?.[brand.name];
                           if (!brandInVideo) return null;
                           
                           return (
                             <div key={videoIndex} className="video-appearance-item">
                               <div className="video-info">
                                 <div className="video-title">
                                   영상 #{videoIndex + 1}
                                   <span className="video-date">
                                     {new Date(video.timestamp).toLocaleDateString('ko-KR')}
                                   </span>
                                 </div>
                                 <div className="video-duration">
                                   길이: {formatTime(video.video_info?.duration || 0)}
                                 </div>
                               </div>
                               
                               <div className="appearance-stats">
                                 <div className="appearance-stat">
                                   <Eye className="appearance-icon" />
                                   <span>{brandInVideo.appearances || 0}회 등장</span>
                                 </div>
                                 <div className="appearance-stat">
                                   <Clock className="appearance-icon" />
                                   <span>{formatTime(brandInVideo.total_seconds || 0)} 노출</span>
                                 </div>
                                 <div className="appearance-stat">
                                   <TrendingUp className="appearance-icon" />
                                   <span 
                                     style={{ color: getConfidenceColor((brandInVideo.average_confidence || 0) * 100) }}
                                   >
                                     {Math.round((brandInVideo.average_confidence || 0) * 100)}% 신뢰도
                                   </span>
                                 </div>
                               </div>
                               
                               {/* 타임라인 정보 */}
                               {brandInVideo.timestamps && brandInVideo.timestamps.length > 0 && (
                                 <div className="timeline-info">
                                   <div className="timeline-label">등장 시점:</div>
                                   <div className="timeline-points">
                                     {/* 처음 5개 항목은 항상 표시 */}
                                     {brandInVideo.timestamps.slice(0, 5).map((timestamp, detIndex) => (
                                       <span key={detIndex} className="timeline-point">
                                         {Math.round(timestamp)}초
                                         <span className="confidence-mini">
                                           ({Math.round((brandInVideo.confidence_scores?.[detIndex] || 0) * 100)}%)
                                         </span>
                                       </span>
                                     ))}
                                     
                                     {/* 확장된 상태에서 나머지 항목들 표시 */}
                                     {isTimelineExpanded(brand.name, videoIndex) && 
                                       brandInVideo.timestamps.slice(5).map((timestamp, detIndex) => (
                                         <span key={detIndex + 5} className="timeline-point">
                                           {Math.round(timestamp)}초
                                           <span className="confidence-mini">
                                             ({Math.round((brandInVideo.confidence_scores?.[detIndex + 5] || 0) * 100)}%)
                                           </span>
                                         </span>
                                       ))
                                     }
                                     
                                     {/* 더보기/접기 버튼 */}
                                     {brandInVideo.timestamps.length > 5 && (
                                       <button 
                                         className="timeline-toggle-btn"
                                         onClick={() => toggleTimeline(brand.name, videoIndex)}
                                       >
                                         {isTimelineExpanded(brand.name, videoIndex) ? (
                                           <>
                                             <ChevronUp className="toggle-icon" />
                                             <span>접기</span>
                                           </>
                                         ) : (
                                           <>
                                             <ChevronDown className="toggle-icon" />
                                             <span>+{brandInVideo.timestamps.length - 5}개 더</span>
                                           </>
                                         )}
                                       </button>
                                     )}
                                   </div>
                                 </div>
                               )}
                             </div>
                           );
                         })
                         .filter(Boolean)}
                     </div>
                   </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      ) : (
        <motion.div className="empty-state" variants={itemVariants}>
          <Target className="empty-icon" />
          <h3>탐지된 브랜드가 없습니다</h3>
          <p>영상을 분석하면 브랜드 정보가 여기에 표시됩니다.</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default BrandDetail; 