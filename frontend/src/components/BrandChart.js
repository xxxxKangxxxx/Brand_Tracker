import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const BrandChart = ({ data }) => {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="chart-empty">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>📈</div>
          <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>분석 결과가 없습니다</p>
          <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>영상을 분석하면 브랜드별 노출 데이터가 표시됩니다</p>
        </div>
      </div>
    );
  }

  // 데이터 변환
  const chartData = Object.entries(data).map(([brand, info]) => ({
    brand: brand.charAt(0).toUpperCase() + brand.slice(1),
    appearances: info.appearances,
    totalSeconds: info.total_seconds,
    confidence: Math.round((info.average_confidence || 0) * 100)
  }));

  // 색상 팔레트
  const colors = [
    '#667eea', '#764ba2', '#f093fb', '#f5576c',
    '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
    '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3'
  ];

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          <p className="tooltip-value">
            등장 횟수: <span>{payload[0].value}회</span>
          </p>
          <p className="tooltip-value">
            노출 시간: <span>{payload[1]?.value || 0}초</span>
          </p>
          <p className="tooltip-value">
            평균 신뢰도: <span>{payload[2]?.value || 0}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="brand-chart">
      {/* 바 차트 */}
      <div className="chart-section" style={{ overflowX: 'auto' }}>
        <ResponsiveContainer width={480} height={200}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="brand" 
              stroke="rgba(255,255,255,0.7)"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis stroke="rgba(255,255,255,0.7)" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="appearances" fill="#667eea" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 파이 차트 */}
      <div className="chart-section">
        <ResponsiveContainer width="100%" height={150}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={40}
              dataKey="totalSeconds"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value, name) => [`${value}초`, '노출 시간']}
              labelFormatter={(label) => `브랜드: ${label}`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 범례 */}
      <div className="chart-legend">
        {chartData.map((item, index) => (
          <div key={item.brand} className="legend-item">
            <div 
              className="legend-color" 
              style={{ backgroundColor: colors[index % colors.length] }}
            ></div>
            <span className="legend-text">{item.brand}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrandChart; 