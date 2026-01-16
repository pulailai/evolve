import React, { useState } from 'react';
import './MarketDataPanel.css';

/**
 * MarketDataPanel - 市场数据输入面板
 * 用于输入成交额和指数数据，自动计算市场环境
 */
export const MarketDataPanel = ({ onDataChange, onClose }) => {
    const [volumeInput, setVolumeInput] = useState('');
    const [indexInput, setIndexInput] = useState('');
    const [avgVolume, setAvgVolume] = useState('10000');

    const handleSubmit = () => {
        // 解析输入的数据
        const volumeData = volumeInput.split(/[,，]/).map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
        const indexData = indexInput.split(/[,，]/).map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
        const avg = parseFloat(avgVolume) || 10000;

        if (volumeData.length > 0) {
            onDataChange({
                volumeTrend: volumeData,
                indexTrend: indexData,
                avgVolume: avg
            });
        }
    };

    return (
        <div className="market-data-panel">
            <div className="panel-header">
                <h3>市场数据输入</h3>
                <button className="close-btn" onClick={onClose}>✕</button>
            </div>

            <div className="panel-content">
                <div className="form-group">
                    <label>成交额趋势（亿元，逗号分隔）</label>
                    <input
                        type="text"
                        value={volumeInput}
                        onChange={(e) => setVolumeInput(e.target.value)}
                        placeholder="例如: 12000, 13500, 15000, 16200, 17800"
                        className="data-input"
                    />
                    <small>输入最近5-7天的三市成交额</small>
                </div>

                <div className="form-group">
                    <label>每天涨跌幅（%，逗号分隔）</label>
                    <input
                        type="text"
                        value={indexInput}
                        onChange={(e) => setIndexInput(e.target.value)}
                        placeholder="例如: 1.2, 0.8, -0.5, 1.5, 2.1"
                        className="data-input"
                    />
                    <small>输入对应日期的市场涨跌幅百分比（可选）</small>
                </div>

                <div className="form-group">
                    <label>历史平均成交额（亿元）</label>
                    <input
                        type="number"
                        value={avgVolume}
                        onChange={(e) => setAvgVolume(e.target.value)}
                        placeholder="10000"
                        className="data-input"
                    />
                    <small>用于判断市场热度的基准值</small>
                </div>

                <div className="panel-actions">
                    <button className="btn-submit" onClick={handleSubmit}>
                        应用数据
                    </button>
                    <button className="btn-cancel" onClick={onClose}>
                        取消
                    </button>
                </div>

                <div className="panel-hint">
                    <strong>提示：</strong>
                    <ul>
                        <li>成交额连续放大 + 连续上涨 = 🔥 狂热期</li>
                        <li>成交额连续萎缩 + 连续下跌 = ❄️ 冰冷期</li>
                        <li>横盘震荡 = ⚪ 灰白期</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
