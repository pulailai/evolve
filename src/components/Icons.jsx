import React from 'react';

export const Logo = () => (
  <div className="logo-container" title="道生一 · 一生二 · 二生三 · 三生万物">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none" className="app-logo-svg">
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" /> {/* Indigo 500 */}
          <stop offset="50%" stopColor="#8b5cf6" /> {/* Violet 500 */}
          <stop offset="100%" stopColor="#ec4899" /> {/* Pink 500 */}
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* --- 道生一 (The One) --- */}
      {/* 核心太极点：静中有动 */}
      <circle cx="12" cy="12" r="2.5" fill="url(#logo-gradient)" filter="url(#glow)">
        <animate attributeName="r" values="2.5;3;2.5" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0.8;1" dur="3s" repeatCount="indefinite" />
      </circle>

      {/* --- 一生二 (The Two) --- */}
      {/* 阴阳双轨：对立统一，交错旋转 */}
      <g opacity="0.8">
        <path d="M12 5 C 8 5, 5 8, 5 12 C 5 16, 8 19, 12 19" stroke="url(#logo-gradient)" strokeWidth="0.8" fill="none" strokeLinecap="round">
          <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="8s" repeatCount="indefinite" />
        </path>
        <path d="M12 5 C 16 5, 19 8, 19 12 C 19 16, 16 19, 12 19" stroke="url(#logo-gradient)" strokeWidth="0.8" fill="none" strokeLinecap="round">
          <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="8s" repeatCount="indefinite" />
        </path>
      </g>

      {/* --- 二生三 (The Three) --- */}
      {/* 三才定位：天地人，稳态旋转 */}
      <g>
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="-360 12 12" dur="12s" repeatCount="indefinite" />
        <circle cx="12" cy="4" r="1.5" fill="#6366f1" opacity="0.9" />
        <circle cx="5.07" cy="16" r="1.5" fill="#8b5cf6" opacity="0.9" />
        <circle cx="18.93" cy="16" r="1.5" fill="#ec4899" opacity="0.9" />

        {/* 连线（可选，增强整体感） */}
        <path d="M12 4 L18.93 16 L5.07 16 Z" stroke="url(#logo-gradient)" strokeWidth="0.3" opacity="0.2" fill="none" />
      </g>

      {/* --- 三生万物 (The Myriad Things) --- */}
      {/* 外围发散：数据流粒子，无限衍生 */}
      <g opacity="0.6">
        <circle cx="12" cy="12" r="10" stroke="url(#logo-gradient)" strokeWidth="0.5" strokeDasharray="1 3" strokeLinecap="round">
          <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="24s" repeatCount="indefinite" />
        </circle>
        <circle cx="12" cy="12" r="11.5" stroke="url(#logo-gradient)" strokeWidth="0.3" strokeDasharray="4 6" strokeLinecap="round" opacity="0.4">
          <animateTransform attributeName="transform" type="rotate" from="360 12 12" to="0 12 12" dur="36s" repeatCount="indefinite" />
        </circle>
      </g>
    </svg>
  </div>
);

export const Icons = {
  // 周期推演 - 太极阴阳图
  Cycle: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <defs>
        <linearGradient id="icon-gradient-cycle" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" stroke={active ? "currentColor" : "url(#icon-gradient-cycle)"} opacity={active ? 1 : 0.8} />
      <path d="M12 2 A 10 10 0 0 1 12 22 A 5 5 0 0 0 12 12 A 5 5 0 0 1 12 2" fill={active ? "currentColor" : "url(#icon-gradient-cycle)"} opacity="0.15" stroke="none" />
      <circle cx="12" cy="7" r="2" fill={active ? "currentColor" : "url(#icon-gradient-cycle)"} />
      <circle cx="12" cy="17" r="2" stroke="none" fill={active ? "currentColor" : "url(#icon-gradient-cycle)"} opacity="0.4" />
      <path d="M12 2v20" stroke={active ? "currentColor" : "url(#icon-gradient-cycle)"} strokeDasharray="2 3" opacity="0.4" />
    </svg>
  ),

  // 全域雷达 - 雷达扫描
  Radar: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <defs>
        <linearGradient id="icon-gradient-radar" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="3" stroke={active ? "currentColor" : "url(#icon-gradient-radar)"} strokeWidth="2" />
      <circle cx="12" cy="12" r="6" stroke={active ? "currentColor" : "url(#icon-gradient-radar)"} opacity={active ? 0.6 : 0.5} />
      <circle cx="12" cy="12" r="9" stroke={active ? "currentColor" : "url(#icon-gradient-radar)"} opacity={active ? 0.4 : 0.3} />
      <path d="M12 3 L12 12 L20 20" stroke={active ? "currentColor" : "url(#icon-gradient-radar)"} strokeWidth="2" />
      <circle cx="18" cy="6" r="1.5" fill={active ? "currentColor" : "url(#icon-gradient-radar)"} />
      <circle cx="6" cy="18" r="1.5" fill={active ? "currentColor" : "url(#icon-gradient-radar)"} />
      <circle cx="16" cy="16" r="1" fill={active ? "currentColor" : "url(#icon-gradient-radar)"} opacity={active ? 0.8 : 0.6} />
    </svg>
  ),

  // 心法录 - 书本/卷轴
  Mind: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <defs>
        <linearGradient id="icon-gradient-mind" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke={active ? "currentColor" : "url(#icon-gradient-mind)"} />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke={active ? "currentColor" : "url(#icon-gradient-mind)"} />
      <path d="M8 7h8" stroke={active ? "currentColor" : "url(#icon-gradient-mind)"} opacity="0.6" />
      <path d="M8 11h8" stroke={active ? "currentColor" : "url(#icon-gradient-mind)"} opacity="0.6" />
      <path d="M8 15h5" stroke={active ? "currentColor" : "url(#icon-gradient-mind)"} opacity="0.6" />
    </svg>
  ),

  // 龙虎榜 - 龙虎对峙
  News: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <defs>
        <linearGradient id="icon-gradient-news" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>
      {/* 龙头 */}
      <path d="M12 4 L16 8 L12 12 L8 8 Z" fill={active ? "currentColor" : "url(#icon-gradient-news)"} opacity="0.2" stroke={active ? "currentColor" : "url(#icon-gradient-news)"} />
      {/* 虎尾 */}
      <path d="M12 20 L16 16 L12 12 L8 16 Z" fill={active ? "currentColor" : "url(#icon-gradient-news)"} opacity="0.2" stroke={active ? "currentColor" : "url(#icon-gradient-news)"} />
      {/* 中心能量 */}
      <circle cx="12" cy="12" r="2" fill={active ? "currentColor" : "url(#icon-gradient-news)"} />
      {/* 外框 */}
      <rect x="3" y="3" width="18" height="18" rx="2" stroke={active ? "currentColor" : "url(#icon-gradient-news)"} opacity="0.5" />
    </svg>
  ),

  Plus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),

  Cloud: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
    </svg>
  ),

  CloudOff: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M22.61 16.95A5 5 0 0 0 18 10h-1.26a8 8 0 0 0-7.05-6M5 5a8 8 0 0 0 4 15h9a5 5 0 0 0 1.7-.3" />
    </svg>
  ),

  Save: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  ),

  Share: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  ),

  Upload: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),

  Trash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  ),

  Basic: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),

  Trade: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  ),

  Close: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),

  Search: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
};