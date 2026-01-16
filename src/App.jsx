import React, { useState } from 'react';
import 'reactflow/dist/style.css';
import CycleModule from './modules/CycleModule';
import MonitorModule from './modules/MonitorModule';
import LBModule from './modules/LBModule';
import { Icons, Logo } from './components/Icons';

export default function App() {
  const [activeModule, setActiveModule] = useState('cycle'); // cycle, monitor, news

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
          className={`nav-item ${activeModule === 'monitor' ? 'active' : ''}`}
          onClick={() => setActiveModule('monitor')}
          data-tooltip="全域雷达"
        >
          <Icons.Radar active={activeModule === 'monitor'} />
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
        {activeModule === 'cycle' && <CycleModule />}
        {activeModule === 'monitor' && <MonitorModule />}
        {activeModule === 'lb' && <LBModule />}
      </div>
    </div>
  );
}