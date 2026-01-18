import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDataPaths } from '../config/paths.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { MIND_DATA_DIR } = getDataPaths();

class MindStorage {
    constructor() {
        this.categories = ['hot', 'cold', 'neutral', 'general', 'insight', 'journal', 'lesson'];
    }

    /**
     * 初始化目录结构
     */
    async init() {
        try {
            await fs.mkdir(path.join(MIND_DATA_DIR, 'notes'), { recursive: true });
            await fs.mkdir(path.join(MIND_DATA_DIR, 'cards'), { recursive: true });

            for (const cat of this.categories) {
                await fs.mkdir(path.join(MIND_DATA_DIR, 'notes', cat), { recursive: true });
            }

            // 初始化自定义卡片文件
            const customCardsPath = path.join(MIND_DATA_DIR, 'cards', 'custom.json');
            try {
                await fs.access(customCardsPath);
            } catch {
                await fs.writeFile(customCardsPath, JSON.stringify({ cards: [] }, null, 2), 'utf-8');
            }

            console.log('✅ Mind data directory initialized');
        } catch (error) {
            console.error('Failed to initialize mind data directory:', error);
            throw error;
        }
    }

    /**
     * 保存笔记
     */
    async saveNote(note) {
        try {
            const filePath = path.join(MIND_DATA_DIR, 'notes', note.category, `${note.id}.json`);
            await fs.writeFile(filePath, JSON.stringify(note, null, 2), 'utf-8');
            await this.updateIndex();
            return { success: true };
        } catch (error) {
            console.error('Failed to save note:', error);
            throw error;
        }
    }

    /**
     * 读取单个笔记
     */
    async getNote(category, id) {
        try {
            const filePath = path.join(MIND_DATA_DIR, 'notes', category, `${id}.json`);
            const content = await fs.readFile(filePath, 'utf-8');
            return JSON.parse(content);
        } catch (error) {
            console.error(`Failed to get note ${id}:`, error);
            throw error;
        }
    }

    /**
     * 获取分类下所有笔记
     */
    async getNotesByCategory(category) {
        try {
            const dirPath = path.join(MIND_DATA_DIR, 'notes', category);
            const files = await fs.readdir(dirPath);

            const notes = await Promise.all(
                files
                    .filter(f => f.endsWith('.json'))
                    .map(async (file) => {
                        const content = await fs.readFile(path.join(dirPath, file), 'utf-8');
                        return JSON.parse(content);
                    })
            );

            // 按更新时间倒序排列
            return notes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        } catch (error) {
            console.error(`Failed to get notes for category ${category}:`, error);
            return [];
        }
    }

    /**
     * 获取所有笔记
     */
    async getAllNotes() {
        const allNotes = [];
        for (const cat of this.categories) {
            const notes = await this.getNotesByCategory(cat);
            allNotes.push(...notes);
        }
        return allNotes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }

    /**
     * 删除笔记
     */
    async deleteNote(category, id) {
        try {
            const filePath = path.join(MIND_DATA_DIR, 'notes', category, `${id}.json`);
            await fs.unlink(filePath);
            await this.updateIndex();
            return { success: true };
        } catch (error) {
            console.error(`Failed to delete note ${id}:`, error);
            throw error;
        }
    }

    /**
     * 更新索引文件
     */
    async updateIndex() {
        try {
            const stats = { totalNotes: 0, notesByCategory: {} };
            const recentNotes = [];

            for (const cat of this.categories) {
                const notes = await this.getNotesByCategory(cat);
                stats.notesByCategory[cat] = notes.length;
                stats.totalNotes += notes.length;
                recentNotes.push(...notes.slice(0, 3));
            }

            recentNotes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

            const index = {
                version: '1.0.0',
                lastUpdated: new Date().toISOString(),
                stats,
                recentNotes: recentNotes.slice(0, 10).map(n => ({
                    id: n.id,
                    category: n.category,
                    title: n.title,
                    updatedAt: n.updatedAt
                }))
            };

            await fs.writeFile(
                path.join(MIND_DATA_DIR, 'index.json'),
                JSON.stringify(index, null, 2),
                'utf-8'
            );
        } catch (error) {
            console.error('Failed to update index:', error);
        }
    }

    /**
     * 保存自定义心法卡片
     */
    async saveCustomCards(cards) {
        try {
            const filePath = path.join(MIND_DATA_DIR, 'cards', 'custom.json');
            await fs.writeFile(filePath, JSON.stringify({ cards }, null, 2), 'utf-8');
            return { success: true };
        } catch (error) {
            console.error('Failed to save custom cards:', error);
            throw error;
        }
    }

    /**
     * 读取自定义心法卡片
     */
    async getCustomCards() {
        try {
            const filePath = path.join(MIND_DATA_DIR, 'cards', 'custom.json');
            const content = await fs.readFile(filePath, 'utf-8');
            return JSON.parse(content).cards;
        } catch (error) {
            console.error('Failed to get custom cards:', error);
            return [];
        }
    }

    /**
     * 获取索引信息
     */
    async getIndex() {
        try {
            const filePath = path.join(MIND_DATA_DIR, 'index.json');
            const content = await fs.readFile(filePath, 'utf-8');
            return JSON.parse(content);
        } catch (error) {
            // 如果索引不存在，重新生成
            await this.updateIndex();
            return this.getIndex();
        }
    }
}

export default new MindStorage();
