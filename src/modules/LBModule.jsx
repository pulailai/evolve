import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, ReferenceLine,
  AreaChart, Area
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, Activity, Layers, Users,
  Shield, Target, Briefcase, Crosshair, Clock,
  AlertTriangle, PlayCircle, Newspaper, Flame, BarChart2, Droplets,
  Calendar
} from 'lucide-react';

// ==================== 数据加载区域 ====================

// 1. 尝试加载数据 (兼容 src/components 和 src/ 两种目录结构)
let dataFiles = import.meta.glob('../data/*.json', { eager: true });
if (Object.keys(dataFiles).length === 0) {
  dataFiles = import.meta.glob('./data/*.json', { eager: true });
}

// 2. 解析数据
const allData = Object.keys(dataFiles).reduce((acc, path) => {
  const fileName = path.split('/').pop().replace('.json', '');
  acc[fileName] = dataFiles[path].default || dataFiles[path];
  return acc;
}, {});

// 图标映射
const IconMap = { Shield, Target, Users };

// ==================== 组件区域 ====================

const Card = ({ title, icon: Icon, children, className = "" }) => (
  <div className={`relative group ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
    <div className="relative bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-lg hover:shadow-xl transition-all">
      <div className="flex items-center gap-3 mb-4 border-b border-slate-200 pb-3">
        <div className="p-2 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
          <Icon className="w-5 h-5 text-indigo-600" />
        </div>
        <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
      </div>
      {children}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm p-4 border-2 border-indigo-200 shadow-xl rounded-xl text-sm z-50">
        <p className="font-bold text-slate-800 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-slate-700">
            {entry.name}: <span className="font-bold text-indigo-600">{entry.value}</span> {entry.unit || ''}
          </p>
        ))}
        {payload[0]?.payload?.desc && (
          <p className="text-slate-600 mt-2 text-xs italic border-t border-slate-200 pt-2">{payload[0].payload.desc}</p>
        )}
      </div>
    );
  }
  return null;
};

const LhbDashboard = ({ marketEnv }) => {
  const [activeTab, setActiveTab] = useState('daily');

  const availableDates = useMemo(() => {
    const dates = Object.keys(allData).sort().reverse();
    return dates.length > 0 ? dates : [];
  }, []);

  const [selectedDate, setSelectedDate] = useState(availableDates[0] || '');
  const currentData = allData[selectedDate] || {};

  const {
    dailyFlow: DailyFlowData = [],
    topStocks: TopStocks = [],
    weeklyThemes: WeeklyThemes = [],
    marketVolume: MarketVolumeData = [],
    themeLifecycle: ThemeLifecycleData = [],
    activeSeats: ActiveSeatsData = [],
    fundNature: FundNatureData = []
  } = currentData;

  // 没数据时的提示
  if (availableDates.length === 0) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold text-red-600">⚠️ 未找到数据文件</h2>
        <p className="mt-2 text-slate-600">请确认 src/data/ 目录下有 .json 文件，且路径配置正确。</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 h-screen w-full overflow-y-auto font-sans z-50"
      style={{
        paddingLeft: '72px',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}>
      <div className="w-full px-8 py-6 min-h-full">

        {/* 顶部标题栏 */}
        <header className="mb-8 relative">
          {/* 背景装饰 */}
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-red-100/50 via-orange-100/50 to-yellow-100/50 rounded-3xl blur-2xl -z-10"></div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
            {/* 左侧：Logo + 标题 */}
            <div className="flex items-center gap-6">
              {/* Logo */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-red-200 to-orange-200 rounded-2xl blur-md opacity-50 group-hover:opacity-70 transition-opacity"></div>
                <div className="relative bg-white p-4 rounded-2xl border-2 border-red-100 shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* 龙虎图案 */}
                    <circle cx="24" cy="24" r="20" stroke="url(#gradient1)" strokeWidth="2" opacity="0.3" />
                    <path d="M24 8 L32 16 L24 24 L16 16 Z" fill="url(#gradient2)" opacity="0.6" />
                    <path d="M24 40 L32 32 L24 24 L16 32 Z" fill="url(#gradient3)" opacity="0.6" />
                    <circle cx="24" cy="24" r="4" fill="url(#gradient4)">
                      <animate attributeName="r" values="4;5;4" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <defs>
                      <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#f97316" />
                      </linearGradient>
                      <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#dc2626" />
                      </linearGradient>
                      <linearGradient id="gradient3" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#ea580c" />
                      </linearGradient>
                      <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fbbf24" />
                        <stop offset="100%" stopColor="#f59e0b" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

              {/* 标题组 */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 bg-clip-text text-transparent">
                    龙虎榜资金透视
                  </h1>
                  <div className="px-3 py-1 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-full">
                    <span className="text-xs font-semibold text-red-600">Dragon-Tiger List</span>
                  </div>
                </div>
                <p className="text-slate-600 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm"></span>
                  实时追踪主力资金动向 · 数据来源：交易所公开信息
                </p>
              </div>
            </div>

            {/* 右侧：日期选择器 */}
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative flex items-center gap-3 bg-white border-2 border-indigo-100 rounded-xl px-4 py-3 shadow-md hover:shadow-lg transition-all">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="appearance-none bg-transparent font-bold text-slate-700 outline-none cursor-pointer pr-8 text-sm"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%235b21b6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.5rem center',
                      backgroundSize: '1.25rem'
                    }}
                  >
                    {availableDates.map(date => (
                      <option key={date} value={date} className="bg-white text-slate-700">
                        {allData[date]?.updateTime || date}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* 顶部三个核心指标 - 横向一排布局 */}
        <div className="flex gap-6 mb-8 overflow-x-auto pb-2">
          {/* 最强吸金方向 */}
          <div className="relative group flex-1 min-w-[280px]">
            <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
            <div className="relative bg-white p-6 rounded-2xl border-2 border-red-100 shadow-lg hover:shadow-xl transition-all h-full">
              <div className="text-red-600 text-sm font-semibold mb-2 flex items-center gap-2">
                <div className="p-1.5 bg-red-50 rounded-lg">
                  <TrendingUp className="w-4 h-4" />
                </div>
                最强吸金方向
              </div>
              <div className="text-3xl font-bold text-slate-800 mb-1">{DailyFlowData[0]?.name || '--'}</div>
              <div className="text-xs text-slate-600">净流入 <span className="text-red-600 font-bold text-sm">{DailyFlowData[0]?.netFlow || 0}</span> 亿</div>
            </div>
          </div>

          {/* 单股净买之最 */}
          <div className="relative group flex-1 min-w-[280px]">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative bg-white p-6 rounded-2xl border-2 border-orange-100 shadow-xl h-full">
              <div className="text-orange-600 text-sm font-semibold mb-2 flex items-center gap-2">
                <div className="p-1.5 bg-orange-50 rounded-lg">
                  <DollarSign className="w-4 h-4" />
                </div>
                单股净买之最
              </div>
              <div className="text-3xl font-bold text-slate-800 mb-1">{TopStocks[0]?.name || '--'}</div>
              <div className="text-xs text-slate-600">净买入 <span className="text-orange-600 font-bold">{TopStocks[0]?.value || 0}</span> 亿</div>
            </div>
          </div>

          {/* 市场环境 */}
          <div className="relative group flex-1 min-w-[280px]">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
            <div className="relative bg-white p-6 rounded-2xl border-2 border-blue-100 shadow-lg hover:shadow-xl transition-all h-full">
              <div className="text-blue-600 text-sm font-semibold mb-2 flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 rounded-lg">
                  <Activity className="w-4 h-4" />
                </div>
                市场环境
              </div>
              <div className="text-3xl font-bold text-slate-800 mb-1">{MarketVolumeData[MarketVolumeData.length - 1]?.status || '--'}</div>
              <div className="text-xs text-slate-600">{MarketVolumeData[MarketVolumeData.length - 1]?.desc || '--'}</div>
            </div>
          </div>
        </div>


        {/* Tabs 切换 */}
        <div className="flex gap-2 mb-8 bg-white p-1.5 rounded-xl border-2 border-slate-200 shadow-md w-fit overflow-x-auto">
          {['daily', 'weekly', 'market', 'lifecycle', 'seats', 'analysis'].map((tab) => {
            const labels = { daily: '单日资金流向', weekly: '周度累积热度', market: '市场环境分析', lifecycle: '题材炒作周期', seats: '活跃席位追踪', analysis: '资金属性解密' };
            return (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === tab ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'}`}>
                {labels[tab]}
              </button>
            )
          })}
        </div>

        {/* 内容展示区 */}
        <div className="min-h-[500px]">
          {activeTab === 'daily' && (
            <div className="grid grid-cols-2 gap-6">
              {/* 板块资金流向 */}
              <Card title="板块资金流向分布" icon={Layers}>
                <div className="w-full" style={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={DailyFlowData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                      <YAxis tick={{ fill: '#94a3b8' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="netFlow" radius={[8, 8, 0, 0]}>
                        {DailyFlowData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.type === 'in' ? '#ef4444' : '#22c55e'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* 个股资金净流入排行 */}
              <Card title="个股资金净流入排行" icon={Calendar}>
                <div className="w-full" style={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={TopStocks} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                      <YAxis tick={{ fill: '#94a3b8' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {TopStocks.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#fb923c' : '#34d399'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'weekly' && (
            <Card title="本周资金权重分布" icon={Layers}>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-full md:w-1/2" style={{ height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={WeeklyThemes} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                        {WeeklyThemes.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/2 space-y-4">
                  {WeeklyThemes.map((theme, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-gradient-to-r from-slate-50 to-white rounded-lg border-2 border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all">
                      <div className="w-4 h-4 rounded-full mt-1 shrink-0 shadow-md" style={{ backgroundColor: theme.color }}></div>
                      <div><div className="font-bold text-slate-800">{theme.name}</div><div className="text-xs text-slate-600 mt-1">{theme.details}</div></div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'market' && (
            <div className="space-y-6">
              <Card title="量能变化趋势" icon={BarChart2}>
                <div className="w-full" style={{ height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MarketVolumeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.6} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                      <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                      <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="volume" stroke="#818cf8" strokeWidth={2} fillOpacity={1} fill="url(#colorVol)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 量能信号灯 */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
                  <div className="relative bg-white p-6 rounded-2xl border-2 border-blue-100 shadow-lg hover:shadow-xl transition-all">
                    <div className="flex items-center gap-2 mb-4 text-blue-600 font-bold"><Droplets className="w-5 h-5" /> 量能信号灯</div>
                    <div className="space-y-3">{MarketVolumeData.slice(-3).map((item, idx) => (<div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"><span className="text-sm text-slate-700 font-medium">{item.date}</span><span className={`text-xs px-3 py-1.5 rounded-lg font-bold ${item.change > 0 ? 'bg-red-50 text-red-600 border-2 border-red-200' : 'bg-green-50 text-green-600 border-2 border-green-200'}`}>{item.volume}万亿 ({item.status})</span></div>))}</div>
                  </div>
                </div>
                {/* 市场情绪钟 */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
                  <div className="relative bg-white p-6 rounded-2xl border-2 border-orange-100 shadow-lg hover:shadow-xl transition-all">
                    <div className="flex items-center gap-2 mb-4 text-orange-600 font-bold"><Activity className="w-5 h-5" /> 市场情绪钟</div>
                    <div className="flex items-center justify-center h-32"><div className="text-center"><div className="text-5xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent mb-2">{MarketVolumeData[MarketVolumeData.length - 1]?.sentiment || 50}</div><div className="text-sm text-slate-600">情绪评分 (0-100)</div></div></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'lifecycle' && (
            <Card title="题材炒作周期推演" icon={Clock}>
              <div className="space-y-6">
                {ThemeLifecycleData.map((theme, idx) => (
                  <div key={idx} className="relative pl-6 border-l-2 border-indigo-100 last:border-0 pb-6 last:pb-0">
                    <div className={`absolute top-0 left-[-9px] w-4 h-4 rounded-full border-2 border-white shadow-sm ${theme.trend === 'up' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2 relative">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-800 text-lg">{theme.name}</h4>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${theme.trend === 'up' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
                              {theme.phase}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1">活跃天数: {theme.daysActive}天 | 启动: {theme.startDate}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-slate-800">{theme.heat} <span className="text-xs text-slate-400 font-normal">热度</span></div>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mb-3 bg-white p-3 rounded-lg border border-slate-100 leading-relaxed">{theme.insight}</p>
                      <div className="space-y-1">
                        {theme.news.map((news, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
                            <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                            {news}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'seats' && (
            <div className="grid grid-cols-3 gap-6">
              {ActiveSeatsData.map((seat, idx) => (
                <Card key={idx} title={seat.name} icon={Target} className="h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded">{seat.type}</span>
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">{seat.tag}</span>
                    <span className={`px-2 py-1 text-xs rounded font-bold ml-auto ${seat.direction === '进攻' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                      {seat.direction}
                    </span>
                  </div>
                  <div className="space-y-3 mb-4">
                    {seat.stocks.map((stock, i) => (
                      <div key={i} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                        <span className="font-bold text-slate-700">{stock.name}</span>
                        <div className="text-right">
                          <div className="text-sm font-bold text-red-500">{stock.amount}</div>
                          <div className="text-xs text-slate-400">{stock.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-slate-500 bg-white p-3 rounded-lg border border-slate-100 leading-relaxed">
                    {seat.desc}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="grid grid-cols-3 gap-6">
              {FundNatureData.map((item, idx) => (
                <Card key={idx} title={item.sector} icon={Shield} className="h-full">
                  <div className="flex flex-col gap-4">
                    <div className="w-full h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={item.composition} cx="50%" cy="50%" innerRadius={30} outerRadius={60} paddingAngle={5} dataKey="val">
                            {item.composition.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-3">
                      <div className="text-sm font-bold text-slate-800">
                        主导: <span className="text-indigo-600">{item.dominant}</span>
                      </div>
                      <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                        {item.desc}
                      </p>
                      <div className="space-y-2">
                        {item.composition.map((comp, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: comp.color }}></div>
                            <span className="text-xs text-slate-600">{comp.name}: <span className="font-bold">{comp.val}%</span></span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LhbDashboard;