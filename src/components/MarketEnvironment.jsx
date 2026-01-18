import React, { useState, useEffect } from 'react';
import './MarketEnvironment.css';
import BarrageDisplay from './BarrageDisplay';

/**
 * MarketEnvironment - 市场环境控制器
 * 根据成交额和指数趋势计算并显示市场环境状态
 */
export const MarketEnvironment = ({ mode = 'neutral', volumeTrend = [], intensity = 0.5 }) => {
    const [barrageEnabled, setBarrageEnabled] = useState(() => {
        return localStorage.getItem('barrageEnabled') !== 'false';
    });
    const [notes, setNotes] = useState([]);

    // 加载笔记
    useEffect(() => {
        fetch('http://localhost:3001/api/mind/notes/all')
            .then(res => res.json())
            .then(data => setNotes(data))
            .catch(err => console.error('Failed to load notes:', err));
    }, []);

    // 保存弹幕开关状态
    const toggleBarrage = () => {
        const newState = !barrageEnabled;
        setBarrageEnabled(newState);
        localStorage.setItem('barrageEnabled', newState);
    };

    const getEnvironmentInfo = () => {
        switch (mode) {
            case 'hot':
                return {
                    icon: '🔥',
                    label: '狂热期',
                    color: '#dc2626',
                    description: '成交额放大，市场活跃'
                };
            case 'cold':
                return {
                    icon: '❄️',
                    label: '冰冷期',
                    color: '#1e3a8a',
                    description: '成交额萎缩，市场低迷'
                };
            default:
                return {
                    icon: '⚪',
                    label: '灰白期',
                    color: '#64748b',
                    description: '横盘震荡，观望为主'
                };
        }
    };

    const env = getEnvironmentInfo();
    const latestVolume = volumeTrend[volumeTrend.length - 1] || 0;
    const prevVolume = volumeTrend[volumeTrend.length - 2] || latestVolume;
    const volumeChange = prevVolume > 0 ? ((latestVolume - prevVolume) / prevVolume * 100).toFixed(1) : 0;

    return (
        <div className="market-environment-indicator">
            {/* 弹幕开关 */}
            <button
                className="barrage-toggle"
                onClick={toggleBarrage}
                title={barrageEnabled ? '关闭弹幕' : '开启弹幕'}
            >
                {barrageEnabled ? '🔔' : '🔕'}
            </button>

            {/* 弹幕显示 */}
            <BarrageDisplay
                notes={notes}
                currentEnvironment={mode}
                isEnabled={barrageEnabled}
            />

            <div className="env-icon" style={{ color: env.color }}>
                {env.icon}
            </div>
            <div className="env-info">
                <div className="env-label" style={{ color: env.color }}>
                    {env.label}
                </div>
                <div className="env-description">
                    {env.description}
                </div>
            </div>
            {volumeTrend.length > 0 && (
                <div className="env-stats">
                    <div className="stat-item">
                        <span className="stat-label">成交额:</span>
                        <span className="stat-value">{latestVolume}亿</span>
                        <span className={`stat-change ${volumeChange >= 0 ? 'positive' : 'negative'}`}>
                            {volumeChange >= 0 ? '▲' : '▼'} {Math.abs(volumeChange)}%
                        </span>
                    </div>
                </div>
            )}
            <div className="env-intensity">
                <div className="intensity-bar">
                    <div
                        className="intensity-fill"
                        style={{
                            width: `${intensity * 100}%`,
                            background: env.color
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

/**
 * 计算市场环境模式
 * @param {Array} volumeTrend - 成交额趋势数组
 * @param {Array} indexTrend - 涨跌幅趋势数组（百分比）
 * @param {Number} avgVolume - 历史平均成交额
 * @returns {Object} { mode, intensity }
 */
export const calculateMarketEnvironment = (volumeTrend, indexTrend, avgVolume) => {
    if (!volumeTrend || volumeTrend.length < 3) {
        return { mode: 'neutral', intensity: 0.5 };
    }

    const latestVolume = volumeTrend[volumeTrend.length - 1];
    const recentVolumes = volumeTrend.slice(-3);

    // 计算成交额趋势
    const volumeIncreasing = recentVolumes.every((v, i) => i === 0 || v >= recentVolumes[i - 1]);
    const volumeDecreasing = recentVolumes.every((v, i) => i === 0 || v <= recentVolumes[i - 1]);

    // 计算涨跌幅趋势（使用百分比）
    let indexRising = false;
    let indexFalling = false;
    if (indexTrend && indexTrend.length >= 3) {
        const recentChanges = indexTrend.slice(-3);
        // 连续上涨：最近3天都是正数
        indexRising = recentChanges.every(change => change > 0);
        // 连续下跌：最近3天都是负数
        indexFalling = recentChanges.every(change => change < 0);
    }

    // 计算相对强度
    const volumeRatio = avgVolume > 0 ? latestVolume / avgVolume : 1;

    // 判断环境模式
    if (volumeIncreasing && volumeRatio > 1.2 && indexRising) {
        // 狂热期：成交额放大 + 连续上涨
        const intensity = Math.min(1, (volumeRatio - 1) / 0.5);
        return { mode: 'hot', intensity };
    } else if (volumeDecreasing && volumeRatio < 0.8 && (indexFalling || !indexRising)) {
        // 冰冷期：成交额萎缩 + 连续下跌
        const intensity = Math.min(1, (1 - volumeRatio) / 0.3);
        return { mode: 'cold', intensity };
    } else {
        // 灰白期：横盘震荡
        const intensity = 0.5;
        return { mode: 'neutral', intensity };
    }
};
