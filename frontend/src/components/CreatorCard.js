import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Heart, X, Eye, Target, Clock, TrendingUp, BarChart3, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BrandChart from './BrandChart';
import TimelineChart from './TimelineChart';
import MetricCard from './MetricCard';
import './CreatorCard.css';

const API_BASE_URL = 'http://localhost:8000';

const CreatorCard = ({ creator }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDashboardModalOpen, setIsDashboardModalOpen] = useState(false);
  const [creatorAnalysisData, setCreatorAnalysisData] = useState(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleViewMore = async () => {
    setIsDashboardModalOpen(true);
    setIsLoadingAnalysis(true);
    // 모달이 열릴 때 body 스크롤 막기
    document.body.style.overflow = 'hidden';
    
    try {
      // 크리에이터의 분석 히스토리 가져오기
      // creator.id는 이메일(id), creator.username은 표시용 이름
      const searchId = creator.id;
      console.log(`🔍 [크리에이터 분석 조회] 크리에이터: ${creator.username}, 검색 id: ${searchId}`);
      
      const response = await fetch(
        `${API_BASE_URL}/analysis/history?limit=20&username=${encodeURIComponent(searchId)}`
      );
      
      if (response.ok) {
        const result = await response.json();
        let historyData = [];
        
        if (result.data && Array.isArray(result.data)) {
          historyData = result.data;
        } else if (Array.isArray(result)) {
          historyData = result;
        }
        
        console.log(`✅ [크리에이터 분석 조회] ${creator.username}의 분석 결과: ${historyData.length}개`);
        if (historyData.length === 0) {
          // 디버깅: 모든 분석 결과를 가져와서 실제 id 확인
          const allResponse = await fetch(`${API_BASE_URL}/analysis/history?limit=100`);
          if (allResponse.ok) {
            const allResult = await allResponse.json();
            const allData = allResult.data || (Array.isArray(allResult) ? allResult : []);
            const uniqueIds = [...new Set(allData.map(a => a.username).filter(Boolean))];
            console.log(`📋 [디버깅] 저장된 모든 분석 결과의 id 목록:`, uniqueIds);
            console.log(`📋 [디버깅] 검색한 id: "${searchId}"`);
          }
        }
        
        setCreatorAnalysisData(historyData);
      } else {
        console.error(`❌ [크리에이터 분석 조회] API 오류: ${response.status}`);
        setCreatorAnalysisData([]);
      }
    } catch (error) {
      console.error('분석 히스토리 로드 실패:', error);
      setCreatorAnalysisData([]);
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const handleCloseDashboardModal = () => {
    setIsDashboardModalOpen(false);
    setCreatorAnalysisData(null);
    // 모달이 닫힐 때 body 스크롤 복원
    document.body.style.overflow = 'unset';
  };

  // 통계 계산 함수
  const calculateMetrics = () => {
    if (!creatorAnalysisData || creatorAnalysisData.length === 0) {
      return {
        totalVideos: 0,
        totalBrands: 0,
        totalAnalysisTime: 0,
        averageConfidence: 0
      };
    }

    let totalAnalysisTime = 0;
    let totalConfidence = 0;
    let totalAppearances = 0;
    const uniqueBrands = new Set();
    let allBrandAnalysis = {};

    creatorAnalysisData.forEach(result => {
      if (result.brand_analysis) {
        const brands = Object.keys(result.brand_analysis);
        brands.forEach(brand => {
          uniqueBrands.add(brand);
          const data = result.brand_analysis[brand];
          totalConfidence += (data.average_confidence || 0) * data.appearances;
          totalAppearances += data.appearances;
          
          // 모든 분석 결과의 브랜드 데이터 통합
          if (!allBrandAnalysis[brand]) {
            allBrandAnalysis[brand] = {
              appearances: 0,
              total_seconds: 0,
              average_confidence: 0,
              max_confidence: 0
            };
          }
          allBrandAnalysis[brand].appearances += data.appearances || 0;
          allBrandAnalysis[brand].total_seconds += data.total_seconds || 0;
        });
      }
      totalAnalysisTime += result.total_analysis_time || 0;
    });

    const averageConfidence = totalAppearances > 0 ? totalConfidence / totalAppearances : 0;

    return {
      totalVideos: creatorAnalysisData.length,
      totalBrands: uniqueBrands.size,
      totalAnalysisTime: Math.round(totalAnalysisTime),
      averageConfidence: Math.round(averageConfidence * 100),
      brandAnalysis: allBrandAnalysis
    };
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleConfirm = async () => {
    try {
      // 회사 프로필 정보 가져오기
      const companyProfile = JSON.parse(localStorage.getItem('companyProfile') || '{}');
      const companyName = companyProfile.name || 'Company';
      
      // 협업 제안 알림 전송
      const response = await fetch('http://localhost:8000/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to_user: creator.id,
          from_user: companyName,
          from_type: 'company',
          type: 'collaboration_request',
          message: '협업 제안이 도착했습니다.',
            data: {
              company_name: companyName,
              creator_name: creator.username
            }
        })
      });
      
      if (response.ok) {
        alert('협업 제안이 성공적으로 전송되었습니다!');
        setIsModalOpen(false);
      } else {
        throw new Error('전송 실패');
      }
    } catch (error) {
      console.error('협업 제안 전송 실패:', error);
      alert('협업 제안 전송에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="creator-card">
      <button 
        className={`like-button ${isLiked ? 'liked' : ''}`}
        onClick={handleLike}
      >
        <Heart className="heart-icon" fill={isLiked ? '#007bff' : 'none'} />
      </button>

      <div className="creator-avatar">
        <img src={creator.avatar} alt={creator.name} />
      </div>

      <h3 className="creator-name">{creator.username}</h3>
      <p className="creator-id">@{creator.id}</p>

      <div className="creator-category">
        카테고리 : {creator.categories.join(' / ')}
      </div>

      <div className="creator-stats">
        <div className="stat-item">
          <span className="stat-label">구독자 :</span>
          <div className="stat-values">
            <span>YouTube {creator.stats.youtube}</span>
            <span>Instagram {creator.stats.instagram}</span>
          </div>
        </div>
        <div className="stat-item">
          <span className="stat-label">평균 조회수 :</span>
          <span>YouTube 평균 {creator.stats.avgViews}</span>
        </div>
      </div>

      <div className="creator-tags">
        {creator.tags.map((tag, index) => (
          <span key={index} className="tag">#{tag}</span>
        ))}
      </div>

      <div className="creator-actions">
        <button className="btn-view-more" onClick={handleViewMore}>
          View more
        </button>
        <button className="btn-collaboration" onClick={handleOpenModal}>
          협업 제안
        </button>
      </div>

      {/* 협업 제안 확인 모달 */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            className="collaboration-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
          >
            <motion.div 
              className="collaboration-modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="collaboration-modal-header">
                <h3>협업 제안</h3>
                <button className="collaboration-modal-close" onClick={handleCloseModal}>
                  <X className="close-icon" />
                </button>
              </div>
              
              <div className="collaboration-modal-body">
                <p><strong>{creator.username}</strong>님에게</p>
                <p>협업 제안을 보내시겠습니까?</p>
              </div>
              
              <div className="collaboration-modal-footer">
                <button className="collaboration-modal-btn cancel-btn" onClick={handleCloseModal}>
                  취소
                </button>
                <button className="collaboration-modal-btn confirm-btn" onClick={handleConfirm}>
                  확인
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 크리에이터 Resume 모달 - Portal로 body에 직접 렌더링 */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isDashboardModalOpen && (
            <motion.div 
              className="resume-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseDashboardModal}
            >
              <motion.div 
                className="resume-modal"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="resume-modal-header">
                  <h2>{creator.username} Portfolio</h2>
                  <div className="resume-modal-header-actions">
                    <button className="btn-collaboration-modal" onClick={handleOpenModal}>
                      협업 제안
                    </button>
                    <button className="resume-modal-close" onClick={handleCloseDashboardModal}>
                      <X className="close-icon" />
                    </button>
                  </div>
                </div>

                <div className="resume-modal-content">
                  {/* 상단: 크리에이터 기본 정보 */}
                  <div className="resume-profile-section">
                    <div className="resume-profile-header">
                      <div className="resume-avatar-large">
                        <img src={creator.avatar} alt={creator.name} />
                      </div>
                      <div className="resume-profile-info">
                        <h3 className="resume-name">{creator.username}</h3>
                        <p className="resume-id">@{creator.id}</p>
                        <div className="resume-categories">
                          {creator.categories.map((category, index) => (
                            <span key={index} className="resume-category-tag">{category}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="resume-stats-grid">
                      <div className="resume-stat-item">
                        <span className="resume-stat-label">YouTube 구독자</span>
                        <span className="resume-stat-value">{creator.stats.youtube}</span>
                      </div>
                      <div className="resume-stat-item">
                        <span className="resume-stat-label">Instagram 팔로워</span>
                        <span className="resume-stat-value">{creator.stats.instagram}</span>
                      </div>
                      <div className="resume-stat-item">
                        <span className="resume-stat-label">평균 조회수</span>
                        <span className="resume-stat-value">{creator.stats.avgViews}</span>
                      </div>
                    </div>

                    <div className="resume-tags-section">
                      {creator.tags.map((tag, index) => (
                        <span key={index} className="resume-tag">#{tag}</span>
                      ))}
                    </div>
                  </div>

                  {/* 하단: 영상 분석 통계 */}
                  <div className="resume-analysis-section">
                    <h3 className="resume-section-title">영상 분석 결과</h3>
                    
                    {isLoadingAnalysis ? (
                      <div className="resume-loading">
                        <div className="loading-spinner"></div>
                        <p>분석 데이터를 불러오는 중...</p>
                      </div>
                    ) : creatorAnalysisData && creatorAnalysisData.length > 0 ? (
                      <>
                        {(() => {
                          const metrics = calculateMetrics();
                          return (
                            <>
                              {/* 메트릭 카드 */}
                              <div className="resume-metrics-grid">
                                <MetricCard
                                  title="분석된 영상"
                                  value={metrics.totalVideos}
                                  unit="개"
                                  icon={Eye}
                                  trend={metrics.totalVideos > 0 ? `${metrics.totalVideos}개` : "0개"}
                                  color="blue"
                                />
                                <MetricCard
                                  title="탐지된 브랜드"
                                  value={metrics.totalBrands}
                                  unit="개"
                                  icon={Target}
                                  trend={metrics.totalBrands > 0 ? `${metrics.totalBrands}개` : "0개"}
                                  color="green"
                                />
                                <MetricCard
                                  title="총 분석 시간"
                                  value={metrics.totalAnalysisTime}
                                  unit="초"
                                  icon={Clock}
                                  trend={metrics.totalAnalysisTime > 0 ? "완료" : "대기"}
                                  color="purple"
                                />
                                <MetricCard
                                  title="평균 신뢰도"
                                  value={metrics.averageConfidence}
                                  unit="%"
                                  icon={TrendingUp}
                                  trend={metrics.averageConfidence > 80 ? "높음" : metrics.averageConfidence > 60 ? "보통" : "낮음"}
                                  color="orange"
                                />
                              </div>

                              {/* 차트 섹션 */}
                              {metrics.brandAnalysis && Object.keys(metrics.brandAnalysis).length > 0 && (
                                <div className="resume-charts-section">
                                  <div className="resume-chart-container">
                                    <div className="resume-chart-header">
                                      <BarChart3 className="chart-icon" />
                                      <h4>브랜드별 노출 분석</h4>
                                    </div>
                                    <div className="resume-chart-content">
                                      <BrandChart data={metrics.brandAnalysis} />
                                    </div>
                                  </div>

                                {/* 타임라인 차트는 원본 분석 결과가 필요하므로 가장 최근 분석 결과 사용 */}
                                {creatorAnalysisData && creatorAnalysisData.length > 0 && creatorAnalysisData[0].brand_analysis && (
                                  <div className="resume-chart-container">
                                    <div className="resume-chart-header">
                                      <Activity className="chart-icon" />
                                      <h4>브랜드 등장 타임라인</h4>
                                    </div>
                                    <div className="resume-chart-content">
                                      <TimelineChart data={creatorAnalysisData[0].brand_analysis} />
                                    </div>
                                  </div>
                                )}
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </>
                    ) : (
                      <div className="resume-empty-state">
                        <BarChart3 className="empty-icon" />
                        <p>분석 결과가 존재하지 않습니다</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default CreatorCard;

