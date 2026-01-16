import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './MindModule.css';

// 内联图标组件
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
);

const ShareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
);

// 系统心法语录
const SYSTEM_QUOTES = {
    hot: [
        { text: "春江水暖鸭先知，顺势而为。", author: "苏轼" },
        { text: "趋势一旦形成，就不会轻易改变。", author: "道氏理论" }
    ],
    cold: [
        { text: "耐心是交易者的头号资本。", author: "杰西·利弗莫尔" },
        { text: "在别人恐惧时贪婪，在别人绝望时等待。", author: "沃伦·巴菲特" }
    ],
    neutral: [
        { text: "静胜躁，寒胜热。清静为天下正。", author: "老子" },
        { text: "看山是山，看水是水。平淡中蕴含生机。", author: "禅语" }
    ],
    general: [
        { text: "知己知彼，百战不殆。", author: "孙子兵法" },
        { text: "截断亏损，让利润奔跑。", author: "华尔街格言" }
    ]
};

// 分类配置
const CATEGORIES = [
    { id: 'hot', name: '🔥 狂热期心法', icon: '🔥', color: '#f97316', type: 'environment' },
    { id: 'cold', name: '❄️ 冰冷期心法', icon: '❄️', color: '#0ea5e9', type: 'environment' },
    { id: 'neutral', name: '🌀 轮动期心法', icon: '🌀', color: '#a855f7', type: 'environment' },
    { id: 'general', name: '💡 综合心法', icon: '💡', color: '#10b981', type: 'fixed' },
    { id: 'insight', name: '🏆 感悟录', icon: '🏆', color: '#eab308', type: 'fixed' },
    { id: 'journal', name: '📋 操盘日志', icon: '📋', color: '#6366f1', type: 'fixed' },
    { id: 'lesson', name: '⚠️ 教训警示', icon: '⚠️', color: '#ef4444', type: 'fixed' }
];

const MindModule = ({ marketEnv }) => {
    const { mode, phase } = marketEnv || { mode: 'neutral', phase: 'normal' };

    // 状态
    const [activeCategory, setActiveCategory] = useState(mode);
    const [notes, setNotes] = useState([]);
    const [selectedNote, setSelectedNote] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [wisdomCards, setWisdomCards] = useState([]);
    const [showCardModal, setShowCardModal] = useState(false);
    const [newCard, setNewCard] = useState({ text: '', author: '', category: 'general' });

    // 初始化加载
    useEffect(() => {
        try {
            const savedNotes = localStorage.getItem('mind_notes');
            const savedCards = localStorage.getItem('mind_cards');
            if (savedNotes) setNotes(JSON.parse(savedNotes));
            if (savedCards) setWisdomCards(JSON.parse(savedCards));
        } catch (e) {
            console.error('Failed to load data:', e);
        }
    }, []);

    // 环境变化时自动切换分类
    useEffect(() => {
        if (['hot', 'cold', 'neutral'].includes(mode)) {
            setActiveCategory(mode);
        }
    }, [mode]);

    // 保存笔记
    const saveNotes = useCallback((updatedNotes) => {
        setNotes(updatedNotes);
        localStorage.setItem('mind_notes', JSON.stringify(updatedNotes));
    }, []);

    // 保存卡片
    const saveCards = useCallback((updatedCards) => {
        setWisdomCards(updatedCards);
        localStorage.setItem('mind_cards', JSON.stringify(updatedCards));
    }, []);

    // 筛选当前分类的笔记
    const filteredNotes = useMemo(() => {
        let result = notes.filter(n => n.category === activeCategory);
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(n =>
                (n.title && n.title.toLowerCase().includes(query)) ||
                (n.content && n.content.toLowerCase().includes(query))
            );
        }
        return result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }, [notes, activeCategory, searchQuery]);

    // 获取当前分类的心法卡片
    const displayCards = useMemo(() => {
        const systemCards = (SYSTEM_QUOTES[activeCategory] || SYSTEM_QUOTES.general)
            .map((q, i) => ({ ...q, id: `sys_${activeCategory}_${i}`, isSystem: true }));
        const userCards = wisdomCards.filter(c => c.category === activeCategory || c.category === 'all');
        return [...userCards, ...systemCards];
    }, [wisdomCards, activeCategory]);

    // 创建新笔记
    const createNote = () => {
        const newNote = {
            id: `note_${Date.now()}`,
            title: '新笔记',
            content: '',
            category: activeCategory,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        saveNotes([newNote, ...notes]);
        setSelectedNote(newNote);
    };

    // 更新笔记
    const updateNote = (id, changes) => {
        const updated = notes.map(n =>
            n.id === id ? { ...n, ...changes, updatedAt: new Date().toISOString() } : n
        );
        saveNotes(updated);
        if (selectedNote && selectedNote.id === id) {
            setSelectedNote({ ...selectedNote, ...changes });
        }
    };

    // 删除笔记
    const deleteNote = (id) => {
        if (!window.confirm('确定删除这条笔记吗？')) return;
        saveNotes(notes.filter(n => n.id !== id));
        if (selectedNote && selectedNote.id === id) setSelectedNote(null);
    };

    // 添加心法卡片
    const addCard = () => {
        if (!newCard.text) return;
        const card = {
            id: `card_${Date.now()}`,
            ...newCard,
            createdAt: new Date().toISOString()
        };
        saveCards([card, ...wisdomCards]);
        setNewCard({ text: '', author: '', category: 'general' });
        setShowCardModal(false);
    };

    // 删除心法卡片
    const deleteCard = (id) => {
        if (id.startsWith('sys_')) return;
        saveCards(wisdomCards.filter(c => c.id !== id));
    };

    // 导出笔记
    const exportNotes = () => {
        const data = { notes, wisdomCards, exportedAt: new Date().toISOString() };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `心法录_${new Date().toLocaleDateString()}.json`;
        a.click();
    };

    const getCategoryInfo = (id) => CATEGORIES.find(c => c.id === id) || CATEGORIES[3];
    const currentCategoryColor = getCategoryInfo(activeCategory).color;

    return (
        <div className={`mind-module mode-${mode}`} style={{ '--accent-color': currentCategoryColor }}>
            {/* 侧边栏 */}
            <aside className="mind-sidebar">
                <div className="sidebar-header">
                    <h2>📖 心法录</h2>
                    <span className="env-badge" style={{ background: currentCategoryColor }}>
                        {mode === 'hot' ? '🔥' : mode === 'cold' ? '❄️' : '🌀'} {phase}
                    </span>
                </div>

                <div className="sidebar-search">
                    <SearchIcon />
                    <input
                        type="text"
                        placeholder="搜索笔记..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <nav className="category-nav">
                    <div className="nav-section">
                        <span className="nav-label">环境联动</span>
                        {CATEGORIES.filter(c => c.type === 'environment').map(cat => (
                            <button
                                key={cat.id}
                                className={`nav-item ${activeCategory === cat.id ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat.id)}
                                style={{ '--cat-color': cat.color }}
                            >
                                <span className="nav-icon">{cat.icon}</span>
                                <span className="nav-text">{cat.name.slice(2)}</span>
                                <span className="nav-count">{notes.filter(n => n.category === cat.id).length}</span>
                            </button>
                        ))}
                    </div>

                    <div className="nav-section">
                        <span className="nav-label">核心分类</span>
                        {CATEGORIES.filter(c => c.type === 'fixed').map(cat => (
                            <button
                                key={cat.id}
                                className={`nav-item ${activeCategory === cat.id ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat.id)}
                                style={{ '--cat-color': cat.color }}
                            >
                                <span className="nav-icon">{cat.icon}</span>
                                <span className="nav-text">{cat.name.slice(2)}</span>
                                <span className="nav-count">{notes.filter(n => n.category === cat.id).length}</span>
                            </button>
                        ))}
                    </div>
                </nav>

                <div className="sidebar-stats">
                    <div className="stat-item">
                        <span className="stat-value">{notes.length}</span>
                        <span className="stat-label">总笔记</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">{wisdomCards.length}</span>
                        <span className="stat-label">自定义心法</span>
                    </div>
                </div>

                <button className="export-btn" onClick={exportNotes}>
                    <ShareIcon /> 导出数据
                </button>
            </aside>

            {/* 主内容区 */}
            <main className="mind-main">
                {/* 笔记列表 */}
                <section className="notes-panel">
                    <div className="panel-header">
                        <h3>{getCategoryInfo(activeCategory).name}</h3>
                        <button className="add-note-btn" onClick={createNote}>
                            <PlusIcon /> 新建笔记
                        </button>
                    </div>

                    <div className="notes-list">
                        {filteredNotes.length === 0 ? (
                            <div className="empty-state">
                                <span className="empty-icon">📝</span>
                                <p>暂无笔记，开始记录吧</p>
                            </div>
                        ) : (
                            filteredNotes.map(note => (
                                <div
                                    key={note.id}
                                    className={`note-item ${selectedNote && selectedNote.id === note.id ? 'active' : ''}`}
                                    onClick={() => setSelectedNote(note)}
                                >
                                    <h4>{note.title}</h4>
                                    <p>{(note.content || '').slice(0, 60) || '空白笔记...'}</p>
                                    <span className="note-date">
                                        {new Date(note.updatedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* 笔记编辑区 */}
                <section className="editor-panel">
                    {selectedNote ? (
                        <React.Fragment>
                            <div className="editor-header">
                                <input
                                    type="text"
                                    className="editor-title"
                                    value={selectedNote.title}
                                    onChange={(e) => updateNote(selectedNote.id, { title: e.target.value })}
                                    placeholder="笔记标题..."
                                />
                                <div className="editor-actions">
                                    <button
                                        className="action-btn danger"
                                        onClick={() => deleteNote(selectedNote.id)}
                                        title="删除"
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                            </div>
                            <div className="editor-meta">
                                <span>创建于 {new Date(selectedNote.createdAt).toLocaleString()}</span>
                            </div>
                            <textarea
                                className="editor-content"
                                value={selectedNote.content}
                                onChange={(e) => updateNote(selectedNote.id, { content: e.target.value })}
                                placeholder="在此记录你的交易心法与感悟..."
                            />
                            <div className="editor-footer">
                                字数: {(selectedNote.content || '').length} | 自动保存已启用
                            </div>
                        </React.Fragment>
                    ) : (
                        <div className="editor-placeholder">
                            <span className="placeholder-icon">✍️</span>
                            <p>选择一条笔记开始编辑</p>
                            <p className="placeholder-hint">或点击"新建笔记"创建新记录</p>
                        </div>
                    )}
                </section>

                {/* 心法卡片区 */}
                <section className="cards-panel">
                    <div className="panel-header">
                        <h3>💎 心法精粹</h3>
                        <button className="add-card-btn" onClick={() => setShowCardModal(true)}>
                            <PlusIcon /> 添加心法
                        </button>
                    </div>

                    <div className="cards-grid">
                        {displayCards.map(card => (
                            <div
                                key={card.id}
                                className={`wisdom-card ${card.isSystem ? 'system' : 'custom'}`}
                            >
                                <p className="card-text">"{card.text}"</p>
                                <div className="card-footer">
                                    <span className="card-author">—— {card.author || '无名'}</span>
                                    {!card.isSystem && (
                                        <button className="card-delete" onClick={() => deleteCard(card.id)}>×</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* 添加心法卡片弹窗 */}
            {showCardModal && (
                <div className="modal-overlay" onClick={() => setShowCardModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>✨ 添加心法</h3>
                            <button className="close-btn" onClick={() => setShowCardModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <textarea
                                placeholder="输入心法内容..."
                                value={newCard.text}
                                onChange={(e) => setNewCard({ ...newCard, text: e.target.value })}
                            />
                            <div className="modal-row">
                                <input
                                    type="text"
                                    placeholder="作者/来源"
                                    value={newCard.author}
                                    onChange={(e) => setNewCard({ ...newCard, author: e.target.value })}
                                />
                                <select
                                    value={newCard.category}
                                    onChange={(e) => setNewCard({ ...newCard, category: e.target.value })}
                                >
                                    <option value="all">全部环境</option>
                                    <option value="hot">狂热期</option>
                                    <option value="cold">冰冷期</option>
                                    <option value="neutral">轮动期</option>
                                    <option value="general">综合心法</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="cancel-btn" onClick={() => setShowCardModal(false)}>取消</button>
                            <button className="confirm-btn" onClick={addCard}>添加</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 背景装饰 */}
            <div className="mind-bg-grid"></div>
        </div>
    );
};

export default MindModule;
