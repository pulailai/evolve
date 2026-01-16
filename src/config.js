export const API_BASE = 'http://localhost:3001/api/files';
export const LOCAL_STORAGE_PREFIX = 'market-flow-local:';
export const LAST_OPEN_KEY = 'market-flow-last-open';

export const DEFAULT_LIFECYCLE_STAGES = [
  { id: 'startup', label: '启动', color: '#f59e0b', bg: '#fef3c7' },
  { id: 'rise', label: '主升', color: '#dc2626', bg: '#fef2f2' },
  { id: 'acceleration', label: '加速', color: '#ef4444', bg: '#fee2e2' },
  { id: 'outbreak', label: '爆发', color: '#b91c1c', bg: '#fef2f2' },
  { id: 'accelerated_divergence', label: '加速分歧', color: '#7c3aed', bg: '#f5f3ff' },
  { id: 'divergence', label: '分歧', color: '#6366f1', bg: '#e0e7ff' },
  { id: 'contraction', label: '缩容', color: '#8b5cf6', bg: '#f5f3ff' },
  { id: 'follow_up', label: '补涨', color: '#0ea5e9', bg: '#e0f2fe' },
  { id: 'second_wave', label: '二波', color: '#059669', bg: '#ecfdf5' },
  { id: 'decline', label: '退潮', color: '#64748b', bg: '#f8fafc' },
  { id: 'switch', label: '切换', color: '#1e293b', bg: '#f1f5f9' },
  { id: 'repair', label: '修复', color: '#1e293b', bg: '#f1f5f9' }
];

export const COLOR_PALETTE = [
  { color: '#f59e0b', bg: '#fef3c7', name: '黄(启动)' },
  { color: '#dc2626', bg: '#fef2f2', name: '红(主升)' },
  { color: '#6366f1', bg: '#e0e7ff', name: '紫(分歧)' },
  { color: '#0ea5e9', bg: '#e0f2fe', name: '蓝(补涨)' },
  { color: '#059669', bg: '#ecfdf5', name: '绿(二波)' },
  { color: '#64748b', bg: '#f8fafc', name: '灰(退潮)' },
  { color: '#1e293b', bg: '#f1f5f9', name: '黑(切换)' },
  { color: '#dc2626', bg: '#fef2f2', name: '红(修复)' },

];

export const FUND_TYPES = ['游资', '机构', '量化'];

export const MOOD_TYPES = [
  { id: 'chaos', label: '混沌 (Chaos)', color: '#64748b' },
  { id: 'ice', label: '冰点 (Ice)', color: '#3b82f6' },
];