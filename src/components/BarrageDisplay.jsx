import React, { useState, useEffect, useRef } from 'react';
import './BarrageDisplay.css';
import './BarrageStyleTemplates.css';
import { barrageStyleTemplates, barrageSizeOptions, barrageSpeedOptions, barrageAreaOptions } from '../config/barrageStyles';

const BarrageDisplay = ({ notes, currentEnvironment, isEnabled, settings = {} }) => {
    const [barrages, setBarrages] = useState([]);
    const animationFrameRef = useRef(null);
    const barragePositionsRef = useRef([]);

    useEffect(() => {
        if (!currentEnvironment) {
            setBarrages([]);
            return;
        }
        // 环境ID到标签的映射
        const environmentTagMap = {
            'hot': '#狂热期',
            'neutral': '#灰白期',
            'cold': '#冰冷期',
        };

        // 根据环境筛选笔记 - 支持综合标签、主环境标签和二级标签
        const matchedNotes = notes.filter(note => {
            if (!note.isBarrageEnabled || !note.barrageText || !note.tags) {
                return false;
            }

            // 综合标签在所有环境显示
            if (note.tags.includes('#综合')) {
                return true;
            }

            // 主环境标签匹配
            const envTag = environmentTagMap[currentEnvironment];
            if (envTag && note.tags.includes(envTag)) {
                return true;
            }

            // 二级标签匹配（狂热期和冰冷期的子阶段）
            const hotSubPhases = ['#试探期', '#升温期', '#狂热期-高潮', '#枯竭期'];
            const coldSubPhases = ['#微寒期', '#冰冻期', '#冰封期'];

            if (currentEnvironment === 'hot') {
                return note.tags.some(tag => hotSubPhases.includes(tag));
            }

            if (currentEnvironment === 'cold') {
                return note.tags.some(tag => coldSubPhases.includes(tag));
            }

            return false;
        });

        // 按优先级排序
        const sortedNotes = matchedNotes.sort((a, b) => {
            const aPriority = a.tags?.includes('#高优先级') ? 3 :
                a.tags?.includes('#中优先级') ? 2 : 1;
            const bPriority = b.tags?.includes('#高优先级') ? 3 :
                b.tags?.includes('#中优先级') ? 2 : 1;
            return bPriority - aPriority;
        });

        // 生成弹幕数据（最多显示5条）
        const size = settings.size || 'medium';
        const area = settings.area || 'top';

        const barrageData = sortedNotes.slice(0, 5).map((note, index) => ({
            id: note.id,
            text: note.barrageText.replace(/\n/g, ' ').trim(),
            color: getBarrageColor(note.tags),
            row: index % 2, // 只使用2行，保持在顶部区域
            templateClass: barrageStyleTemplates[note.barrageTemplate || 'modern']?.className || 'barrage-modern',
            sizeClass: `barrage-size-${size}`,
        }));

        setBarrages(barrageData);

        // 初始化位置 - 大幅增加水平间距避免同行弹幕重叠
        barragePositionsRef.current = barrageData.map((_, index) => ({
            x: window.innerWidth + index * 1000, // 1000px间距确保同行弹幕不会追上
        }));
    }, [notes, currentEnvironment]);

    const getBarrageColor = (tags) => {
        if (tags?.includes('#风险警示')) return '#ef4444';
        if (tags?.includes('#入场提醒')) return '#10b981';
        if (tags?.includes('#心态调整')) return '#0ea5e9';
        if (tags?.includes('#纪律执行')) return '#6366f1';
        return '#f97316';
    };

    // 使用requestAnimationFrame更新位置
    useEffect(() => {
        if (!isEnabled || barrages.length === 0) {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            return;
        }

        const speed = barrageSpeedOptions[settings.speed || 'medium']?.speed || 0.8;

        const animate = () => {
            barragePositionsRef.current = barragePositionsRef.current.map((pos, index) => {
                let newX = pos.x - speed; // 使用设置的速度

                // 如果完全移出屏幕左侧，重置到右侧，保持间距
                if (newX < -500) {
                    newX = window.innerWidth + 200 + index * 1000; // 保持1000px间距
                }

                return { x: newX };
            });

            // 强制重新渲染
            setBarrages(prev => [...prev]);

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isEnabled, barrages.length, settings.speed]);

    if (!isEnabled || barrages.length === 0) return null;

    const opacity = settings.opacity !== undefined ? settings.opacity : 0.95;
    const areaOption = barrageAreaOptions[settings.area || 'top'];

    return (
        <div className="barrage-container-js">
            {barrages.map((barrage, index) => (
                <div
                    key={barrage.id}
                    className={`barrage-item-styled ${barrage.templateClass} ${barrage.sizeClass}`}
                    style={{
                        color: barrage.color,
                        top: `${areaOption?.getPosition(index) || (70 + barrage.row * 50)}px`,
                        left: `${barragePositionsRef.current[index]?.x || 0}px`,
                        opacity: opacity,
                    }}
                >
                    {barrage.text}
                </div>
            ))}
        </div>
    );
};

export default BarrageDisplay;
