import React, { useState } from 'react';
import { Heart, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './CreatorCard.css';

const CreatorCard = ({ creator }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleViewMore = () => {
    alert(`${creator.name}의 상세 정보 페이지로 이동합니다.`);
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
          to_user: creator.username,
          from_user: companyName,
          from_type: 'company',
          type: 'collaboration_request',
          message: '협업 제안이 도착했습니다.',
          data: {
            company_name: companyName,
            creator_name: creator.name
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

      <h3 className="creator-name">{creator.name}</h3>
      <p className="creator-username">@{creator.username}</p>

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
                <p><strong>{creator.name}</strong>님에게</p>
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
    </div>
  );
};

export default CreatorCard;

