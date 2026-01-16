import React from 'react';

const StockChart = ({ data, volume, color }) => {
  if (!data || data.length < 2) {
    return (
      <div className="stock-chart-container empty">
        <span style={{color:'#cbd5e1'}}>暂无走势数据</span>
      </div>
    );
  }
  
  const width = 100;
  const height = 50;
  
  const maxPrice = Math.max(...data);
  const minPrice = Math.min(...data);
  const priceRange = maxPrice - minPrice || 1;
  const maxVol = volume ? Math.max(...volume) : 0;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = (height * 0.8) - ((val - minPrice) / priceRange) * (height * 0.6) - (height * 0.1); 
    return `${x},${y}`;
  }).join(' ');
  
  const fillPath = `${points} ${width},${height * 0.8} 0,${height * 0.8}`;
  const strokeColor = color === 'up' ? '#ef4444' : '#22c55e';
  const fillColor = color === 'up' ? 'url(#grad-up)' : 'url(#grad-down)';
  const volColor = color === 'up' ? '#fca5a5' : '#86efac'; 

  return (
    <div className="stock-chart-container">
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="chart-svg">
        <defs>
          <linearGradient id="grad-up" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2"/>
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="grad-down" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.2"/>
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0"/>
          </linearGradient>
        </defs>
        
        {volume && volume.map((vol, i) => {
          const barHeight = (vol / maxVol) * (height * 0.2);
          const barWidth = (width / volume.length) * 0.6;
          const x = (i / (volume.length - 1)) * width - (barWidth / 2);
          return (
            <rect 
              key={i} x={x} y={height - barHeight} width={barWidth} height={barHeight} 
              fill={volColor} opacity="0.8"
            />
          );
        })}

        <polyline points={points} fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <polygon points={fillPath} fill={fillColor} stroke="none" />
      </svg>
    </div>
  );
};

export default StockChart;