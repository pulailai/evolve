import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './MindModule.css';
import RichTextEditor from '../components/RichTextEditor';
import { noteTemplates, availableTags } from '../config/noteTemplates';
import { barrageStyleTemplates } from '../config/barrageStyles';


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
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [barrageSettingsCollapsed, setBarrageSettingsCollapsed] = useState(false);


    // 从HTML中提取纯文本用于预览
    const stripHtml = (html) => {
        if (!html) return '';
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    // 初始化加载所有笔记
    useEffect(() => {
        const loadAllNotes = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/mind/notes');
                const data = await response.json();
                setNotes(data);
            } catch (e) {
                console.error('Failed to load notes:', e);
            }
        };

        const loadCards = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/mind/cards/custom');
                const data = await response.json();
                setWisdomCards(data);
            } catch (e) {
                console.error('Failed to load cards:', e);
            }
        };

        loadAllNotes();
        loadCards();
    }, []);

    // 环境变化时自动切换分类
    useEffect(() => {
        if (['hot', 'cold', 'neutral'].includes(mode)) {
            setActiveCategory(mode);
        }
    }, [mode]);

    // 切换分类时清空选中的笔记
    useEffect(() => {
        setSelectedNote(null);
    }, [activeCategory]);

    // 保存笔记到服务器
    const saveNoteToServer = useCallback(async (note) => {
        try {
            await fetch('http://localhost:3001/api/mind/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(note)
            });
        } catch (error) {
            console.error('Failed to save note:', error);
        }
    }, []);

    // 保存卡片到服务器
    const saveCardsToServer = useCallback(async (cards) => {
        try {
            await fetch('http://localhost:3001/api/mind/cards/custom', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cards })
            });
        } catch (error) {
            console.error('Failed to save cards:', error);
        }
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
        const updatedNotes = [newNote, ...notes];
        setNotes(updatedNotes);
        setSelectedNote(newNote);
        saveNoteToServer(newNote);
    };

    // 更新笔记
    const updateNote = (id, changes) => {
        const updated = notes.map(n =>
            n.id === id ? { ...n, ...changes, updatedAt: new Date().toISOString() } : n
        );
        setNotes(updated);
        if (selectedNote && selectedNote.id === id) {
            const updatedNote = { ...selectedNote, ...changes, updatedAt: new Date().toISOString() };
            setSelectedNote(updatedNote);
            saveNoteToServer(updatedNote);
        }
    };

    // 删除笔记
    const deleteNote = async (id) => {
        if (!window.confirm('确定删除这条笔记吗？')) return;

        const note = notes.find(n => n.id === id);
        if (!note) return;

        try {
            await fetch(`http://localhost:3001/api/mind/notes/${note.category}/${id}`, {
                method: 'DELETE'
            });
            setNotes(notes.filter(n => n.id !== id));
            if (selectedNote && selectedNote.id === id) setSelectedNote(null);
        } catch (error) {
            console.error('Failed to delete note:', error);
        }
    };

    // 从模板创建笔记
    const createNoteFromTemplate = async (template) => {
        const newNote = {
            id: `note_${Date.now()}`,
            title: template.name,
            content: template.content,
            category: activeCategory,
            tags: template.defaultTags || [],
            isBarrageEnabled: template.isBarrageEnabled || false,
            barrageText: template.defaultTags.length > 0 ? stripHtml(template.content).slice(0, 50) : '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isPinned: false,
        };

        setNotes([newNote, ...notes]);
        setSelectedNote(newNote);
        setShowTemplateModal(false);

        // 保存到服务器
        await saveNoteToServer(newNote);
    };

    // 切换笔记标签
    const toggleTag = (noteId, tag) => {
        const note = notes.find(n => n.id === noteId);
        if (!note) return;

        const tags = note.tags || [];
        const newTags = tags.includes(tag)
            ? tags.filter(t => t !== tag)
            : [...tags, tag];

        updateNote(noteId, { tags: newTags });
    };

    // 添加心法卡片
    const addCard = () => {
        if (!newCard.text) return;
        const card = {
            id: `card_${Date.now()}`,
            ...newCard,
            createdAt: new Date().toISOString()
        };
        const updatedCards = [card, ...wisdomCards];
        setWisdomCards(updatedCards);
        saveCardsToServer(updatedCards);
        setNewCard({ text: '', author: '', category: 'general' });
        setShowCardModal(false);
    };

    // 删除心法卡片
    const deleteCard = (id) => {
        if (id.startsWith('sys_')) return;
        const updatedCards = wisdomCards.filter(c => c.id !== id);
        setWisdomCards(updatedCards);
        saveCardsToServer(updatedCards);
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
                                className={`mind-nav-item ${activeCategory === cat.id ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat.id)}
                                style={{ '--cat-color': cat.color }}
                            >
                                <span className="mind-nav-icon">{cat.icon}</span>
                                <span className="mind-nav-text">{cat.name.slice(2)}</span>
                                <span className="mind-nav-count">{notes.filter(n => n.category === cat.id).length}</span>
                            </button>
                        ))}
                    </div>

                    <div className="nav-section">
                        <span className="nav-label">核心分类</span>
                        {CATEGORIES.filter(c => c.type === 'fixed').map(cat => (
                            <button
                                key={cat.id}
                                className={`mind-nav-item ${activeCategory === cat.id ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat.id)}
                                style={{ '--cat-color': cat.color }}
                            >
                                <span className="mind-nav-icon">{cat.icon}</span>
                                <span className="mind-nav-text">{cat.name.slice(2)}</span>
                                <span className="mind-nav-count">{notes.filter(n => n.category === cat.id).length}</span>
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
                        <button className="add-note-btn" onClick={() => setShowTemplateModal(true)}>
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
                                    <p>{stripHtml(note.content).slice(0, 60) || '空白笔记...'}</p>
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

                            <RichTextEditor
                                content={selectedNote.content}
                                onChange={(html) => updateNote(selectedNote.id, { content: html })}
                            />

                            {/* 弹幕设置 - 可折叠 */}
                            <div className="barrage-settings">
                                <div className="barrage-settings-header" onClick={() => setBarrageSettingsCollapsed(!barrageSettingsCollapsed)}>
                                    <div className="setting-row">
                                        <label className="checkbox-label" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selectedNote.isBarrageEnabled || false}
                                                onChange={(e) => updateNote(selectedNote.id, {
                                                    isBarrageEnabled: e.target.checked
                                                })}
                                            />
                                            <span>🎬 启用弹幕提醒</span>
                                        </label>
                                        {selectedNote.isBarrageEnabled && (
                                            <button className="collapse-btn" type="button">
                                                {barrageSettingsCollapsed ? '▼' : '▲'}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {selectedNote.isBarrageEnabled && !barrageSettingsCollapsed && (
                                    <>
                                        <div className="setting-row">
                                            <label>弹幕文本：</label>
                                            <input
                                                type="text"
                                                className="barrage-text-input"
                                                value={selectedNote.barrageText || ''}
                                                onChange={(e) => updateNote(selectedNote.id, {
                                                    barrageText: e.target.value
                                                })}
                                                placeholder="输入弹幕显示的文字..."
                                                maxLength={50}
                                            />
                                            <span className="char-count">{(selectedNote.barrageText || '').length}/50</span>
                                        </div>

                                        <div className="setting-row">
                                            <label>适用环境：</label>
                                            <div className="tag-selector">
                                                {availableTags.environment.map(tag => (
                                                    <button
                                                        key={tag.id}
                                                        className={`tag-btn ${selectedNote.tags?.includes(tag.label) ? 'active' : ''}`}
                                                        style={{
                                                            '--tag-color': tag.color,
                                                            borderColor: selectedNote.tags?.includes(tag.label) ? tag.color : '#e5e7eb',
                                                            backgroundColor: selectedNote.tags?.includes(tag.label) ? `${tag.color}15` : 'transparent'
                                                        }}
                                                        onClick={() => toggleTag(selectedNote.id, tag.label)}
                                                    >
                                                        {tag.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="setting-row">
                                            <label>弹幕样式：</label>
                                            <div className="template-selector">
                                                {Object.entries(barrageStyleTemplates).map(([key, template]) => (
                                                    <button
                                                        key={key}
                                                        className={`template-mini-btn ${(selectedNote.barrageTemplate || 'modern') === key ? 'active' : ''}`}
                                                        onClick={() => updateNote(selectedNote.id, {
                                                            barrageTemplate: key
                                                        })}
                                                        title={template.description}
                                                    >
                                                        <span className="template-icon">{template.icon}</span>
                                                        <span className="template-name">{template.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="editor-footer">
                                <span>字数: {(selectedNote.content || '').length} | 自动保存已启用</span>
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

            {/* 模板选择Modal */}
            {showTemplateModal && (
                <div className="template-modal-overlay" onClick={() => setShowTemplateModal(false)}>
                    <div className="template-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="template-modal-header">
                            <h3>选择笔记模板</h3>
                            <button className="modal-close-btn" onClick={() => setShowTemplateModal(false)}>✕</button>
                        </div>
                        <div className="template-grid">
                            {noteTemplates.map(template => (
                                <div
                                    key={template.id}
                                    className="template-card"
                                    onClick={() => createNoteFromTemplate(template)}
                                >
                                    <div className="template-icon">{template.icon}</div>
                                    <h4>{template.name}</h4>
                                    <p>{template.description}</p>
                                    {template.category === 'alert' && (
                                        <span className="template-badge">⚡ 弹幕</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MindModule;
