import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import './CreatorCard.css';

const CreatorCard = ({ creator }) => {
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleViewMore = () => {
    alert(`${creator.name}의 상세 정보 페이지로 이동합니다.`);
  };

  const handleMessage = () => {
    alert(`${creator.name}에게 메시지를 보냅니다.`);
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
        <button className="btn-message" onClick={handleMessage}>
          Message
        </button>
      </div>
    </div>
  );
};

export default CreatorCard;

