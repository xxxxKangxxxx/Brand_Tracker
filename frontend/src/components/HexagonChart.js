import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';

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
          tick={{ fill: '#4a5568', fontSize: 14, fontWeight: 600 }}
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

