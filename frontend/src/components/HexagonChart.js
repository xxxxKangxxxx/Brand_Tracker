import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';

// 커스텀 Tick 컴포넌트 - 특정 카테고리의 라벨 위치 조정
const CustomTick = ({ payload, x, y, textAnchor }) => {
  // 카테고리별 수직 오프셋 설정
  const getYOffset = (category) => {
    switch(category) {
      case '뷰티': return -12;  // 위로 이동
      case '여행': return 10;   // 아래로 이동
      default: return 0;       // 기본 위치
    }
  };

  const yOffset = getYOffset(payload.value);

  return (
    <text
      x={x}
      y={y + yOffset}
      textAnchor={textAnchor}
      fill="#4a5568"
      fontSize={14}
      fontWeight={600}
    >
      {payload.value}
    </text>
  );
};

const HexagonChart = ({ data }) => {
  // 기본 데이터 (데이터가 없을 경우)
  const defaultData = [
    { category: '뷰티', value: 85, average: 70 },
    { category: '게임', value: 70, average: 65 },
    { category: '음식', value: 90, average: 75 },
    { category: '여행', value: 65, average: 60 },
    { category: '교육', value: 80, average: 70 },
    { category: '라이프', value: 75, average: 68 },
  ];

  const chartData = data || defaultData;

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart data={chartData}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis 
          dataKey="category" 
          tick={<CustomTick />}
        />
        <PolarRadiusAxis 
          angle={90} 
          domain={[0, 100]} 
          tick={{ fill: '#718096', fontSize: 12 }}
        />
        <Radar
          name="나의 적합도"
          dataKey="value"
          stroke="#667eea"
          fill="#667eea"
          fillOpacity={0.5}
          strokeWidth={2}
        />
        <Radar
          name="전체 평균"
          dataKey="average"
          stroke="#48bb78"
          fill="#48bb78"
          fillOpacity={0.3}
          strokeWidth={2}
        />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
          iconType="circle"
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default HexagonChart;

