import React, { useState } from 'react';
import 'reactflow/dist/style.css';
import CycleModule from './modules/CycleModule';
import MindModule from './modules/MindModule';
import LBModule from './modules/LBModule';
import { Icons, Logo } from './components/Icons';

export default function App() {
  const [activeModule, setActiveModule] = useState('cycle'); // cycle, mind, news

  // 核心市场环境状态，由 CycleModule 设置，MindModule 共享
  const [marketEnv, setMarketEnv] = useState({
    mode: 'neutral',
    initialDays: 0,
    phase: 'normal',
    startTime: new Date().toISOString()
  });

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
        {activeModule === 'cycle' && (
          <CycleModule
            marketEnv={marketEnv}
            setMarketEnv={setMarketEnv}
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