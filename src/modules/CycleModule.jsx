import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  applyEdgeChanges,
  applyNodeChanges,
  MiniMap,
  MarkerType,
  addEdge,
  useNodesState,
  useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';

// 引入所有 CSS
import './CycleModule.css';
import '../EditPanel.css';
import '../CustomNodes.css';

import { SectorNode, InfoNode, DiamondNode, CircleNode } from '../CustomNodes';
import CustomEdge from '../CustomEdge';
import EditPanel from '../EditPanel';
import { Icons } from '../components/Icons';
import { ParticleCanvas } from '../components/ParticleCanvas';
import { calculateTradingDaysWithHolidays } from '../utils/tradingDays';
import { API_BASE, LOCAL_STORAGE_PREFIX, LAST_OPEN_KEY, DEFAULT_LIFECYCLE_STAGES } from '../config';
import { CanvasEnhancementLayer } from '../components/CanvasEnhancementLayer';

const CycleModule = ({ marketEnv, setMarketEnv, barrageEnabled, toggleBarrage }) => {
  const nodeTypes = useMemo(() => ({
    sectorNode: SectorNode,
    infoNode: InfoNode,
    diamondNode: DiamondNode,
    circleNode: CircleNode
  }), []);

  const edgeTypes = useMemo(() => ({ custom: CustomEdge }), []);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);
  const reactFlowInstance = useRef(null);

  const [dbName, setDbName] = useState('');
  const [savedDocs, setSavedDocs] = useState([]);
  const [showDbMenu, setShowDbMenu] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // 市场环境状态 (由父组件 App.jsx 提供)

  const [marketHistory, setMarketHistory] = useState([]);
  const [currentDays, setCurrentDays] = useState(0);

  // 自动计算当前交易日天数
  useEffect(() => {
    const updateDays = () => {
      if (marketEnv.startTime) {
        const tradingDays = calculateTradingDaysWithHolidays(marketEnv.startTime);
        setCurrentDays(marketEnv.initialDays + tradingDays);
      }
    };

    updateDays();
    // 每小时更新一次
    const interval = setInterval(updateDays, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [marketEnv.startTime, marketEnv.initialDays]);


  // 初始化
  useEffect(() => { refreshDocsList(); }, []);

  // 自动居中画布
  useEffect(() => {
    if (nodes.length > 0 && reactFlowInstance.current) {
      setTimeout(() => {
        reactFlowInstance.current.fitView({ padding: 0.2, maxZoom: 1, duration: 200 });
      }, 100);
    }
  }, [nodes]);

  const refreshDocsList = async () => {
    try {
      const res = await fetch(API_BASE).catch(err => { throw new Error('Network Error'); });
      if (!res.ok) throw new Error('API Access Denied');
      const files = await res.json();
      // Sort files by date (newest first) - assumes filename format includes date
      // Put "默认复盘本" at the end
      const sortedFiles = files.sort((a, b) => {
        if (a === '默认复盘本') return 1;
        if (b === '默认复盘本') return -1;
        return b.localeCompare(a);
      });
      setIsOffline(false); setSavedDocs(sortedFiles);
      if (!dbName) {
        if (files.length > 0) await loadDoc(files[0], false);
        else initDefaultDoc(false);
      }
    } catch (err) {
      if (!isOffline) setIsOffline(true);
      const docs = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(LOCAL_STORAGE_PREFIX)) docs.push(key.replace(LOCAL_STORAGE_PREFIX, ''));
      }
      // Sort docs by date (newest first), put "默认复盘本" at the end
      const sortedDocs = docs.sort((a, b) => {
        if (a === '默认复盘本') return 1;
        if (b === '默认复盘本') return -1;
        return b.localeCompare(a);
      });
      setSavedDocs(sortedDocs);
      if (!dbName) {
        const lastOpen = localStorage.getItem(LAST_OPEN_KEY);
        if (lastOpen && localStorage.getItem(LOCAL_STORAGE_PREFIX + lastOpen)) loadDoc(lastOpen, true);
        else if (docs.length > 0) loadDoc(docs[0], true);
        else initDefaultDoc(true);
      }
    }
  };

  const initDefaultDoc = (forceOffline) => {
    const defaultName = '默认复盘本';
    setNodes([]); setEdges([]); setDbName(defaultName);
    addNode(true);
    setTimeout(() => saveDoc(defaultName, forceOffline, false), 100);
  };

  const loadDoc = async (name, forceOffline = isOffline) => {
    setLoading(true); setShowDbMenu(false);
    try {
      let data = null;
      if (forceOffline) {
        const json = localStorage.getItem(LOCAL_STORAGE_PREFIX + name);
        if (json) data = JSON.parse(json);
      } else {
        const res = await fetch(`${API_BASE}/${name}`);
        data = await res.json();
      }
      if (data) {
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
        setDbName(name);
        // 加载市场环境数据
        if (data.marketHistory) setMarketHistory(data.marketHistory);
        if (data.currentEnv) setMarketEnv(data.currentEnv);
        if (forceOffline) localStorage.setItem(LAST_OPEN_KEY, name);
      }
    } catch (err) { console.error('Load failed', err); }
    setLoading(false);
  };

  const createNewDoc = () => {
    const name = prompt('新建复盘本名称:', `复盘_${new Date().toISOString().split('T')[0]}`);
    if (name) {
      setNodes([]); setEdges([]); setDbName(name); addNode(true);
      setTimeout(() => saveDoc(name, isOffline, true), 100);
      setShowDbMenu(false);
    }
  };

  const saveDoc = async (targetName = dbName, forceOffline = isOffline, showFeedback = false, nodesSnapshot = null, edgesSnapshot = null, historySnapshot = null, envSnapshot = null) => {
    if (!targetName) return;
    if (showFeedback) setLoading(true);
    const dataToSave = {
      nodes: nodesSnapshot || nodes,
      edges: edgesSnapshot || edges,
      marketHistory: historySnapshot || marketHistory,
      currentEnv: envSnapshot || marketEnv,
      meta: { lastSaved: new Date().toISOString(), type: forceOffline ? 'local' : 'file' }
    };
    try {
      if (forceOffline) {
        localStorage.setItem(LOCAL_STORAGE_PREFIX + targetName, JSON.stringify(dataToSave));
        localStorage.setItem(LAST_OPEN_KEY, targetName);
        refreshDocsList();
        if (showFeedback) alert('✅ 保存成功 (浏览器缓存)');
      } else {
        const res = await fetch(API_BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: targetName, data: dataToSave }) });
        if (!res.ok) throw new Error('Server Write Failed');
        refreshDocsList();
        if (showFeedback) alert('✅ 保存成功 (硬盘文件)');
      }
    } catch (err) {
      console.error('Save failed:', err);
      if (showFeedback) alert('❌ 保存失败！请检查后台服务或磁盘权限');
    }
    setLoading(false);
  };

  const deleteDoc = async (name, e) => {
    e.stopPropagation();
    if (!confirm(`确定要删除 "${name}" 吗？`)) return;
    if (isOffline) {
      localStorage.removeItem(LOCAL_STORAGE_PREFIX + name);
      refreshDocsList();
      if (name === dbName) window.location.reload();
    } else {
      try {
        await fetch(`${API_BASE}/${name}`, { method: 'DELETE' });
        if (name === dbName) {
          const newList = savedDocs.filter(d => d !== name);
          if (newList.length > 0) loadDoc(newList[0]);
          else initDefaultDoc(false);
        } else { refreshDocsList(); }
      } catch (err) { alert('删除失败'); }
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify({ nodes, edges, meta: { name: dbName } }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${dbName}.json`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!parsed.nodes) throw new Error();
        let importName = file.name.replace('.json', '').replace(/_\d{4}-\d{2}-\d{2}.*/, '');
        if (savedDocs.includes(importName)) importName += `_导入_${Date.now().toString().slice(-4)}`;
        if (confirm(`导入 "${importName}"？`)) {
          setNodes(parsed.nodes); setEdges(parsed.edges || []); setDbName(importName);
          setTimeout(() => saveDoc(importName, isOffline, true, parsed.nodes, parsed.edges), 100);
        }
      } catch (err) { alert('文件格式错误'); }
    };
    reader.readAsText(file);
    event.target.value = null;
  };

  // 切换市场环境（手动）
  const switchMarketEnv = (newMode) => {
    const daysInput = prompt(`切换到 ${newMode === 'hot' ? '狂热期🔥' : newMode === 'cold' ? '冰冷期❄️' : '灰白期⚪'} - 请输入初始天数：`, '0');
    if (daysInput === null) return;

    const initialDays = parseInt(daysInput) || 0;
    let phase = 'normal';

    // 如果是狂热期，让用户选择阶段
    if (newMode === 'hot') {
      const phaseChoice = prompt(
        '请选择市场阶段：\n1 - 试探期（warming）🦆\n2 - 升温期（heating）🦆🦆🦆\n3 - 狂热期（boiling）🦆🦆🦆🦆🦆\n4 - 枯竭期（exhausted）🦆',
        '1'
      );
      if (phaseChoice === null) return;

      const phaseMap = {
        '1': 'warming',
        '2': 'heating',
        '3': 'boiling',
        '4': 'exhausted'
      };
      phase = phaseMap[phaseChoice] || 'warming';
    } else if (newMode === 'cold') {
      // 如果是冰冷期，让用户选择阶段
      const phaseChoice = prompt(
        '请选择市场阶段：\n1 - 微寒期（chilly）🐧\n2 - 冰冻期（freezing）🐧❄️\n3 - 冰封期（frozen）🐧🧊',
        '1'
      );
      if (phaseChoice === null) return;

      const phaseMap = {
        '1': 'chilly',
        '2': 'freezing',
        '3': 'frozen'
      };
      phase = phaseMap[phaseChoice] || 'chilly';
    }

    const now = new Date().toISOString();

    // 记录历史
    const actualDays = marketEnv.startTime
      ? marketEnv.initialDays + calculateTradingDaysWithHolidays(marketEnv.startTime, new Date())
      : marketEnv.initialDays;

    const newHistory = [
      ...marketHistory,
      {
        mode: marketEnv.mode,
        initialDays: marketEnv.initialDays,
        phase: marketEnv.phase,
        actualDays: actualDays,
        startTime: marketEnv.startTime,
        endTime: now
      }
    ];

    setMarketHistory(newHistory);
    setMarketEnv({
      mode: newMode,
      initialDays: initialDays,
      phase: phase,
      startTime: now
    });

    // 保存到文档
    setTimeout(() => {
      saveDoc(dbName, isOffline, false, nodes, edges, newHistory, { mode: newMode, initialDays, phase, startTime: now });
    }, 100);
  };

  // 切换市场阶段（狂热期和冰冷期）
  const switchPhase = (newPhase) => {
    if (marketEnv.mode !== 'hot' && marketEnv.mode !== 'cold') return;

    setMarketEnv(prev => ({
      ...prev,
      phase: newPhase
    }));

    // 保存到文档
    setTimeout(() => {
      const updatedEnv = { ...marketEnv, phase: newPhase };
      saveDoc(dbName, isOffline, false, nodes, edges, marketHistory, updatedEnv);
    }, 100);
  };

  // 连线逻辑
  const onConnect = useCallback((params) => {
    const newEdge = { ...params, id: `e-${Date.now()}`, type: 'custom', label: '资金流向', animated: true, style: { stroke: '#94a3b8', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' } };
    setEdges((eds) => {
      const nextEdges = addEdge(newEdge, eds);
      saveDoc(dbName, isOffline, false, nodes, nextEdges);
      return nextEdges;
    });
  }, [nodes, dbName, isOffline]);

  const onEdgeDoubleClick = useCallback((event, edge) => {
    const newLabel = prompt('修改连线文字:', edge.label || '');
    if (newLabel !== null) {
      setEdges((eds) => eds.map((e) => e.id === edge.id ? { ...e, label: newLabel } : e));
      saveDoc(dbName, isOffline, false);
    }
  }, [dbName, isOffline]);

  const onEdgeContextMenu = useCallback((event, edge) => {
    event.preventDefault();
    if (confirm(`删除连线 "${edge.label || ''}"？`)) {
      setEdges((eds) => {
        const nextEdges = eds.filter((e) => e.id !== edge.id);
        saveDoc(dbName, isOffline, false, nodes, nextEdges);
        return nextEdges;
      });
    }
  }, [nodes, dbName, isOffline]);

  // --- 节点创建逻辑 ---
  const getNewPosition = () => {
    if (selectedNode) return { x: selectedNode.position.x + 300, y: selectedNode.position.y };
    if (nodes.length > 0) return { x: nodes[nodes.length - 1].position.x + 100, y: nodes[nodes.length - 1].position.y + 100 };
    return { x: 100, y: 100 };
  };

  const addSectorNode = useCallback((isInit = false) => {
    const id = `${Date.now()}`;
    let position = { x: 100, y: 100 };
    let startDate = new Date().toISOString().split('T')[0];
    if (!isInit) position = getNewPosition();

    const newNode = {
      id, type: 'sectorNode', position,
      data: {
        label: isInit ? '初始板块' : '新板块 ' + id.slice(-4),
        startDate,
        fundType: '游资',
        color: '#f59e0b',
        bgColor: '#fef3c7',
        targets: [],
        strategy: '',
        trades: [],
        // 🔥 修改：初始时不预设 stages，为空数组
        lifecycle: { current: '', stages: [], logs: {} }
      },
    };

    const nextNodes = isInit ? [newNode] : nodes.concat(newNode);
    if (!isInit) setSelectedNode(newNode);
    setNodes(nextNodes);
    saveDoc(dbName, isOffline, false, nextNodes, edges);
  }, [nodes, edges, selectedNode, dbName, isOffline]);

  const addGenericNode = useCallback((type, label, defaultColor, defaultBg) => {
    const id = `${Date.now()}`;
    const position = getNewPosition();
    let startDate = new Date().toISOString().split('T')[0];
    const newNode = {
      id, type, position,
      data: {
        label, desc: '', color: defaultColor, bgColor: defaultBg, startDate
      }
    };
    const nextNodes = nodes.concat(newNode);
    setNodes(nextNodes);
    setSelectedNode(newNode);
    saveDoc(dbName, isOffline, false, nextNodes, edges);
  }, [nodes, edges, selectedNode, dbName, isOffline]);

  const updateNodeData = useCallback((id, newData) => {
    const nextNodes = nodes.map((n) => n.id === id ? { ...n, data: { ...n.data, ...newData } } : n);
    setNodes(nextNodes);
    saveDoc(dbName, isOffline, false, nextNodes, edges);
  }, [nodes, edges, dbName, isOffline]);

  const deleteNode = useCallback((id) => {
    if (!confirm('确定删除？')) return;
    const nextNodes = nodes.filter((n) => n.id !== id);
    const nextEdges = edges.filter((e) => e.source !== id && e.target !== id);
    setNodes(nextNodes); setEdges(nextEdges); setSelectedNode(null);
    saveDoc(dbName, isOffline, false, nextNodes, nextEdges);
  }, [nodes, edges, dbName, isOffline]);

  const onNodeClick = useCallback((event, node) => setSelectedNode(node), []);
  const onPaneClick = useCallback(() => setSelectedNode(null), []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', overflow: 'hidden' }}>
      <div className="toolbar-container">
        <button className="btn btn-primary" onClick={() => addSectorNode(false)} title="添加板块节点"><Icons.Plus /> 新增板块</button>
        <div className="toolbar-divider"></div>
        <div className="btn-group">
          <button className="btn btn-outline" onClick={() => setShowDbMenu(!showDbMenu)}>{isOffline ? <Icons.CloudOff /> : <Icons.Cloud />} <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dbName}</span> ▼</button>
          {showDbMenu && (<div className="file-menu-dropdown"><div className="menu-header">{isOffline ? '本地缓存' : '硬盘文件'}</div><div className="menu-list">{savedDocs.map(name => (<div key={name} className={`menu-item ${name === dbName ? 'active' : ''}`} onClick={() => loadDoc(name)}><span>{name}</span>{name !== dbName && <span className="menu-del" onClick={(e) => deleteDoc(name, e)}>✕</span>}</div>))}</div><div className="menu-item create-new" onClick={createNewDoc}>+ 新建复盘本...</div></div>)}
          <button className="btn btn-success" onClick={() => saveDoc(dbName, isOffline, true)} disabled={loading}><Icons.Save /> 保存</button>
        </div>
        <div className="toolbar-divider"></div>

        {/* 市场环境控制 */}
        <div className="btn-group">
          <button
            className={`toolbar-btn ${marketEnv.mode === 'hot' ? 'active' : ''}`}
            onClick={() => switchMarketEnv('hot')}
            title="狂热期"
            style={{ background: marketEnv.mode === 'hot' ? '#dc2626' : undefined }}
          >
            🔥
          </button>
          <button
            className={`toolbar-btn ${marketEnv.mode === 'neutral' ? 'active' : ''}`}
            onClick={() => switchMarketEnv('neutral')}
            title="灰白期"
            style={{ background: marketEnv.mode === 'neutral' ? '#64748b' : undefined }}
          >
            ⚪
          </button>
          <button
            className={`toolbar-btn ${marketEnv.mode === 'cold' ? 'active' : ''}`}
            onClick={() => switchMarketEnv('cold')}
            title="冰冷期"
            style={{ background: marketEnv.mode === 'cold' ? '#1e3a8a' : undefined }}
          >
            ❄️
          </button>

          {/* 显示当前天数 */}
          {currentDays > 0 && (
            <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '8px', fontWeight: '600', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px' }}>
              Day {currentDays}
            </span>
          )}

          {/* 狂热期阶段选择 */}
          {marketEnv.mode === 'hot' && (
            <select
              value={marketEnv.phase}
              onChange={(e) => switchPhase(e.target.value)}
              style={{
                marginLeft: '12px',
                padding: '6px 10px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#dc2626',
                background: '#fff',
                border: '1.5px solid #fca5a5',
                borderRadius: '6px',
                cursor: 'pointer',
                outline: 'none'
              }}
              title="切换市场阶段"
            >
              <option value="warming">🦆 试探期</option>
              <option value="heating">🦆🦆 升温期</option>
              <option value="boiling">🦆🦆🦆 狂热期</option>
              <option value="exhausted">🦆 枯竭期</option>
            </select>
          )}

          {/* 冰冷期阶段选择 */}
          {marketEnv.mode === 'cold' && (
            <select
              value={marketEnv.phase}
              onChange={(e) => switchPhase(e.target.value)}
              style={{
                marginLeft: '12px',
                padding: '6px 10px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#1e3a8a',
                background: '#fff',
                border: '1.5px solid #93c5fd',
                borderRadius: '6px',
                cursor: 'pointer',
                outline: 'none'
              }}
              title="切换市场阶段"
            >
              <option value="chilly">🐧 微寒期</option>
              <option value="freezing">🐧❄️ 冰冻期</option>
              <option value="frozen">🐧🧊 冰封期</option>
            </select>
          )}

          {/* 弹幕开关 */}
          <button
            className={`toolbar-btn ${barrageEnabled ? 'active' : ''}`}
            onClick={toggleBarrage}
            title={barrageEnabled ? '关闭弹幕' : '开启弹幕'}
            style={{
              marginLeft: '8px',
              background: barrageEnabled ? '#6366f1' : undefined
            }}
          >
            {barrageEnabled ? '🔔' : '🔕'}
          </button>
        </div>
        <div className="toolbar-divider"></div>
        <div className="btn-group">
          <button className="btn btn-gray" onClick={exportData} title="导出"><Icons.Share /> 导出</button>
          <button className="btn btn-gray" onClick={() => fileInputRef.current.click()} title="导入"><Icons.Upload /> 导入</button>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".json" onChange={handleFileChange} />
        </div>
        <div className="toolbar-divider"></div>
        <button className="btn btn-icon" onClick={() => selectedNode && deleteNode(selectedNode.id)} disabled={!selectedNode}><Icons.Trash /></button>
      </div>

      <div className="cycle-canvas">

        {/* 粒子动画层 */}
        <ParticleCanvas mode={marketEnv.mode} days={currentDays} phase={marketEnv.phase} />

        {/* 增强特效层 - 光影、特效、交互 */}
        <CanvasEnhancementLayer
          mode={marketEnv.mode}
          phase={marketEnv.phase}
          intensity={marketEnv.intensity || 0.5}
        />


        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onEdgeDoubleClick={onEdgeDoubleClick}
          onEdgeContextMenu={onEdgeContextMenu}
          onInit={(instance) => { reactFlowInstance.current = instance; }}
          connectionMode="loose"
          fitView
          fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
          className={`canvas-environment-${marketEnv.mode} canvas-phase-${marketEnv.phase}`}
        >
          <Background color="#e2e8f0" gap={20} size={1} />
          <Controls style={{ border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: '8px', overflow: 'hidden' }} />
          <MiniMap nodeColor={n => n.data.color || '#e2e8f0'} style={{ border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: '8px' }} />
        </ReactFlow>
      </div>

      <EditPanel node={selectedNode} onUpdate={updateNodeData} onDelete={deleteNode} onClose={() => setSelectedNode(null)} />
    </div>
  );
};

export default CycleModule;