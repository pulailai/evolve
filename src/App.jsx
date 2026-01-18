import React, { useState } from 'react';
import 'reactflow/dist/style.css';
import CycleModule from './modules/CycleModule';
import MindModule from './modules/MindModule';
import LBModule from './modules/LBModule';
import { Icons, Logo } from './components/Icons';
import BarrageDisplay from './components/BarrageDisplay';
import { useEffect, useRef } from 'react';
import { defaultBarrageSettings } from './config/barrageStyles';

export default function App() {
  const [activeModule, setActiveModule] = useState('cycle'); // cycle, mind, news

  // 核心市场环境状态，由 CycleModule 设置，MindModule 共享
  const [marketEnv, setMarketEnv] = useState({
    mode: 'neutral',
    initialDays: 0,
    phase: 'normal',
    startTime: new Date().toISOString()
  });

  // 弹幕状态
  const [barrageEnabled, setBarrageEnabled] = useState(() => {
    return localStorage.getItem('barrageEnabled') !== 'false';
  });
  const [notes, setNotes] = useState([]);
  const notesLoadedRef = useRef(false);

  // 加载笔记（只加载一次）
  useEffect(() => {
    if (notesLoadedRef.current) return;
    notesLoadedRef.current = true;
    fetch('http://localhost:3001/api/mind/notes')
      .then(res => res.json())
      .then(data => setNotes(data))
      .catch(err => {
        console.error('Failed to load notes:', err);
        notesLoadedRef.current = false;
      });
  }, []);

  // 刷新笔记数据
  const refreshNotes = () => {
    fetch('http://localhost:3001/api/mind/notes')
      .then(res => res.json())
      .then(data => setNotes(data))
      .catch(err => console.error('Failed to refresh notes:', err));
  };

  // 当切换到周期环境模块时刷新笔记，确保弹幕显示最新内容
  useEffect(() => {
    if (activeModule === 'cycle' && notes.length > 0) {
      refreshNotes();
    }
  }, [activeModule]);

  // 切换弹幕
  const toggleBarrage = () => {
    const newState = !barrageEnabled;
    setBarrageEnabled(newState);
    localStorage.setItem('barrageEnabled', newState);
  };

  // 弹幕样式设置
  const [barrageSettings, setBarrageSettings] = useState(() => {
    const saved = localStorage.getItem('barrageSettings');
    return saved ? JSON.parse(saved) : defaultBarrageSettings;
  });

  const updateBarrageSettings = (newSettings) => {
    setBarrageSettings(newSettings);
    localStorage.setItem('barrageSettings', JSON.stringify(newSettings));
  };

  return (
    <div className="app-shell">
      {/* 侧边栏 */}
      <div className="app-sidebar">
        <Logo />
        <div
          className={`nav-item ${activeModule === 'cycle' ? 'active' : ''}`}
          onClick={() => setActiveModule('cycle')}
          data-tooltip="周期推演"
        >
          <Icons.Cycle active={activeModule === 'cycle'} />
        </div>
        <div
          className={`nav-item ${activeModule === 'mind' ? 'active' : ''}`}
          onClick={() => setActiveModule('mind')}
          data-tooltip="心法录"
        >
          <Icons.Mind active={activeModule === 'mind'} />
        </div>
        <div
          className={`nav-item ${activeModule === 'lb' ? 'active' : ''}`}
          onClick={() => setActiveModule('lb')}
          data-tooltip="龙虎榜资金透视"
        >
          <Icons.News active={activeModule === 'lb'} />
        </div>
      </div>

      {/* 主内容区 */}
      <div className="main-viewport">
        {/* 弹幕显示 - 始终渲染，不会被卸载 */}
        <BarrageDisplay
          notes={notes}
          currentEnvironment={marketEnv.mode}
          isEnabled={barrageEnabled && activeModule === 'cycle'}
          settings={barrageSettings}
        />

        {activeModule === 'cycle' && (
          <CycleModule
            marketEnv={marketEnv}
            setMarketEnv={setMarketEnv}
            barrageEnabled={barrageEnabled}
            toggleBarrage={toggleBarrage}
          />
        )}
        {activeModule === 'mind' && (
          <MindModule
            marketEnv={marketEnv}
          />
        )}
        {activeModule === 'lb' && (
          <LBModule
            marketEnv={marketEnv}
          />
        )}
      </div>
    </div>
  );
}