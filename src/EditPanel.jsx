import React, { useEffect, useState } from 'react';
import { Icons } from './components/Icons';
import { DEFAULT_LIFECYCLE_STAGES, COLOR_PALETTE, FUND_TYPES, MOOD_TYPES } from './config';
import { calculateMarketDays } from './utils';
import './EditPanel.css';

export default function EditPanel({ node, onUpdate, onDelete, onClose }) {
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState(node?.data || {});

  useEffect(() => {
    if (node) {
      const baseData = node.data || {};

      // 板块节点初始化
      if (node.type === 'sectorNode') {
        let lifecycle = baseData.lifecycle;
        // 确保有 stages 数组，如果没有，初始化为空数组（不再预设模版）
        if (!lifecycle || !Array.isArray(lifecycle.stages)) {
          lifecycle = {
            current: '', // 初始无状态
            stages: [],  // 初始为空列表
            logs: {}
          };
          const fixedData = { ...baseData, lifecycle };
          onUpdate(node.id, fixedData);
        }

        const trades = Array.isArray(baseData.trades) ? baseData.trades : [];
        setFormData({
          ...baseData,
          targetsStr: baseData.targets ? baseData.targets.join(', ') : '',
          lifecycle,
          trades,
          startDate: baseData.startDate || new Date().toISOString().split('T')[0],
          volumeDataStr: baseData.volumeData ? baseData.volumeData.join(', ') : ''
        });
      }
      // 情绪/圆形节点初始化
      else if (node.type === 'circleNode') {
        setFormData({
          ...baseData,
          startDate: baseData.startDate || new Date().toISOString().split('T')[0],
          mood: baseData.mood || 'chaos'
        });
      }
      else {
        setFormData({ ...baseData });
      }
    }
  }, [node]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newData;
    if (name === 'targetsStr') {
      const targetsArray = value.split(/[,，]/).map(t => t.trim()).filter(t => t);
      newData = { ...formData, targetsStr: value, targets: targetsArray };
    } else if (name === 'volumeDataStr') {
      const volumeArray = value.split(/[,，]/).map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
      newData = { ...formData, volumeDataStr: value, volumeData: volumeArray };
    } else {
      newData = { ...formData, [name]: value };
    }
    setFormData(newData);
    onUpdate(node.id, newData);
  };

  // --- 核心升级：周期推演列表逻辑 ---

  // 1. 添加新推演记录 (智能默认值)
  const addCycleRecord = () => {
    const newId = `c_${Date.now()}`;
    const now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');

    const currentStages = formData.lifecycle?.stages || [];

    // 智能判断：如果是第一条，默认“启动”；否则默认“主升”
    const defaultType = currentStages.length === 0
      ? DEFAULT_LIFECYCLE_STAGES[0]  // Startup
      : DEFAULT_LIFECYCLE_STAGES[1]; // Rise

    const newRecord = {
      id: newId,
      typeId: defaultType.id,
      label: defaultType.label,
      color: defaultType.color,
      bg: defaultType.bg,
      time: now,
      remark: '',
      prediction: '' // 预判下一阶段
    };

    const newStages = [...currentStages, newRecord];

    // 自动设为当前状态
    const newLifecycle = { ...formData.lifecycle, stages: newStages, current: newId };
    const newData = { ...formData, lifecycle: newLifecycle };
    setFormData(newData);
    onUpdate(node.id, newData);
  };

  // 2. 更新记录 (类型、时间、备注)
  const updateCycleRecord = (recordId, field, value) => {
    const newStages = (formData.lifecycle?.stages || []).map(s => {
      if (s.id === recordId) {
        // 如果修改的是类型，联动更新颜色和文字
        if (field === 'typeId') {
          const typeConfig = DEFAULT_LIFECYCLE_STAGES.find(t => t.id === value);
          if (typeConfig) {
            return {
              ...s,
              typeId: value,
              label: typeConfig.label,
              color: typeConfig.color,
              bg: typeConfig.bg
            };
          }
        }
        return { ...s, [field]: value };
      }
      return s;
    });
    const newLifecycle = { ...formData.lifecycle, stages: newStages };

    const newData = { ...formData, lifecycle: newLifecycle };
    setFormData(newData);
    onUpdate(node.id, newData);
  };

  // 3. 删除记录
  const removeCycleRecord = (recordId) => {
    const newStages = (formData.lifecycle?.stages || []).filter(s => s.id !== recordId);
    let newCurrent = formData.lifecycle?.current;

    // 如果删除了当前状态，则回退到上一个状态（如果有）
    if (newCurrent === recordId) {
      newCurrent = newStages.length > 0 ? newStages[newStages.length - 1].id : '';
    }

    const newLifecycle = { ...formData.lifecycle, stages: newStages, current: newCurrent };
    const newData = { ...formData, lifecycle: newLifecycle };
    setFormData(newData);
    onUpdate(node.id, newData);
  };

  // 4. 设为当前 (手动指定哪个是当前状态)
  const setAsCurrent = (recordId) => {
    const newLifecycle = { ...formData.lifecycle, current: recordId };
    const newData = { ...formData, lifecycle: newLifecycle };
    setFormData(newData);
    onUpdate(node.id, newData);
  };

  // ... (其它通用逻辑)
  const toggleFundType = (type) => { let c = formData.fundType ? formData.fundType.split(' ') : []; if (c.includes(type)) c = c.filter(t => t !== type); else c.push(type); const n = { ...formData, fundType: c.join(' ') }; setFormData(n); onUpdate(node.id, n); };
  const handleColorChange = (color) => { const n = { ...formData, color }; setFormData(n); onUpdate(node.id, n); };
  const handleMoodChange = (moodId) => { const n = { ...formData, mood: moodId }; setFormData(n); onUpdate(node.id, n); };
  const clearEndDate = () => { const n = { ...formData, endDate: null }; setFormData(n); onUpdate(node.id, n); };
  const addTrade = () => { const t = [...(formData.trades || []), { id: `t_${Date.now()}`, name: '', result: 'wait', reflection: '' }]; const n = { ...formData, trades: t }; setFormData(n); onUpdate(node.id, n); };
  const updateTrade = (id, k, v) => { const t = (formData.trades || []).map(x => x.id === id ? { ...x, [k]: v } : x); const n = { ...formData, trades: t }; setFormData(n); onUpdate(node.id, n); };
  const removeTrade = (id) => { const t = (formData.trades || []).filter(x => x.id !== id); const n = { ...formData, trades: t }; setFormData(n); onUpdate(node.id, n); };

  if (!node) return null;

  const currentFunds = formData.fundType ? formData.fundType.split(' ') : [];
  const timeInfo = calculateMarketDays(formData.startDate, formData.endDate);

  // 1. 简单节点
  if (node.type === 'diamondNode' || node.type === 'circleNode') {
    const timeInfoCircle = node.type === 'circleNode' ? calculateMarketDays(formData.startDate, formData.endDate) : null;
    return (
      <div className={`strategy-panel ${node ? 'open' : ''}`}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, color: '#333' }}>{node.type === 'diamondNode' ? '判断节点' : '情绪节点'}</h3>
            <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><Icons.Close /></button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <div className="form-group"><label>名称</label><input type="text" name="label" value={formData.label || ''} onChange={handleChange} className="input-field" /></div>
            {node.type === 'circleNode' && (
              <>
                <div className="form-group"><label>情绪类型</label><div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>{MOOD_TYPES.map(m => (<button key={m.id} className={`btn-tag ${formData.mood === m.id ? 'active' : ''}`} onClick={() => handleMoodChange(m.id)} style={{ flex: 1, borderColor: formData.mood === m.id ? m.color : '#e2e8f0', color: formData.mood === m.id ? m.color : '#64748b' }}>{m.label}</button>))}</div></div>
                <div className="form-group"><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}><label style={{ marginBottom: 0 }}>开始时间</label><span style={{ fontSize: '11px', fontWeight: '600', color: timeInfoCircle.isFrozen ? '#94a3b8' : 'var(--primary)' }}>{timeInfoCircle.text} {timeInfoCircle.details}</span></div><div style={{ display: 'flex', gap: '4px' }}><input type="date" name="startDate" value={formData.startDate || ''} onChange={handleChange} className="input-field" style={{ flex: 1 }} />{timeInfoCircle.isFrozen && <button onClick={clearEndDate} title="恢复计时" style={{ border: '1px solid #e2e8f0', background: 'white', borderRadius: '6px', cursor: 'pointer' }}>🔄</button>}</div></div>
              </>
            )}
            <div className="form-group"><label>描述/备注</label><textarea name="desc" value={formData.desc || ''} onChange={handleChange} className="input-field" rows={4} /></div>
            {node.type === 'diamondNode' && (<div className="form-group"><label>主题色</label><div style={{ display: 'flex', gap: '8px' }}>{COLOR_PALETTE.map(c => (<div key={c.color} onClick={() => handleColorChange(c.color)} style={{ width: '20px', height: '20px', borderRadius: '50%', background: c.color, cursor: 'pointer', border: formData.color === c.color ? '2px solid #1e293b' : '1px solid #e2e8f0' }} />))}</div></div>)}
          </div>
          <button className="btn-delete" onClick={() => onDelete(node.id)}>🗑️ 删除</button>
        </div>
      </div>
    );
  }

  // 2. 板块节点
  const stages = Array.isArray(formData.lifecycle?.stages) ? formData.lifecycle.stages : [];
  const trades = Array.isArray(formData.trades) ? formData.trades : [];

  // 列表展示：按添加顺序（时间顺序）
  const sortedStages = [...stages];

  return (
    <div className={`strategy-panel ${node ? 'open' : ''}`}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0, color: '#333' }}>板块详情</h3>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><Icons.Close /></button>
        </div>
        <div className="panel-tabs">
          <div className={`panel-tab-item ${activeTab === 'basic' ? 'active' : ''}`} onClick={() => setActiveTab('basic')}><Icons.Basic /> 基础</div>
          <div className={`panel-tab-item ${activeTab === 'cycle' ? 'active' : ''}`} onClick={() => setActiveTab('cycle')}><Icons.Cycle /> 推演</div>
          <div className={`panel-tab-item ${activeTab === 'trade' ? 'active' : ''}`} onClick={() => setActiveTab('trade')}><Icons.Trade /> 实盘</div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
          {activeTab === 'basic' && (
            <>
              <div className="form-group"><label>名称</label><input type="text" name="label" value={formData.label || ''} onChange={handleChange} className="input-field" /></div>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ marginBottom: 0 }}>开始时间</label>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: timeInfo.isFrozen ? '#94a3b8' : 'var(--primary)' }}>
                    {timeInfo.text} {timeInfo.details}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <input type="date" name="startDate" value={formData.startDate || ''} onChange={handleChange} className="input-field" style={{ flex: 1 }} />
                  {timeInfo.isFrozen && <button onClick={clearEndDate} title="恢复计时" style={{ border: '1px solid #e2e8f0', background: 'white', borderRadius: '6px', cursor: 'pointer' }}>🔄</button>}
                </div>
              </div>

              <div className="form-group">
                <label>资金 (多选)</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {FUND_TYPES.map(type => (
                    <button
                      key={type}
                      className={`btn-tag ${currentFunds.includes(type) ? 'active' : ''}`}
                      onClick={() => toggleFundType(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group"><label>核心标的</label><input type="text" name="targetsStr" value={formData.targetsStr || ''} onChange={handleChange} className="input-field" /></div>
              <div className="form-group">
                <label>成交量趋势 (逗号分隔)</label>
                <input type="text" name="volumeDataStr" value={formData.volumeDataStr || ''} onChange={handleChange} className="input-field" placeholder="例如: 100, 120, 150, 140, 180" />
                <small style={{ fontSize: '10px', color: '#64748b', marginTop: '2px', display: 'block' }}>输入最近几天的相对成交量数值</small>
              </div>
              <div className="form-group"><label>主题色</label><div style={{ display: 'flex', gap: '8px' }}>{COLOR_PALETTE.map(c => (<div key={c.color} onClick={() => handleColorChange(c.color)} style={{ width: '20px', height: '20px', borderRadius: '50%', background: c.color, cursor: 'pointer', border: formData.color === c.color ? '2px solid #1e293b' : '1px solid #e2e8f0' }} />))}</div></div>
            </>
          )}

          {/* 🔥 周期推演列表 */}
          {activeTab === 'cycle' && (
            <div className="cycle-container">

              {/* 添加按钮在顶部 */}
              <button className="btn-add-step" onClick={addCycleRecord} style={{ marginBottom: '12px' }}>➕ 添加推演记录</button>

              {sortedStages.length === 0 && <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12px', padding: '20px' }}>暂无推演记录，请添加</div>}

              {sortedStages.map((stage) => {
                const isCurrent = formData.lifecycle?.current === stage.id;

                return (
                  <div key={stage.id} className={`cycle-item ${isCurrent ? 'active' : ''}`}>
                    <div className="cycle-item-header">
                      {/* 类型选择 */}
                      <select
                        className="cycle-type-select"
                        value={stage.typeId || 'startup'}
                        onChange={(e) => updateCycleRecord(stage.id, 'typeId', e.target.value)}
                        style={{ color: stage.color, border: 'none', background: 'transparent', fontWeight: 'bold', flex: 1 }}
                      >
                        {DEFAULT_LIFECYCLE_STAGES.map(t => (
                          <option key={t.id} value={t.id}>{t.label}</option>
                        ))}
                      </select>

                      {/* 时间输入 - 使用 datetime-local 类型 */}
                      <input
                        type="datetime-local"
                        className="cycle-time-input"
                        value={stage.time ? stage.time.replace(' ', 'T').substring(0, 16) : ''}
                        onChange={(e) => {
                          // 转换回 "YYYY-MM-DD HH:mm" 格式
                          const newTime = e.target.value.replace('T', ' ');
                          updateCycleRecord(stage.id, 'time', newTime);
                        }}
                        style={{ border: '1px solid #e2e8f0', textAlign: 'right', fontSize: '10px', color: '#64748b', padding: '2px 6px', borderRadius: '4px', background: 'white' }}
                      />

                      <div className="cycle-actions">
                        {/* 设为当前 */}
                        {isCurrent ? (
                          <span className="current-badge" style={{ fontSize: '9px', padding: '1px 4px', borderRadius: '4px', background: '#2563eb', color: 'white' }}>当前</span>
                        ) : (
                          <span className="cycle-set-current" onClick={() => setAsCurrent(stage.id)}>设为当前</span>
                        )}
                        <span className="cycle-del-btn" onClick={() => removeCycleRecord(stage.id)}>✕</span>
                      </div>
                    </div>

                    {/* 备注输入 */}
                    <textarea
                      className="cycle-remark-input"
                      placeholder="记录盘面逻辑..."
                      value={stage.remark || ''}
                      onChange={(e) => updateCycleRecord(stage.id, 'remark', e.target.value)}
                    />

                    {/* 预判下一阶段 */}
                    <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <label style={{ fontSize: '10px', color: '#64748b', minWidth: '60px' }}>预判走向:</label>
                      <select
                        value={stage.prediction || ''}
                        onChange={(e) => updateCycleRecord(stage.id, 'prediction', e.target.value)}
                        style={{ flex: 1, fontSize: '10px', padding: '3px 6px', borderRadius: '4px', border: '1px solid #e2e8f0', background: 'white', color: '#334155' }}
                      >
                        <option value="">-- 未预判 --</option>
                        {DEFAULT_LIFECYCLE_STAGES.map(t => (
                          <option key={t.id} value={t.id}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'trade' && (
            <div className="trade-list">{trades.map(trade => (<div key={trade.id} className="trade-row"><div className={`trade-status-line status-${trade.result}`} /><input className="input-stock" value={trade.name} onChange={(e) => updateTrade(trade.id, 'name', e.target.value)} placeholder="股票" /><select className={`select-result res-${trade.result}`} value={trade.result} onChange={(e) => updateTrade(trade.id, 'result', e.target.value)}><option value="wait">持仓</option><option value="win">盈利</option><option value="loss">亏损</option><option value="flat">平盘</option></select><input className="input-reflection" placeholder="反思..." value={trade.reflection || ''} onChange={(e) => updateTrade(trade.id, 'reflection', e.target.value)} /><div className="btn-del-row" onClick={() => removeTrade(trade.id)}>✕</div></div>))}<button className="btn-add-trade" onClick={addTrade}>➕ 新增记录</button></div>
          )}
        </div>

        <button className="btn-delete" onClick={() => onDelete(node.id)}>🗑️ 删除</button>
      </div>
    </div>
  );
}