// 笔记模板配置
export const noteTemplates = [
    {
        id: 'blank',
        name: '空白笔记',
        icon: '📄',
        description: '从零开始，自由创作',
        category: 'basic',
        content: '<p></p>',
        defaultTags: [],
    },
    {
        id: 'alert-motto',
        name: '警句格言',
        icon: '⚡',
        description: '醒目的交易格言提醒',
        category: 'alert',
        content: `<h2>⚡ 交易警句</h2>
<blockquote style="border-left: 4px solid #ef4444; background: #fef2f2; padding: 16px;">
  <p style="color: #ef4444; font-size: 16px; font-weight: 600;">在此输入你的警句格言...</p>
</blockquote>
<h3>适用场景</h3>
<p>标签：<code>#炽热期</code> <code>#风险警示</code></p>
<h3>详细说明</h3>
<p>解释这条警句的含义和重要性...</p>`,
        defaultTags: ['#炽热期', '#风险警示'],
        isBarrageEnabled: true,
    },
    {
        id: 'operation-reminder',
        name: '操作提醒',
        icon: '🔔',
        description: '具体的操作提示',
        category: 'alert',
        content: `<h2>🔔 操作提醒</h2>
<h3>提醒内容</h3>
<p style="color: #f97316; font-weight: 600; font-size: 15px;">在此输入操作提醒...</p>
<h3>触发条件</h3>
<ul>
  <li>市场环境：</li>
  <li>技术指标：</li>
  <li>情绪状态：</li>
</ul>
<h3>标签</h3>
<p><code>#入场提醒</code> <code>#中性期</code></p>`,
        defaultTags: ['#入场提醒', '#中性期'],
        isBarrageEnabled: true,
    },
    {
        id: 'risk-warning',
        name: '风险警示',
        icon: '⚠️',
        description: '风险控制警告',
        category: 'alert',
        content: `<h2>⚠️ 风险警示</h2>
<div style="background: #fef2f2; border: 2px solid #ef4444; border-radius: 8px; padding: 16px;">
  <h3 style="color: #ef4444; margin-top: 0;">⛔ 警告</h3>
  <p style="color: #dc2626;">在此输入风险警告内容...</p>
</div>
<h3>应对措施</h3>
<ol>
  <li>立即止损</li>
  <li>降低仓位</li>
</ol>
<h3>标签</h3>
<p><code>#风险警示</code> <code>#炽热期</code> <code>#高优先级</code></p>`,
        defaultTags: ['#风险警示', '#炽热期', '#高优先级'],
        isBarrageEnabled: true,
    },
    {
        id: 'mindset-adjustment',
        name: '心态调整',
        icon: '🧘',
        description: '情绪管理提醒',
        category: 'alert',
        content: `<h2>🧘 心态调整</h2>
<blockquote style="border-left: 4px solid #10b981; background: #f0fdf4; padding: 16px;">
  <p style="color: #10b981; font-size: 15px;">深呼吸，保持冷静</p>
</blockquote>
<h3>当前情绪</h3>
<p>😰 焦虑 / 😤 贪婪 / 😨 恐惧</p>
<h3>自我提醒</h3>
<ul>
  <li>市场永远有机会</li>
  <li>不要被情绪左右</li>
</ul>
<h3>标签</h3>
<p><code>#心态调整</code> <code>#冰冷期</code></p>`,
        defaultTags: ['#心态调整', '#冰冷期'],
        isBarrageEnabled: true,
    },
    {
        id: 'discipline-execution',
        name: '纪律执行',
        icon: '📏',
        description: '交易纪律强调',
        category: 'alert',
        content: `<h2>📏 纪律执行</h2>
<h3>核心原则</h3>
<p style="font-weight: 600; color: #6366f1;">严格遵守交易纪律</p>
<h3>执行要点</h3>
<ol>
  <li><strong>止损：</strong>跌破支撑立即止损</li>
  <li><strong>止盈：</strong>达到目标分批止盈</li>
  <li><strong>仓位：</strong>单只股票不超过20%</li>
</ol>
<h3>违规后果</h3>
<p style="color: #ef4444;">违反纪律将导致严重亏损</p>
<h3>标签</h3>
<p><code>#纪律执行</code> <code>#高优先级</code></p>`,
        defaultTags: ['#纪律执行', '#高优先级'],
        isBarrageEnabled: true,
    },
    {
        id: 'trading-journal',
        name: '交易日志',
        icon: '📊',
        description: '记录每日交易详情',
        category: 'trading',
        content: `<h2>📊 交易日志 - ${new Date().toLocaleDateString()}</h2>
<h3>市场环境</h3>
<p>市场状态：</p>
<p>主要指数：</p>
<h3>交易记录</h3>
<ul>
  <li>买入：</li>
  <li>卖出：</li>
  <li>持仓：</li>
</ul>
<h3>盈亏分析</h3>
<p>今日盈亏：</p>
<p>累计盈亏：</p>
<h3>心得体会</h3>
<p></p>`,
        defaultTags: [],
    },
    {
        id: 'review-summary',
        name: '复盘总结',
        icon: '🔍',
        description: '分析得失和改进',
        category: 'trading',
        content: `<h2>🔍 复盘总结</h2>
<h3>✅ 做对了什么</h3>
<ul>
  <li></li>
</ul>
<h3>❌ 做错了什么</h3>
<ul>
  <li></li>
</ul>
<h3>💡 关键启示</h3>
<blockquote>
  <p></p>
</blockquote>
<h3>📝 改进计划</h3>
<p></p>`,
        defaultTags: [],
    },
    {
        id: 'strategy-analysis',
        name: '策略分析',
        icon: '🎯',
        description: '研究交易策略',
        category: 'trading',
        content: `<h2>🎯 策略分析</h2>
<h3>策略名称</h3>
<p></p>
<h3>适用环境</h3>
<p><strong>市场状态：</strong></p>
<p><strong>板块特征：</strong></p>
<h3>操作要点</h3>
<ol>
  <li>入场时机：</li>
  <li>仓位管理：</li>
  <li>止损止盈：</li>
</ol>
<h3>风险提示</h3>
<p style="color: #ef4444"></p>
<h3>历史表现</h3>
<p>成功率：</p>
<p>盈亏比：</p>`,
        defaultTags: [],
    },
    {
        id: 'learning-note',
        name: '学习笔记',
        icon: '📚',
        description: '知识整理',
        category: 'learning',
        content: `<h2>📚 学习笔记</h2>
<h3>主题</h3>
<p></p>
<h3>核心观点</h3>
<ul>
  <li></li>
  <li></li>
  <li></li>
</ul>
<h3>实践应用</h3>
<p></p>
<h3>延伸思考</h3>
<blockquote>
  <p></p>
</blockquote>`,
        defaultTags: [],
    },
    {
        id: 'emotion-record',
        name: '情绪记录',
        icon: '😊',
        description: '心态管理',
        category: 'learning',
        content: `<h2>😊 情绪记录</h2>
<h3>当前状态</h3>
<p>情绪指数：⭐⭐⭐⭐⭐</p>
<p>信心水平：</p>
<h3>触发因素</h3>
<p></p>
<h3>应对措施</h3>
<ul>
  <li></li>
</ul>
<h3>自我提醒</h3>
<blockquote>
  <p style="color: #10b981">保持冷静，理性决策</p>
</blockquote>`,
        defaultTags: ['#心态调整'],
    },
    {
        id: 'quick-note',
        name: '快速笔记',
        icon: '💭',
        description: '灵感记录',
        category: 'learning',
        content: `<h3>💭 快速记录</h3>
<p></p>`,
        defaultTags: [],
    },
];

// 可用标签列表
export const availableTags = {
    environment: [
        // 综合标签 - 在所有环境显示
        { id: 'all', label: '#综合', color: '#8b5cf6' },
        
        // 主要环境
        { id: 'hot', label: '#狂热期', color: '#dc2626' },
        { id: 'neutral', label: '#灰白期', color: '#64748b' },
        { id: 'cold', label: '#冰冷期', color: '#1e3a8a' },
        
        // 狂热期二级标签
        { id: 'warming', label: '#试探期', color: '#f97316' },
        { id: 'heating', label: '#升温期', color: '#ef4444' },
        { id: 'boiling', label: '#狂热期-高潮', color: '#dc2626' },
        { id: 'exhausted', label: '#枯竭期', color: '#f59e0b' },
        
        // 冰冷期二级标签
        { id: 'chilly', label: '#微寒期', color: '#0ea5e9' },
        { id: 'freezing', label: '#冰冻期', color: '#0284c7' },
        { id: 'frozen', label: '#冰封期', color: '#1e3a8a' },
    ],
    operation: [
        { id: 'entry', label: '#入场提醒', color: '#10b981' },
        { id: 'exit', label: '#出场提醒', color: '#ef4444' },
        { id: 'risk', label: '#风险警示', color: '#dc2626' },
        { id: 'mindset', label: '#心态调整', color: '#0ea5e9' },
        { id: 'discipline', label: '#纪律执行', color: '#6366f1' },
    ],
    priority: [
        { id: 'high', label: '#高优先级', color: '#dc2626' },
        { id: 'medium', label: '#中优先级', color: '#f97316' },
        { id: 'low', label: '#低优先级', color: '#6b7280' },
    ],
};
