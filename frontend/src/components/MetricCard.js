import React from 'react';
import { motion } from 'framer-motion';
import './MetricCard.css';

const MetricCard = ({ title, value, unit, icon: Icon, trend, color = 'blue', clickable = false, onClick }) => {
  const formatValue = (val) => {
    if (val >= 1000000) {
      return (val / 1000000).toFixed(1) + 'M';
    } else if (val >= 1000) {
      return (val / 1000).toFixed(1) + 'K';
    }
    return val.toString();
  };

  return (
    <motion.div 
      className={`metric-card ${color} ${clickable ? 'clickable' : ''}`}
      whileHover={{ 
        scale: clickable ? 1.05 : 1.02,
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)"
      }}
      whileTap={clickable ? { scale: 0.98 } : {}}
      transition={{ duration: 0.2 }}
      onClick={clickable ? onClick : undefined}
      style={{ cursor: clickable ? 'pointer' : 'default' }}
    >
      <div className="metric-header">
        <div className="metric-info">
          <h3 className="metric-title">{title}</h3>
          <div className="metric-value">
            <span className="value">{formatValue(value)}</span>
            <span className="unit">{unit}</span>
          </div>
        </div>
        <div className="metric-icon">
          <Icon />
        </div>
      </div>
      
      <div className="metric-footer">
        <span className={`trend ${getTrendClass(trend)}`}>
          {trend}
        </span>
        <span className="trend-label">이전 대비</span>
      </div>
      
      <div className="metric-background">
        <div className="metric-gradient"></div>
      </div>
    </motion.div>
  );
};

const getTrendClass = (trend) => {
  if (typeof trend === 'string') {
    if (trend.includes('+') || trend === '완료' || trend === '높음') {
      return 'positive';
    } else if (trend === '보통') {
      return 'neutral';
    } else if (trend === '낮음' || trend === '0' || trend === '0%') {
      return 'negative';
    }
  }
  return 'neutral';
};

export default MetricCard; 