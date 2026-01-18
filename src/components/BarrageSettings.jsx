import React, { useState } from 'react';
import './BarrageSettings.css';
import { barrageStyleTemplates, barrageSizeOptions, barrageSpeedOptions, barrageAreaOptions, defaultBarrageSettings } from '../config/barrageStyles';

const BarrageSettings = ({ settings, onUpdate, onClose }) => {
    const [localSettings, setLocalSettings] = useState(settings);

    const handleTemplateChange = (template) => {
        setLocalSettings({ ...localSettings, template });
    };

    const handleSizeChange = (size) => {
        setLocalSettings({ ...localSettings, size });
    };

    const handleSpeedChange = (speed) => {
        setLocalSettings({ ...localSettings, speed });
    };

    const handleOpacityChange = (e) => {
        setLocalSettings({ ...localSettings, opacity: parseFloat(e.target.value) });
    };

    const handleAreaChange = (area) => {
        setLocalSettings({ ...localSettings, area });
    };

    const handleApply = () => {
        onUpdate(localSettings);
        onClose();
    };

    const handleReset = () => {
        setLocalSettings(defaultBarrageSettings);
    };

    return (
        <div className="barrage-settings-overlay" onClick={onClose}>
            <div className="barrage-settings-panel" onClick={(e) => e.stopPropagation()}>
                <div className="settings-header">
                    <h3>⚙️ 弹幕设置</h3>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="settings-content">
                    {/* 样式模板 */}
                    <div className="settings-section">
                        <h4>样式模板</h4>
                        <div className="template-grid">
                            {Object.entries(barrageStyleTemplates).map(([key, template]) => (
                                <button
                                    key={key}
                                    className={`template-card ${localSettings.template === key ? 'active' : ''}`}
                                    onClick={() => handleTemplateChange(key)}
                                >
                                    <span className="template-icon">{template.icon}</span>
                                    <span className="template-name">{template.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 尺寸 */}
                    <div className="settings-section">
                        <h4>尺寸</h4>
                        <div className="option-group">
                            {Object.entries(barrageSizeOptions).map(([key, option]) => (
                                <button
                                    key={key}
                                    className={`option-btn ${localSettings.size === key ? 'active' : ''}`}
                                    onClick={() => handleSizeChange(key)}
                                >
                                    {option.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 速度 */}
                    <div className="settings-section">
                        <h4>速度</h4>
                        <div className="option-group">
                            {Object.entries(barrageSpeedOptions).map(([key, option]) => (
                                <button
                                    key={key}
                                    className={`option-btn ${localSettings.speed === key ? 'active' : ''}`}
                                    onClick={() => handleSpeedChange(key)}
                                >
                                    {option.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 透明度 */}
                    <div className="settings-section">
                        <h4>透明度</h4>
                        <div className="slider-container">
                            <input
                                type="range"
                                min="0.25"
                                max="1"
                                step="0.05"
                                value={localSettings.opacity}
                                onChange={handleOpacityChange}
                                className="opacity-slider"
                            />
                            <span className="slider-value">{Math.round(localSettings.opacity * 100)}%</span>
                        </div>
                    </div>

                    {/* 显示区域 */}
                    <div className="settings-section">
                        <h4>显示区域</h4>
                        <div className="option-group">
                            {Object.entries(barrageAreaOptions).map(([key, option]) => (
                                <button
                                    key={key}
                                    className={`option-btn ${localSettings.area === key ? 'active' : ''}`}
                                    onClick={() => handleAreaChange(key)}
                                >
                                    {option.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="settings-footer">
                    <button className="reset-btn" onClick={handleReset}>
                        重置默认
                    </button>
                    <button className="apply-btn" onClick={handleApply}>
                        应用
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BarrageSettings;
