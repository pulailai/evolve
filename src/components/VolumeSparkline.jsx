import React from 'react';

/**
 * VolumeSparkline - Mini sparkline chart for volume trend visualization
 * @param {Array} data - Array of volume values (e.g., [100, 120, 150, 140, 180])
 * @param {Number} width - Chart width in pixels (default: 100)
 * @param {Number} height - Chart height in pixels (default: 20)
 */
export const VolumeSparkline = ({ data = [], width = 100, height = 20 }) => {
    if (!data || data.length === 0) return null;

    // Calculate min and max for scaling
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1; // Avoid division by zero

    // Determine trend (compare first and last values)
    const isUptrend = data[data.length - 1] >= data[0];
    const trendColor = isUptrend ? '#10b981' : '#ef4444'; // green or red

    // Generate SVG path points
    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    // Create path for line
    const linePath = `M ${points.split(' ').join(' L ')}`;

    // Create path for area fill
    const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

    return (
        <svg width={width} height={height} style={{ display: 'block' }}>
            {/* Gradient fill */}
            <defs>
                <linearGradient id={`gradient-${isUptrend ? 'up' : 'down'}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={trendColor} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={trendColor} stopOpacity="0.05" />
                </linearGradient>
            </defs>

            {/* Area fill */}
            <path
                d={areaPath}
                fill={`url(#gradient-${isUptrend ? 'up' : 'down'})`}
            />

            {/* Line */}
            <polyline
                points={points}
                fill="none"
                stroke={trendColor}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};
