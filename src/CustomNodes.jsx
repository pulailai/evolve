import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { calculateMarketDays, calculateStageDays } from './utils';
import { DEFAULT_LIFECYCLE_STAGES } from './config';
import { VolumeSparkline } from './components/VolumeSparkline';
import './CustomNodes.css';

// --- 1. 板块节点 ---
export const SectorNode = memo(({ data, selected }) => {
  const themeColor = data.color || '#2563eb';
  const currentStageId = data.lifecycle?.current; // 可能为空
  const stages = data.lifecycle?.stages || [];

  // 获取当前阶段信息（用于背景色）
  // 如果有当前状态，则查找对应的 stage 对象，否则使用默认值
  const currentStage = stages.find(s => s.id === currentStageId) || stages[0] || { label: '初始', color: '#999', bg: '#fff' };
  const currentStageType = currentStage.typeId || 'startup';

  const trades = data.trades || [];
  const tradeCount = trades.length;

  // 计算节点总持续时间
  const { trading: totalTradingDays } = calculateMarketDays(data.startDate, data.endDate);

  // 使用新的阶段天数计算
  const { label: timeLabel, compactLabel, details: stageDaysDetails } = calculateStageDays(stages, currentStageId);
  const isFrozen = !!data.endDate;

  // 动态特效
  const getEffectClass = (stageId) => {
    if (isFrozen) return '';
    switch (stageId) {
      case 'startup': return 'effect-startup';
      case 'rise': return 'effect-rise';
      case 'acceleration': return 'effect-acceleration';
      case 'outbreak': return 'effect-outbreak';
      case 'accelerated_divergence': return 'effect-accelerated_divergence';
      case 'divergence': return 'effect-divergence';
      case 'contraction': return 'effect-contraction';
      case 'follow_up': return 'effect-follow_up';
      case 'second_wave': return 'effect-second_wave';
      case 'decline': return 'effect-decline';
      case 'switch': return 'effect-switch';
      default: return '';
    }
  };
  const effectClass = getEffectClass(currentStageType);

  // 📝 按时间倒序排列推演记录
  const sortedHistory = [...stages].sort((a, b) => {
    const dateA = a.time ? new Date(a.time.replace(/-/g, '/')) : new Date(0);
    const dateB = b.time ? new Date(b.time.replace(/-/g, '/')) : new Date(0);
    return dateB - dateA;
  });

  return (
    <div className={`node-wrapper ${selected ? 'selected' : ''}`}>

      {/* Tooltip - 悬浮展示时间线 */}
      <div className="node-tooltip">
        <div style={{ fontWeight: 'bold', color: '#93c5fd', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
          推演日志 ({stages.length})
        </div>

        <div className="tooltip-history-list">
          {sortedHistory.length > 0 ? sortedHistory.map((item) => (
            <div key={item.id} style={{ marginBottom: '8px', paddingLeft: '8px', borderLeft: `2px solid ${item.color || '#ccc'}`, position: 'relative' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace' }}>{item.time ? item.time.split(' ')[1] : '-'}</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 'bold', color: 'white', fontSize: '11px' }}>{item.label}</span>
                <span style={{ opacity: 0.8, fontSize: '10px' }}>{item.remark || '无备注'}</span>
                {item.prediction && (
                  <span style={{ color: '#fbbf24', fontSize: '9px', marginTop: '2px' }}>
                    → 预判: {DEFAULT_LIFECYCLE_STAGES.find(s => s.id === item.prediction)?.label || item.prediction}
                  </span>
                )}
              </div>
            </div>
          )) : <div style={{ opacity: 0.6, fontStyle: 'italic' }}>暂无记录</div>}
        </div>

        {tradeCount > 0 && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '8px', paddingTop: '6px' }}>
            <div style={{ fontWeight: 'bold', color: '#93c5fd', marginBottom: '4px' }}>实盘 ({tradeCount})</div>
            {trades.map((trade, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '2px' }}>
                <span>{trade.name}</span>
                <span style={{ color: trade.result === 'win' ? '#fca5a5' : '#86efac' }}>{trade.result === 'win' ? '盈利' : '亏损'}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Node Content */}
      <div
        className={`sector-node-content ${effectClass}`}
        style={{
          border: effectClass ? undefined : `2px solid ${selected ? '#000' : themeColor}`,
          background: effectClass ? undefined : (data.bgColor || '#ffffff'),
          opacity: isFrozen ? 0.8 : 1
        }}
      >
        <Handle type="target" position={Position.Top} id="top" />
        <Handle type="target" position={Position.Left} id="left" />
        <div className="node-header" style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
          {/* 第一行：时间 + 当前阶段 + 资金类型 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div style={{ background: isFrozen ? '#f1f5f9' : 'rgba(0,0,0,0.04)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>
              <span style={{ fontWeight: 'bold', color: isFrozen ? '#94a3b8' : '#334155' }}>T+{totalTradingDays}{isFrozen ? ' (完)' : ''}</span>
            </div>
            {/* 当前阶段标签 + 预判 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <div style={{ background: currentStage.bg || '#eee', color: currentStage.color || '#666', fontSize: '9px', padding: '2px 6px', borderRadius: '6px', fontWeight: '600', border: `1px solid ${currentStage.color || '#ccc'}30` }}>
                {currentStage.label || '初始'}
              </div>
              {/* 预判指示器 */}
              {(() => {
                const currentStageData = stages.find(s => s.id === currentStageId);
                if (currentStageData?.prediction) {
                  const predictionStage = DEFAULT_LIFECYCLE_STAGES.find(s => s.id === currentStageData.prediction);
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '8px', color: '#f59e0b' }}>
                      <span>→</span>
                      <span style={{ fontWeight: '600' }}>{predictionStage?.label || '?'}</span>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
            <div style={{ fontSize: '10px', fontWeight: 'bold', color: themeColor }}>
              {data.fundType || '资金'}
            </div>
          </div>
          {/* 第二行：阶段信息 */}
          {timeLabel !== 'T+0' && (
            <div style={{ fontSize: '8px', color: '#64748b', lineHeight: '1.4', wordBreak: 'break-word', width: '100%' }}>
              {timeLabel}
            </div>
          )}
        </div>
        <div className="node-label" style={{ margin: '4px 0' }}>{data.label || '新板块'}</div>

        {/* 成交量趋势图 */}
        {data.volumeData && data.volumeData.length > 0 && (
          <div style={{ margin: '4px auto', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '8px', color: '#94a3b8' }}>量</span>
            <VolumeSparkline data={data.volumeData} width={80} height={16} />
          </div>
        )}

        {data.targets && (<div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '3px', marginTop: '4px' }}>{data.targets.map((t, i) => (<span key={i} style={{ fontSize: '9px', background: '#f1f5f9', padding: '1px 4px', borderRadius: '3px', color: '#475569' }}>{t}</span>))}</div>)}
        {tradeCount > 0 && <div className="trade-count-badge">📝 {tradeCount}</div>}
        <Handle type="source" position={Position.Right} id="right" />
        <Handle type="source" position={Position.Bottom} id="bottom" />
      </div>
    </div>
  );
});

// ... (DiamondNode, CircleNode, InfoNode 保持不变) ...
export const DiamondNode = memo(({ data, selected }) => {
  const themeColor = data.color || '#f59e0b';
  const bg = data.bgColor || '#fffbeb';
  return (
    <div className={`node-wrapper diamond-node-wrapper ${selected ? 'selected' : ''}`} style={{ width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Handle type="target" position={Position.Top} />
      <Handle type="target" position={Position.Left} />
      <div className="diamond-shape" style={{ width: '70px', height: '70px', background: bg, border: `2px solid ${selected ? '#000' : themeColor}`, transform: 'rotate(45deg)', boxShadow: '0 2px 6px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="diamond-content" style={{ transform: 'rotate(-45deg)', textAlign: 'center', width: '90px' }}>
          <div style={{ fontWeight: '700', fontSize: '12px', color: '#1e293b', lineHeight: 1.2 }}>{data.label || '判断'}</div>
          {data.desc && <div style={{ fontSize: '9px', color: '#64748b', marginTop: '2px' }}>{data.desc}</div>}
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});

export const CircleNode = memo(({ data, selected }) => {
  let themeColor = '#64748b';
  let bg = '#f3f4f6';
  let statusText = '方向不明';
  let textColor = '#1e293b';

  const { trading, isFrozen } = calculateMarketDays(data.startDate, data.endDate);
  const timeLabel = isFrozen ? `T+${trading}(完)` : `T+${trading}`;

  if (data.mood === 'ice') {
    const intensity = Math.min(trading, 5);
    const opacity = 0.1 + (intensity * 0.15);
    bg = `rgba(59, 130, 246, ${opacity})`;
    themeColor = '#1d4ed8';
    statusText = `${trading}冰`;
  } else if (data.mood === 'fire') {
    const intensity = Math.min(trading, 5);
    const opacity = 0.1 + (intensity * 0.15);
    bg = `rgba(239, 68, 68, ${opacity})`;
    themeColor = '#b91c1c';
    statusText = `${trading}板潮`;
  } else if (data.mood === 'chaos') {
    bg = '#f1f5f9'; themeColor = '#475569'; statusText = '混沌期';
  }

  return (
    <div className={`node-wrapper ${selected ? 'selected' : ''}`}>
      <div className="circle-node-shape" style={{
        width: '80px', height: '80px', borderRadius: '50%',
        background: bg,
        border: `2px solid ${selected ? '#000' : themeColor}`,
        boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '4px', position: 'relative',
        opacity: isFrozen ? 0.8 : 1,
        transition: 'all 0.3s ease'
      }}>
        <Handle type="target" position={Position.Top} id="top" />
        <Handle type="target" position={Position.Left} id="left" />
        <div style={{ fontWeight: '700', fontSize: '14px', color: textColor, lineHeight: 1.1 }}>{data.label || '状态'}</div>
        {statusText && <div style={{ fontSize: '10px', fontWeight: '800', color: textColor === '#fff' ? '#fff' : themeColor, marginTop: '2px' }}>{statusText}</div>}
        <div style={{ fontSize: '9px', background: 'rgba(255,255,255,0.6)', padding: '1px 5px', borderRadius: '4px', marginTop: '4px', border: '1px solid rgba(0,0,0,0.05)', color: '#64748b' }}>{timeLabel}</div>
        {data.desc && <div style={{ fontSize: '9px', color: textColor === '#fff' ? '#eee' : '#64748b', marginTop: '2px', maxWidth: '90%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.desc}</div>}
        <Handle type="source" position={Position.Right} id="right" />
        <Handle type="source" position={Position.Bottom} id="bottom" />
      </div>
    </div>
  );
});

export const InfoNode = memo(({ data }) => {
  return (
    <div className="info-node-content" style={{ padding: '6px 10px', borderRadius: '6px', background: data.bgColor || '#f8fafc', border: '1px dashed #cbd5e1', fontSize: '11px', fontWeight: '500', color: '#64748b', textAlign: 'center', minWidth: '60px' }}>
      {data.label}
    </div>
  );
});