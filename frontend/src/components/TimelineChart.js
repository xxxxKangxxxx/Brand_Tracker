import React from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const TimelineChart = ({ data }) => {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="chart-empty">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>📊</div>
          <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>타임라인 데이터가 없습니다</p>
          <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>영상을 분석하면 시간별 브랜드 등장 패턴이 표시됩니다</p>
        </div>
      </div>
    );
  }

  // 개선된 타임라인 데이터 생성
  const createTimelineData = () => {
    const brands = Object.keys(data);
    const allTimestamps = [];
    
    // 모든 타임스탬프와 신뢰도 수집
    Object.entries(data).forEach(([brand, brandData]) => {
      brandData.timestamps.forEach((timestamp, index) => {
        allTimestamps.push({
          time: timestamp,
          brand: brand,
          confidence: brandData.confidence_scores?.[index] || brandData.average_confidence || 0.8
        });
      });
    });
    
    // 시간순 정렬
    allTimestamps.sort((a, b) => a.time - b.time);
    
    // 시간 구간별로 데이터 생성 (5초 간격)
    const maxTime = Math.max(...allTimestamps.map(item => item.time));
    const timeInterval = 5; // 5초 간격
    const timelineData = [];
    
    for (let time = 0; time <= maxTime; time += timeInterval) {
      const dataPoint = { time: Math.round(time) };
      
      brands.forEach(brand => {
        // 해당 시간 구간(±2.5초)에 브랜드가 등장했는지 확인
        const appearances = allTimestamps.filter(item => 
          item.brand === brand && 
          Math.abs(item.time - time) <= timeInterval / 2
        );
        
        if (appearances.length > 0) {
          // 신뢰도 평균으로 노출 강도 계산
          const avgConfidence = appearances.reduce((sum, app) => sum + app.confidence, 0) / appearances.length;
          dataPoint[brand] = Math.round(avgConfidence * 100); // 0-100 스케일
        } else {
          dataPoint[brand] = 0;
        }
      });
      
      timelineData.push(dataPoint);
    }
    
    return timelineData;
  };

  const timelineData = createTimelineData();
  const brands = Object.keys(data);
  
  // 브랜드별 색상 (더 다양하고 구분하기 쉬운 색상)
  const brandColors = {
    'apple': '#007AFF',
    'samsung': '#1428A0', 
    'nike': '#FF6900',
    'cocacola': '#F40009',
    'starbucks': '#00704A',
    'mcdonalds': '#FFC72C',
    'google': '#4285F4',
    'amazon': '#FF9900',
    'facebook': '#1877F2',
    'microsoft': '#00BCF2'
  };
  
  const getColor = (brand, index) => {
    return brandColors[brand.toLowerCase()] || 
           ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#43e97b', '#38f9d7'][index % 7];
  };

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const activeBrands = payload.filter(p => p.value > 0);
      
      if (activeBrands.length === 0) return null;
      
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{`시간: ${label}초`}</p>
          {activeBrands.map((entry, index) => (
            <p key={index} className="tooltip-value" style={{ color: entry.color }}>
              <span>{entry.dataKey}</span>: {entry.value}% 신뢰도
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="timeline-chart" style={{ overflowX: 'auto' }}>
      <ResponsiveContainer width={480} height={350}>
        <AreaChart data={timelineData} margin={{ top: 20, right: 5, left: 5, bottom: 5 }}>
          <defs>
            {brands.map((brand, index) => (
              <linearGradient key={brand} id={`gradient-${brand}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={getColor(brand, index)} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={getColor(brand, index)} stopOpacity={0.1}/>
              </linearGradient>
            ))}
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          
          <XAxis 
            dataKey="time" 
            stroke="rgba(255,255,255,0.7)"
            fontSize={12}
            tickFormatter={(value) => `${value}s`}
            domain={['dataMin', 'dataMax']}
          />
          
          <YAxis 
            stroke="rgba(255,255,255,0.7)" 
            fontSize={12}
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
            label={{ 
              value: '신뢰도 (%)', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: 'rgba(255,255,255,0.7)' }
            }}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          {brands.map((brand, index) => (
            <Area
              key={brand}
              type="monotone"
              dataKey={brand}
              stroke={getColor(brand, index)}
              fill={`url(#gradient-${brand})`}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, stroke: getColor(brand, index), strokeWidth: 2 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
      
      {/* 범례 */}
      <div className="chart-legend">
        {brands.map((brand, index) => (
          <div key={brand} className="legend-item">
            <div 
              className="legend-color" 
              style={{ backgroundColor: getColor(brand, index) }}
            ></div>
            <span>{brand}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineChart; 